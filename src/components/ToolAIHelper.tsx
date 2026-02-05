import { useState } from 'react';
import { Bot, Send, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolAIHelperProps {
  toolName: string;
  toolType: string;
  workspaceType: 'frontend' | 'backend' | 'ml' | 'datascience' | 'cybersecurity';
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export function ToolAIHelper({ toolName, toolType, workspaceType }: ToolAIHelperProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/query-tutor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            query: inputValue,
            workspaceType,
            sessionContext: `Tool: ${toolName} (${toolType})`,
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'ai',
        content: '❌ Failed to get response. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="absolute bottom-0 right-0 w-80 z-10">
      {/* Floating Button (Collapsed State) */}
      {!isExpanded && (
        <Button
          onClick={() => setIsExpanded(true)}
          className="m-4 bg-blue-500 hover:bg-blue-600 text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          AI Help
        </Button>
      )}

      {/* Expanded Chat Panel */}
      {isExpanded && (
        <div className="bg-black/95 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg m-4 flex flex-col h-96">
          {/* Header */}
          <div className="bg-blue-500 border-b-4 border-black p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h4 className="font-black text-sm">{toolName} AI</h4>
                <p className="text-xs opacity-80">{workspaceType.toUpperCase()}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-white hover:bg-black/20"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-white/60 text-xs py-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-bold">Ask me anything about {toolName}!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-2 text-xs font-medium ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white border-2 border-black'
                      : 'bg-white text-black border-2 border-black'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-lg p-2 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                  <span className="text-xs text-white/70">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t-4 border-black p-2 bg-black/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this tool..."
                className="flex-1 px-3 py-2 bg-white/10 border-2 border-white/20 rounded text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-black border-2 border-black px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
