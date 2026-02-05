// Supabase Edge Function: send-exam-emails
// Sends scheduled exam reminder emails using Resend API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

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
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Get current time in IST (Indian Standard Time - UTC+5:30)
    const istTime = new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000))

    // Get pending notifications that are due (using IST timezone)
    const { data: pendingNotifications, error: fetchError } = await supabase
      .from('exam_email_notifications')
      .select(`
        *,
        exam_schedules!inner(exam_name, exam_date, exam_time, subject, location)
      `)
      .eq('status', 'pending')
      .lte('scheduled_time', istTime.toISOString())
      .limit(50) // Process 50 at a time

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      throw fetchError
    }

    console.log(`Found ${pendingNotifications?.length || 0} pending notifications`)

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Send each email
    for (const notification of pendingNotifications || []) {
      try {
        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: 'INTELLI-LEARN Study Planner <notifications@edumite.app>',
            to: [notification.recipient_email],
            subject: notification.subject,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #C9B458 0%, #F4E5A1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .header h1 { color: #000; margin: 0; font-size: 24px; }
                    .content { background: #fff; padding: 30px; border: 4px solid #000; border-top: none; }
                    .exam-details { background: #f9f9f9; padding: 20px; border-left: 4px solid #C9B458; margin: 20px 0; }
                    .exam-details h2 { margin-top: 0; color: #C9B458; }
                    .exam-details p { margin: 8px 0; }
                    .cta-button { display: inline-block; background: #C9B458; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; border: 2px solid #000; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>📚 INTELLI-LEARN Exam Reminder</h1>
                    </div>
                    <div class="content">
                      <p>${notification.body}</p>
                      
                      <div class="exam-details">
                        <h2>${notification.exam_schedules.exam_name}</h2>
                        <p><strong>📅 Date:</strong> ${notification.exam_schedules.exam_date}</p>
                        ${notification.exam_schedules.exam_time ? `<p><strong>🕐 Time:</strong> ${notification.exam_schedules.exam_time}</p>` : ''}
                        ${notification.exam_schedules.subject ? `<p><strong>📖 Subject:</strong> ${notification.exam_schedules.subject}</p>` : ''}
                        ${notification.exam_schedules.location ? `<p><strong>📍 Location:</strong> ${notification.exam_schedules.location}</p>` : ''}
                      </div>
                      
                      <p>Open your INTELLI-LEARN Study Planner to review your preparation materials and schedule.</p>
                      
                      <a href="https://edumite.app/study-planner" class="cta-button">Open Study Planner →</a>
                      
                      <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        💡 <strong>Tip:</strong> Make sure you have all your materials ready and get a good night's sleep!
                      </p>
                    </div>
                    <div class="footer">
                      <p>This is an automated reminder from INTELLI-LEARN Study Planner.</p>
                      <p>To manage your notification preferences, visit your dashboard.</p>
                      <p>&copy; ${new Date().getFullYear()} INTELLI-LEARN. All rights reserved.</p>
                    </div>
                  </div>
                </body>
              </html>
            `
          })
        })

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text()
          throw new Error(`Resend API error: ${errorText}`)
        }

        // Mark as sent
        await supabase
          .from('exam_email_notifications')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', notification.id)

        results.sent++
        console.log(`✅ Sent email to ${notification.recipient_email} for exam: ${notification.exam_schedules.exam_name}`)

      } catch (emailError) {
        console.error(`❌ Failed to send email for notification ${notification.id}:`, emailError)

        // Mark as failed and increment retry count
        await supabase
          .from('exam_email_notifications')
          .update({
            status: notification.retry_count >= 3 ? 'failed' : 'pending',
            retry_count: notification.retry_count + 1,
            error_message: emailError.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', notification.id)

        results.failed++
        results.errors.push(`${notification.recipient_email}: ${emailError.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingNotifications?.length || 0,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors,
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
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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
