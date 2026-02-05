/**
 * useAIContext Hook
 * 
 * Manages AI conversation state and interactions for any feature context.
 * Handles loading states, errors, and streaming responses.
 */

import { useState, useCallback, useRef } from 'react';
import {
  queryAI,
  streamAI,
  type AIContextType,
  type AIMessage,
  type AIResponse,
} from '@/lib/aiClient';

export interface AIContextState {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  isStreaming: boolean;
  currentStreamContent: string;
}

export interface AIContextActions {
  sendMessage: (content: string) => Promise<void>;
  sendMessageStream: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  setSystemPrompt: (prompt: string) => void;
}

export interface UseAIContextOptions {
  contextType: AIContextType;
  initialMessages?: AIMessage[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  onResponse?: (response: AIResponse) => void;
  onError?: (error: Error) => void;
}

export function useAIContext({
  contextType,
  initialMessages = [],
  systemPrompt,
  temperature,
  maxTokens,
  onResponse,
  onError,
}: UseAIContextOptions): AIContextState & AIContextActions {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamContent, setCurrentStreamContent] = useState('');
  
  const systemPromptRef = useRef(systemPrompt);
  const lastUserMessageRef = useRef<string | null>(null);

  /**
   * Send a message and get response
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    lastUserMessageRef.current = content.trim();

    try {
      // Query AI with full conversation context
      const response = await queryAI({
        contextType,
        messages: [...messages, userMessage],
        systemPrompt: systemPromptRef.current,
        temperature,
        maxTokens,
      });

      // Add AI response to chat
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Callback with response details
      onResponse?.(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      
      console.error('[useAIContext] Error sending message:', {
        contextType,
        error: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [contextType, messages, temperature, maxTokens, onResponse, onError]);

  /**
   * Send a message with streaming response
   */
  const sendMessageStream = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setCurrentStreamContent('');
    setError(null);
    lastUserMessageRef.current = content.trim();

    try {
      // Stream AI response
      const stream = streamAI({
        contextType,
        messages: [...messages, userMessage],
        systemPrompt: systemPromptRef.current,
        temperature,
        maxTokens,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        fullContent += chunk;
        setCurrentStreamContent(fullContent);
      }

      // Add complete AI response to chat
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: fullContent.trim(),
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentStreamContent('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      
      console.error('[useAIContext] Error streaming message:', {
        contextType,
        error: errorMessage,
      });
    } finally {
      setIsStreaming(false);
    }
  }, [contextType, messages, temperature, maxTokens, onError]);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentStreamContent('');
    lastUserMessageRef.current = null;
  }, []);

  /**
   * Retry the last user message
   */
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current) return;

    // Remove last assistant message if it exists
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });

    // Resend the last user message
    await sendMessage(lastUserMessageRef.current);
  }, [sendMessage]);

  /**
   * Update system prompt
   */
  const setSystemPrompt = useCallback((prompt: string) => {
    systemPromptRef.current = prompt;
  }, []);

  return {
    // State
    messages,
    isLoading,
    error,
    isStreaming,
    currentStreamContent,
    
    // Actions
    sendMessage,
    sendMessageStream,
    clearMessages,
    retryLastMessage,
    setSystemPrompt,
  };
}
