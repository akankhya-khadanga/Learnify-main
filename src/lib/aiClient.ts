/**
 * AI Client - Gemini API Integration Stub
 * 
 * Central AI service layer for all LLM-powered features in INTELLI-LEARN.
 * Routes requests to appropriate context handlers and returns mocked/real responses.
 * 
 * SECURITY: Never exposes API keys to logs, errors, or client-side code.
 */

// Feature context types for AI routing
export type AIContextType =
  | 'study-assistant'    // General AI chatbot assistance
  | 'roadmap'            // Learning roadmap generation
  | 'planner'            // Study planner and scheduling
  | 'therapist'          // Wellness and mental health support
  | 'content-generator'  // Adaptive content creation
  | 'mentor';            // 1-on-1 mentorship conversations

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface AIRequest {
  contextType: AIContextType;
  messages: AIMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: 'stop' | 'length' | 'content_filter';
}

export interface AIConfig {
  simulateGemini: boolean;
  apiKey?: string;
  model: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
}

// Configuration with environment variable support
const config: AIConfig = {
  simulateGemini: import.meta.env.VITE_SIMULATE_AI === 'true' || !import.meta.env.VITE_GEMINI_API_KEY,
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  model: 'gemini-pro',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2048,
};

/**
 * Generate mock response based on context type
 */
function generateMockResponse(request: AIRequest): AIResponse {
  const { contextType, messages } = request;
  const userMessage = messages[messages.length - 1]?.content || '';

  let content = '';

  switch (contextType) {
    case 'study-assistant':
      content = `I understand you're asking about: "${userMessage}". As your AI study assistant, I recommend breaking this topic into smaller concepts, creating flashcards, and practicing with real-world examples. Would you like me to generate a study plan for this topic?`;
      break;

    case 'roadmap':
      content = JSON.stringify({
        roadmap: {
          title: 'Learning Roadmap',
          duration: '12 weeks',
          milestones: [
            { week: 1, topic: 'Fundamentals', tasks: ['Read chapter 1', 'Complete exercises'] },
            { week: 4, topic: 'Intermediate Concepts', tasks: ['Project work', 'Group study'] },
            { week: 8, topic: 'Advanced Topics', tasks: ['Research paper', 'Presentation'] },
            { week: 12, topic: 'Final Assessment', tasks: ['Exam preparation', 'Review'] },
          ],
        },
      }, null, 2);
      break;

    case 'planner':
      content = JSON.stringify({
        schedule: {
          dailyTasks: [
            { time: '09:00', task: 'Review notes from yesterday', duration: '30 min' },
            { time: '10:00', task: 'Study new material', duration: '2 hours' },
            { time: '14:00', task: 'Practice exercises', duration: '1 hour' },
            { time: '16:00', task: 'Group discussion', duration: '1 hour' },
          ],
          weeklyGoals: [
            'Complete 3 chapters',
            'Finish 2 assignments',
            'Attend study group sessions',
          ],
        },
      }, null, 2);
      break;

    case 'therapist':
      content = `Thank you for sharing that with me. It's completely normal to feel overwhelmed with your studies sometimes. Let's work together to identify what's causing stress and develop healthy coping strategies. Remember, your mental health is just as important as your academic success. Would you like to try a quick breathing exercise or talk about specific concerns?`;
      break;

    case 'content-generator':
      content = JSON.stringify({
        generatedContent: {
          title: 'Adaptive Learning Module',
          difficulty: 'intermediate',
          sections: [
            { heading: 'Introduction', content: 'Overview of the topic...' },
            { heading: 'Key Concepts', content: 'Main ideas to understand...' },
            { heading: 'Practice Problems', content: 'Apply what you learned...' },
            { heading: 'Summary', content: 'Review the key points...' },
          ],
        },
      }, null, 2);
      break;

    case 'mentor':
      content = `I appreciate your question about "${userMessage}". As your mentor, I'd like to share some insights from experience. The key is to approach this step by step, building your understanding gradually. Let's explore this together - what specific aspect would you like to focus on first?`;
      break;

    default:
      content = 'I understand your query. Let me help you with that.';
  }

  return {
    content,
    usage: {
      promptTokens: messages.reduce((sum, msg) => sum + msg.content.length / 4, 0),
      completionTokens: content.length / 4,
      totalTokens: (messages.reduce((sum, msg) => sum + msg.content.length / 4, 0)) + (content.length / 4),
    },
    model: 'mock-gemini-pro',
    finishReason: 'stop',
  };
}

/**
 * Call real Gemini API (stub for future implementation)
 */
async function callGeminiAPI(request: AIRequest): Promise<AIResponse> {
  // TODO: Implement actual Gemini API call
  // This is a placeholder for when we integrate the real API
  
  if (!config.apiKey) {
    throw new Error('API key not configured');
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // For now, return mock response even with API key
  // Later, replace this with actual Gemini API call:
  /*
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': config.apiKey,
    },
    body: JSON.stringify({
      contents: request.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: request.temperature || config.defaultTemperature,
        maxOutputTokens: request.maxTokens || config.defaultMaxTokens,
      },
    }),
  });
  */

  return generateMockResponse(request);
}

/**
 * Main AI client function - routes to mock or real API based on config
 */
export async function queryAI(request: AIRequest): Promise<AIResponse> {
  try {
    // Validate request
    if (!request.messages || request.messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    // Add system prompt if provided
    if (request.systemPrompt) {
      request.messages.unshift({
        role: 'system',
        content: request.systemPrompt,
        timestamp: Date.now(),
      });
    }

    // Route to mock or real API
    if (config.simulateGemini) {
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateMockResponse(request);
    } else {
      return await callGeminiAPI(request);
    }
  } catch (error) {
    // Never expose API key or sensitive info in errors
    console.error('[AI Client] Error processing request:', {
      contextType: request.contextType,
      messageCount: request.messages.length,
      // Do NOT log: API key, full messages, or sensitive data
    });

    // Return graceful fallback
    return {
      content: 'I apologize, but I encountered an error processing your request. Please try again in a moment.',
      model: 'error-fallback',
      finishReason: 'stop',
    };
  }
}

/**
 * Stream AI response (for future real-time streaming)
 */
export async function* streamAI(request: AIRequest): AsyncGenerator<string> {
  // TODO: Implement streaming for real-time responses
  // For now, yield the full response in chunks
  
  const response = await queryAI(request);
  const words = response.content.split(' ');
  
  for (const word of words) {
    yield word + ' ';
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming delay
  }
}

/**
 * Get current AI configuration (safe to expose)
 */
export function getAIConfig(): Omit<AIConfig, 'apiKey'> {
  return {
    simulateGemini: config.simulateGemini,
    model: config.model,
    defaultTemperature: config.defaultTemperature,
    defaultMaxTokens: config.defaultMaxTokens,
  };
}

/**
 * Update AI configuration
 */
export function updateAIConfig(updates: Partial<Omit<AIConfig, 'apiKey'>>): void {
  Object.assign(config, updates);
}
