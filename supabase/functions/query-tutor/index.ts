// Supabase Edge Function: query-tutor
// Trust Engine for AI Tutor - Enforces boundaries and preferences

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const GEMINI_API_KEY = Deno.env.get('VITE_GEMINI_API_KEY') || ''
const GEMINI_MODEL = 'gemini-2.0-flash-exp'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { query, workspaceType, sessionContext, customPreference, customBoundary } = await req.json()

    // Validate input
    if (!query || !workspaceType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: query and workspaceType' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // STEP 1: Retrieve Boundaries & Preferences (with custom override support)
    let boundaryRules = customBoundary
    let preferenceRules = customPreference

    // If custom rules not provided, fetch from database
    if (!boundaryRules || !preferenceRules) {
      const { data: settings, error: settingsError } = await supabase
        .from('workspace_settings')
        .select('boundary_rules, preference_rules')
        .eq('workspace_type', workspaceType)
        .single()

      if (settingsError || !settings) {
        return new Response(
          JSON.stringify({ error: 'Workspace settings not found' }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        )
      }

      boundaryRules = boundaryRules || settings.boundary_rules
      preferenceRules = preferenceRules || settings.preference_rules
    }

    // STEP 2: Construct Mega Prompt with Trust Engine Rules
    const megaPrompt = `
You are an AI Tutor for the INTELLI-LEARN learning platform, powered by the Constrained Trust Engine.

🎯 WORKSPACE CONTEXT: ${workspaceType.toUpperCase()}

📋 BOUNDARY RULES (STRICT ENFORCEMENT):
${boundaryRules}

⚠️ CRITICAL INSTRUCTIONS:
- You MUST ONLY answer questions within the boundary rules above
- If the question is outside your boundary, respond with:
  "I apologize, but this question is outside my ${workspaceType} expertise boundary. I'm specifically designed to help with ${workspaceType}-related topics. Could you rephrase your question to focus on ${workspaceType} concepts?"
- NEVER make up information or hallucinate
- NEVER reference sources outside the allowed boundary
- If unsure, say "I don't have verified information about this specific topic"

✨ STYLE & FORMATTING PREFERENCES:
${preferenceRules}

${sessionContext ? `📚 SESSION CONTEXT:\n${sessionContext}\n` : ''}

👤 STUDENT QUERY:
${query}

🤖 YOUR RESPONSE (following all rules above):
`

    // STEP 3: Call Gemini API with Mega Prompt
    const geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: megaPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated'

    // STEP 4: Check if boundary was violated (simple heuristic)
    const boundaryViolated = aiResponse.toLowerCase().includes('outside my') ||
      aiResponse.toLowerCase().includes('outside the boundary')

    // STEP 5: Log query to database
    try {
      const { error: insertError } = await supabase.from('ai_tutor_queries').insert({
        workspace_type: workspaceType,
        query: query,
        response: aiResponse,
        boundary_violated: boundaryViolated,
        created_at: new Date().toISOString()
      })

      if (insertError) {
        console.error('Failed to log query:', insertError)
        // Don't fail the request if logging fails
      }
    } catch (logError) {
      console.error('Error logging query:', logError)
      // Continue execution even if logging fails
    }

    // STEP 6: Return Verified Response
    return new Response(
      JSON.stringify({
        response: aiResponse,
        boundaryViolated,
        workspaceType,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('Error in query-tutor:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})
