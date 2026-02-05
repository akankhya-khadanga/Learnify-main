/**
 * Production ChatGPT Helper (Gemini-Powered)
 * 
 * PRODUCTION FEATURES:
 * - Real Gemini API integration (no mocks)
 * - Dynamic prompts with space context
 * - Conversation memory and threading
 * - Subject-agnostic (works for ANY topic/level)
 * - Notes integration
 * - Production error handling
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useUnifiedOSStore } from '@/store/unifiedOSStore';
import { buildSpaceContext, buildSystemPrompt } from '@/services/contextService';
import { apiService } from '@/services/apiService';
import type { Helper, Space, ChatMessage } from '@/types/unifiedOS';

interface ChatGPTHelperProps {
  helper: Helper;
  space: Space;
}

export default function ChatGPTHelper({ helper, space }: ChatGPTHelperProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zustand store selectors with stable references
  const messages = useUnifiedOSStore((state) => state.chatMessages[space.id]) || [];
  const addChatMessage = useUnifiedOSStore((state) => state.addChatMessage);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Send message to Gemini API with full context
   */
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    // Add user message immediately
    addChatMessage(space.id, userMessage);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Build context-aware prompt
      const context = buildSpaceContext(space.id, {
        includeNotes: true,
        includeMessages: true,
        maxMessages: 10,
        maxNotes: 5,
      });

      if (!context) {
        throw new Error('Failed to build space context');
      }

      const systemPrompt = buildSystemPrompt('chatgpt', context);

      // Prepare conversation history for Gemini
      const history = messages.slice(-10).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Call Gemini API
      const response = await callGeminiAPI(
        systemPrompt,
        input,
        history
      );

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      addChatMessage(space.id, aiMessage);
    } catch (err) {
      console.error('[ChatGPT] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');

      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      addChatMessage(space.id, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  return (
    <div className="h-full flex flex-col bg-[#0f0f0f]">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">ChatGPT Assistant</h3>
            <p className="text-xs text-gray-500">
              AI tutor for {space.subject}
              {space.topic && ` • ${space.topic}`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <Bot className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                Start a conversation
              </h4>
              <p className="text-sm text-gray-500">
                Ask me anything about {space.subject}. I'll provide explanations,
                examples, and help you understand complex topics.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#1a1a1a] border border-gray-800 text-gray-100'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-100">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 text-gray-100">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 text-gray-100">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                        code: ({ inline, children, ...props }: any) =>
                          inline ? (
                            <code className="bg-gray-800 px-1 py-0.5 rounded text-sm text-emerald-400" {...props}>
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-gray-900 p-2 rounded text-sm overflow-x-auto" {...props}>
                              {children}
                            </code>
                          ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}

                  <div className="text-xs opacity-50 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${space.subject}...`}
            className="flex-1 min-h-[80px] bg-[#1a1a1a] border-gray-800 text-gray-100 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="self-end bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

/**
 * Call Gemini API with context (PRODUCTION)
 */
async function callGeminiAPI(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; parts: Array<{ text: string }> }>
): Promise<string> {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

  if (!API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  // Build contents array with system prompt + history + current message
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }],
    },
    ...history,
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const response = await apiService.request<any>(
    url,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    },
    {
      skipCache: true, // Don't cache AI responses
      cacheKey: `gemini-chat-${Date.now()}`,
    }
  );

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('No response from Gemini API');
  }

  const text = response.candidates[0].content.parts[0].text;
  return text;
}
