/**
 * Production Context Service
 * 
 * Manages per-space memory, context building, and conversation threading.
 * Ensures all AI interactions are space-aware and contextually relevant.
 */

import { useUnifiedOSStore } from '@/store/unifiedOSStore';
import type { Space, ChatMessage, Note } from '@/types/unifiedOS';

interface SpaceContext {
  space: Space;
  recentMessages: ChatMessage[];
  notes: Note[];
  learningGoals: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
}

interface ContextPromptConfig {
  includeNotes?: boolean;
  includeMessages?: boolean;
  maxMessages?: number;
  maxNotes?: number;
  includeMetadata?: boolean;
}

/**
 * Build comprehensive context for AI prompts
 */
export function buildSpaceContext(
  spaceId: string,
  config: ContextPromptConfig = {}
): SpaceContext | null {
  const {
    includeNotes = true,
    includeMessages = true,
    maxMessages = 10,
    maxNotes = 5,
    includeMetadata = true,
  } = config;

  const store = useUnifiedOSStore.getState();
  const space = store.spaces.find((s) => s.id === spaceId);

  if (!space) {
    return null;
  }

  // Get recent chat messages for this space
  const recentMessages = includeMessages
    ? (store.chatMessages[spaceId] || []).slice(-maxMessages)
    : [];

  // Get notes for this space
  const notes = includeNotes
    ? (store.notes[spaceId] || []).slice(0, maxNotes)
    : [];

  // Infer learning level from space metadata or use default
  const level = space.metadata?.level || 'intermediate';

  // Extract learning goals
  const learningGoals = space.metadata?.learningGoals || [];

  return {
    space,
    recentMessages,
    notes,
    learningGoals,
    level,
  };
}

/**
 * Convert context to natural language prompt
 */
export function contextToPrompt(context: SpaceContext): string {
  const parts: string[] = [];

  // Core context
  parts.push(`You are helping a student learn ${context.space.subject}.`);
  
  if (context.space.topic) {
    parts.push(`Current topic: ${context.space.topic}`);
  }

  // Learning level
  parts.push(`Student level: ${context.level}`);

  // Learning goals
  if (context.learningGoals.length > 0) {
    parts.push(`Learning goals: ${context.learningGoals.join(', ')}`);
  }

  // Previous conversation
  if (context.recentMessages.length > 0) {
    parts.push('\nRecent conversation:');
    context.recentMessages.forEach((msg) => {
      const role = msg.role === 'user' ? 'Student' : 'Assistant';
      parts.push(`${role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`);
    });
  }

  // Notes context
  if (context.notes.length > 0) {
    parts.push('\nStudent\'s notes:');
    context.notes.forEach((note, idx) => {
      parts.push(`${idx + 1}. ${note.title || 'Untitled'}: ${note.content?.substring(0, 300) || ''}${(note.content?.length || 0) > 300 ? '...' : ''}`);
    });
  }

  return parts.join('\n');
}

/**
 * Build dynamic system prompt based on helper type and context
 */
export function buildSystemPrompt(
  helperType: 'chatgpt' | 'instructor' | 'classroom' | 'notebookllm',
  context: SpaceContext
): string {
  const baseContext = contextToPrompt(context);

  switch (helperType) {
    case 'chatgpt':
      return `${baseContext}

You are an AI tutor specialized in ${context.space.subject}. Your role is to:
- Provide clear, accurate explanations
- Break down complex topics into digestible parts
- Use examples relevant to ${context.level} level
- Encourage critical thinking
- Adapt your language to the student's level

Always maintain context from previous messages and their notes.`;

    case 'instructor':
      return `${baseContext}

You are a senior teacher and mentor with years of experience in ${context.space.subject}. Your role is to:
- Guide students strategically (don't just give answers)
- Ask Socratic questions to promote deeper understanding
- Provide constructive feedback
- Suggest next steps and learning paths
- Review their progress and note quality
- Encourage self-reflection

Use a supportive but challenging tone. Focus on the learning process, not just answers.`;

    case 'classroom':
      return `${baseContext}

You are creating structured educational content for ${context.space.subject}. Generate:
- Clear, well-organized notes with proper headings
- Practical examples that illustrate key concepts
- Practice problems or exercises
- Key takeaways and revision points

Adapt complexity to ${context.level} level. Use markdown formatting with:
- Headers (##, ###)
- Lists and bullet points
- Code blocks for technical content
- Math notation where appropriate`;

    case 'notebookllm':
      return `${baseContext}

You are creating presentation slides for ${context.space.subject}. Generate:
- Clear slide titles
- Concise bullet points (3-5 per slide)
- Logical flow from introduction to conclusion
- Speaker notes with additional context

Design for ${context.level} level students. Keep slides visual and digestible.`;

    default:
      return baseContext;
  }
}

/**
 * Summarize conversation for context efficiency
 */
export function summarizeContext(messages: ChatMessage[], maxTokens = 500): string {
  if (messages.length === 0) return '';

  // Simple summarization: take most recent and most relevant messages
  const recent = messages.slice(-5);
  
  let summary = 'Previous discussion:\n';
  recent.forEach((msg) => {
    const preview = msg.content.substring(0, 100);
    summary += `- ${msg.role}: ${preview}${msg.content.length > 100 ? '...' : ''}\n`;
  });

  return summary;
}

/**
 * Extract keywords from space for search/filtering
 */
export function extractSpaceKeywords(space: Space): string[] {
  const keywords: string[] = [space.subject];

  if (space.topic) {
    keywords.push(space.topic);
  }

  // Extract keywords from notes
  const store = useUnifiedOSStore.getState();
  const notes = store.notes[space.id] || [];
  
  notes.forEach((note) => {
    if (note.tags) {
      keywords.push(...note.tags);
    }
  });

  // Deduplicate and normalize
  return Array.from(new Set(keywords.map((k) => k.toLowerCase())));
}

/**
 * Check if context is stale and needs refresh
 */
export function isContextStale(lastUpdate: number, thresholdMs = 5 * 60 * 1000): boolean {
  return Date.now() - lastUpdate > thresholdMs;
}

/**
 * Memory isolation check - ensure no cross-space contamination
 */
export function validateContextIsolation(spaceId: string, data: any): boolean {
  // Ensure data belongs to the correct space
  if (data.spaceId && data.spaceId !== spaceId) {
    console.error(`[Context] Isolation violation: data from space ${data.spaceId} used in space ${spaceId}`);
    return false;
  }

  return true;
}

/**
 * Build search query from space context
 */
export function buildSearchQuery(space: Space, userQuery?: string): string {
  const parts: string[] = [];

  // Base subject/topic
  parts.push(space.subject);
  if (space.topic) {
    parts.push(space.topic);
  }

  // User query (highest priority)
  if (userQuery) {
    parts.push(userQuery);
  }

  // Add education context
  parts.push('educational');
  parts.push('tutorial');

  return parts.join(' ');
}
