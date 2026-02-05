import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Send, ChevronDown, ChevronUp, Sparkles, AlertCircle, 
  Loader2, MessageCircle, Shield, CheckCircle, MoreVertical, Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface AITutorPanelProps {
  workspaceType: 'frontend' | 'backend' | 'ml' | 'datascience' | 'cybersecurity';
  sessionContext?: string; // Optional context from current session
  toolName?: string; // Specific tool name for personalized help
  position?: 'side' | 'bottom'; // Panel position
  themeColor?: 'gold' | 'pink' | 'blue';
  onClose?: () => void; // Optional close callback
}

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  boundaryViolated?: boolean;
}

export function AITutorPanel({ 
  workspaceType, 
  sessionContext,
  toolName,
  position = 'side',
  themeColor = 'gold',
  onClose
}: AITutorPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [preferenceRules, setPreferenceRules] = useState('');
  const [boundaryRules, setBoundaryRules] = useState('');
  const [rulesLoading, setRulesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing rules on mount
  useEffect(() => {
    loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceType]);

  // Add welcome message on mount
  useEffect(() => {
    const welcomeMessage = toolName 
      ? `👋 Welcome! I'm your AI assistant for **${toolName}**. I'm specialized to help you with this specific tool in your ${workspaceType.toUpperCase()} workspace. Ask me anything about using ${toolName}!`
      : `👋 Welcome to your ${workspaceType.toUpperCase()} AI Tutor! I'm here to help you learn within verified academic boundaries. Ask me anything related to ${workspaceType}!`;
    
    setMessages([{
      id: 'welcome',
      type: 'system',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  }, [workspaceType, toolName]);

  const loadRules = async () => {
    setRulesLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/workspace_settings?workspace_type=eq.${workspaceType}`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setPreferenceRules(data[0].preference_rules || '');
          setBoundaryRules(data[0].boundary_rules || '');
        }
      }
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setRulesLoading(false);
    }
  };

  const saveRules = async () => {
    setRulesLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/workspace_settings?workspace_type=eq.${workspaceType}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            preference_rules: preferenceRules,
            boundary_rules: boundaryRules,
            updated_at: new Date().toISOString()
          })
        }
      );

      if (response.ok) {
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          type: 'system',
          content: '✅ Settings saved successfully! Your preferences and boundaries have been updated.',
          timestamp: new Date()
        }]);
        setShowSettings(false);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setRulesLoading(false);
    }
  };

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
    setError(null);

    try {
      // Call Supabase Edge Function (Trust Engine)
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
            sessionContext,
            customPreference: preferenceRules || undefined,
            customBoundary: boundaryRules || undefined
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from AI Tutor');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        boundaryViolated: data.boundaryViolated
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: '❌ Failed to connect to AI Tutor. Please try again.',
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

  const themeColors = {
    gold: {
      primary: 'bg-[#C9B458] text-black',
      secondary: 'bg-[#C9B458]/20 text-[#C9B458]',
      border: 'border-[#C9B458]',
      text: 'text-[#C9B458]',
      hover: 'hover:bg-[#C9B458]/80'
    },
    pink: {
      primary: 'bg-[#C27BA0] text-white',
      secondary: 'bg-[#C27BA0]/20 text-[#C27BA0]',
      border: 'border-[#C27BA0]',
      text: 'text-[#C27BA0]',
      hover: 'hover:bg-[#C27BA0]/80'
    },
    blue: {
      primary: 'bg-[#6DAEDB] text-black',
      secondary: 'bg-[#6DAEDB]/20 text-[#6DAEDB]',
      border: 'border-[#6DAEDB]',
      text: 'text-[#6DAEDB]',
      hover: 'hover:bg-[#6DAEDB]/80'
    }
  };

  const theme = themeColors[themeColor];

  // Collapsed State (Floating Button)
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`fixed ${position === 'side' ? 'right-6 bottom-6' : 'right-6 bottom-6'} z-50`}
      >
        <Button
          onClick={() => setIsExpanded(true)}
          className={`${theme.primary} ${theme.hover} font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black rounded-full w-16 h-16 flex items-center justify-center relative`}
        >
          <Bot className="w-8 h-8" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 border-2 border-black rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </Button>
      </motion.div>
    );
  }

  // Expanded State (Panel)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          x: position === 'side' ? 400 : 0,
          y: position === 'bottom' ? 400 : 0,
          opacity: 0 
        }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ 
          x: position === 'side' ? 400 : 0,
          y: position === 'bottom' ? 400 : 0,
          opacity: 0 
        }}
        className={`fixed ${
          position === 'side' 
            ? 'right-6 top-24 bottom-6 w-96' 
            : 'left-6 right-6 bottom-6 h-96'
        } z-50`}
      >
        <Card className="h-full bg-[#0a0a0a]/95 backdrop-blur-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          {/* Header */}
          <div className={`${theme.primary} border-b-4 border-black p-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-black text-lg">AI TUTOR</h3>
                <p className="text-xs opacity-80 font-bold">
                  {toolName ? `${toolName} • ${workspaceType.toUpperCase()}` : workspaceType.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white border-2 border-black font-black text-xs flex items-center gap-1">
                <Shield className="w-3 h-3" />
                VERIFIED
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-current hover:bg-black/20"
                title="Settings"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  onClose?.();
                }}
                className="text-current hover:bg-black/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b-4 border-black bg-black/40 p-4 space-y-4 max-h-[50%] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-white" />
                  <h4 className="font-black text-white">TRUST ENGINE SETTINGS</h4>
                </div>
                <Button
                  onClick={saveRules}
                  disabled={rulesLoading}
                  className="bg-green-500 hover:bg-green-600 text-white font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs"
                >
                  {rulesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE'}
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-white font-black text-sm mb-2 block flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9B458]" />
                    PREFERENCE RULES
                  </label>
                  <p className="text-xs text-white/60 mb-2 font-medium">
                    Define how the AI should respond (e.g., "Use simple English", "Provide code examples")
                  </p>
                  <textarea
                    value={preferenceRules}
                    onChange={(e) => setPreferenceRules(e.target.value)}
                    placeholder="Answer as a helpful tutor. Use clear structure, examples, and professional tone..."
                    className="w-full h-24 bg-white/10 border-2 border-white/20 rounded-lg p-3 text-white text-sm font-medium focus:outline-none focus:border-[#C9B458] resize-none"
                  />
                </div>

                <div>
                  <label className="text-white font-black text-sm mb-2 block flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    BOUNDARY RULES
                  </label>
                  <p className="text-xs text-white/60 mb-2 font-medium">
                    Set strict limits on what the AI can discuss (e.g., "Only use React documentation", "No Python topics")
                  </p>
                  <textarea
                    value={boundaryRules}
                    onChange={(e) => setBoundaryRules(e.target.value)}
                    placeholder="You must stay within frontend development topics. Do not answer backend questions..."
                    className="w-full h-24 bg-white/10 border-2 border-white/20 rounded-lg p-3 text-white text-sm font-medium focus:outline-none focus:border-green-500 resize-none"
                  />
                </div>
              </div>

              <div className="bg-orange-500/20 border-2 border-orange-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-orange-200 font-medium">
                    <p className="font-black mb-1">How it works:</p>
                    <p>These rules are sent to the AI with every query. Preference rules guide response style, while boundary rules enforce strict topic limits. Empty fields use default academic settings.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 border-2 border-black ${
                    message.type === 'user'
                      ? `${theme.primary} shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`
                      : message.type === 'system'
                      ? 'bg-white/10 text-white/70 border-white/20'
                      : 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {message.boundaryViolated && (
                    <div className="flex items-center gap-2 mb-2 text-orange-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">Boundary Notice</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap font-medium leading-relaxed">
                    {message.content}
                  </p>
                  <p className="text-xs opacity-60 mt-2 font-bold">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-lg p-3 border-2 border-white/20 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-white/70 font-bold">AI Tutor is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-4 border-black p-4 bg-black/30">
            {error && (
              <div className="mb-2 p-2 bg-red-500/20 border-2 border-red-500/50 rounded text-red-500 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your current topic..."
                disabled={isLoading}
                className="flex-1 bg-black/50 border-2 border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:border-white focus:outline-none resize-none h-12 font-medium"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className={`${theme.primary} ${theme.hover} font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-white/40 mt-2 font-bold flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Protected by Constrained Trust Engine
            </p>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact Trigger Button (for embedding in existing UI)
interface AITutorTriggerProps {
  onClick: () => void;
  variant?: 'icon' | 'button';
  themeColor?: 'gold' | 'pink' | 'blue';
  label?: string;
}

export function AITutorTrigger({ 
  onClick, 
  variant = 'icon',
  themeColor = 'gold',
  label = 'Ask AI Tutor'
}: AITutorTriggerProps) {
  const themeColors = {
    gold: 'bg-[#C9B458] text-black hover:bg-[#C9B458]/80',
    pink: 'bg-[#C27BA0] text-white hover:bg-[#C27BA0]/80',
    blue: 'bg-[#6DAEDB] text-black hover:bg-[#6DAEDB]/80'
  };

  if (variant === 'icon') {
    return (
      <Button
        size="sm"
        onClick={onClick}
        className={`${themeColors[themeColor]} font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all`}
      >
        <Bot className="w-4 h-4 mr-1" />
        {label}
      </Button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${themeColors[themeColor]} p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all`}
      title="Ask AI Tutor"
    >
      <Bot className="w-5 h-5" />
    </button>
  );
}
