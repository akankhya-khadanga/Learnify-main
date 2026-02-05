import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { chatWithGemini } from '@/lib/gemini';
// TODO [Phase 35]: Replace chatWithGemini with useAIContext hook
// import { useAIContext } from '@/hooks/useAIContext';
// const aiContext = useAIContext({ contextType: 'study-assistant' });
import { TranslatedText } from '@/components/TranslatedText';
import { useTranslatedText } from '@/hooks/useTranslation';
import { Sparkles, Send, Mic, Volume2, Languages, Loader2, MessageSquare, Clock, BookOpen, Settings as SettingsIcon } from 'lucide-react';
import SpotlightCard from '@/components/3D/SpotlightCard';
import { generateMockAIResponse, MOCK_SUGGESTED_PROMPTS, MOCK_CONVERSATIONS, USE_MOCK_DATA, mockDelay, MOCK_VERIFIED_SOURCES, MOCK_VERIFIED_CONVERSATION, MOCK_COURSE_INFO } from '@/mocks';
import { VerificationBanner } from '@/components/VerificationBanner';
import { ModeToggle } from '@/components/ModeToggle';
import { CitationCard } from '@/components/CitationCard';
import { SourcePanel } from '@/components/SourcePanel';
import { ReasoningDrawer } from '@/components/ReasoningDrawer';
import { InstructorSourceManager } from '@/components/InstructorSourceManager';
import { VerifiedAIMessage } from '@/mocks/verifiedSources';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export default function AIBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [verifiedMessages, setVerifiedMessages] = useState<VerifiedAIMessage[]>(MOCK_VERIFIED_CONVERSATION);
  const [mode, setMode] = useState<'verified' | 'general'>('verified');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSourcePanel, setShowSourcePanel] = useState(true);
  const [showSourceManager, setShowSourceManager] = useState(false);
  const [selectedMessageForReasoning, setSelectedMessageForReasoning] = useState<VerifiedAIMessage | null>(null);
  const [sources, setSources] = useState(MOCK_VERIFIED_SOURCES);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const placeholderText = useTranslatedText('Ask me anything...');

  const currentMessages = mode === 'verified' ? verifiedMessages : messages;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    const currentInput = input;
    setInput('');
    setIsLoading(true);

    if (mode === 'verified') {
      // Verified mode: use verified messages
      const newVerifiedUserMsg: VerifiedAIMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: currentInput,
        timestamp: new Date().toISOString(),
      };
      setVerifiedMessages(prev => [...prev, newVerifiedUserMsg]);

      try {
        await mockDelay(1200);
        const aiResponse: VerifiedAIMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: generateMockAIResponse(currentInput),
          timestamp: new Date().toISOString(),
          citations: [
            {
              sourceId: sources[0].id,
              sourceTitle: sources[0].title,
              page: Math.floor(Math.random() * 50) + 1,
              confidence: Math.floor(Math.random() * 15) + 85,
              quote: 'Sample quote from verified source supporting this answer.',
            },
          ],
          hallucinationCheck: {
            passed: true,
            confidence: 96,
            flags: [],
          },
          reasoning: {
            confidenceScore: 94,
            sourcesConsulted: [sources[0].id, sources[1]?.id].filter(Boolean),
            methodology: 'Answer generated from verified course materials with cross-referencing.',
          },
        };
        setVerifiedMessages(prev => [...prev, aiResponse]);
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to get AI response.';
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // General mode: use regular messages
      setMessages((prev) => [...prev, userMessage]);

      try {
        let responseContent: string;

        if (USE_MOCK_DATA) {
          await mockDelay(800);
          responseContent = generateMockAIResponse(currentInput);
        } else {
          responseContent = await chatWithGemini([...messages, userMessage]);
        }

        const aiMessage: Message = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to get AI response. Please try again.';
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
        const fallbackMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or rephrase your question.',
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, fallbackMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleVoiceInput = async () => {
    console.log('Microphone button clicked');

    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser. Please use Chrome or Edge.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        toast({
          title: 'Listening...',
          description: 'Speak now',
        });
      };

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result:', event);
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        setInput(transcript);
        setIsListening(false);
        toast({
          title: 'Got it!',
          description: `You said: "${transcript}"`,
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        let errorMessage = 'An error occurred';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not found or not accessible.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }

        toast({
          title: 'Speech Recognition Error',
          description: errorMessage,
          variant: 'destructive',
        });
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      console.log('Starting speech recognition...');
      recognition.start();
    } catch (error) {
      console.error('Microphone permission error:', error);
      toast({
        title: 'Permission Denied',
        description: 'Please allow microphone access in your browser settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-800">
      <div className="container mx-auto h-[calc(100vh-6rem)] px-4 py-6">
        <div className="grid h-full gap-6 lg:grid-cols-[1fr_300px]">
          {/* Chat Area */}
          <Card className="flex flex-col border-4 border-black shadow-pink-brutal bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-purple/30 p-4 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                <h1 className="text-2xl font-black uppercase text-primary"><TranslatedText text="AI Study Assistant" /></h1>
              </div>
              <div className="flex gap-2">
                <ModeToggle mode={mode} onModeChange={setMode} disabled={isLoading} />
                {mode === 'verified' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSourcePanel(!showSourcePanel)}
                      title="Toggle Sources"
                      className="text-green-500 hover:bg-green-500/20"
                    >
                      <BookOpen className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSourceManager(true)}
                      title="Manage Sources"
                      className="text-[#C9B458] hover:bg-[#C9B458]/20"
                    >
                      <SettingsIcon className="h-5 w-5" />
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon" title="Translate" className="text-primary hover:bg-primary/20">
                  <Languages className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" title="Read aloud" className="text-accent hover:bg-accent/20">
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-white dark:bg-slate-800">
              <div className="space-y-4">
                {mode === 'verified' && <VerificationBanner course={MOCK_COURSE_INFO} mode={mode} />}

                {currentMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center text-white">
                      <Sparkles className="mx-auto mb-4 h-16 w-16 text-primary" />
                      <p className="text-2xl font-black uppercase text-primary mb-2"><TranslatedText text="Start a conversation" /></p>
                      <p className="text-lg font-bold text-white/70"><TranslatedText text="Ask me anything about your studies!" /></p>
                    </div>
                  </div>
                ) : (
                  currentMessages.map((message, index) => {
                    const isVerified = mode === 'verified' && 'citations' in message;
                    return (
                      <div key={index}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-6 py-4 ${message.role === 'user'
                              ? 'bg-primary text-black border border-neon/30 shadow-primary font-bold'
                              : isVerified
                                ? 'bg-white dark:bg-slate-800 text-white border-4 border-green-500 shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] font-bold'
                                : 'bg-accent text-white border border-neon/30 shadow-pink-heavy font-bold'
                              }`}
                          >
                            {message.role === 'user' ? (
                              <p className="text-sm">{message.content}</p>
                            ) : (
                              <div className="text-sm prose prose-invert max-w-none">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                    code: ({ inline, children }: any) =>
                                      inline ? (
                                        <code className="bg-black/30 px-1 py-0.5 rounded text-primary">{children}</code>
                                      ) : (
                                        <code className="block bg-black/50 p-2 rounded my-2 overflow-x-auto">{children}</code>
                                      ),
                                    pre: ({ children }) => <pre className="bg-black/50 p-3 rounded my-2 overflow-x-auto">{children}</pre>,
                                    h1: ({ children }) => <h1 className="text-xl font-black mb-2 text-primary">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-lg font-black mb-2 text-primary">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-base font-bold mb-1 text-primary">{children}</h3>,
                                    strong: ({ children }) => <strong className="font-black text-primary">{children}</strong>,
                                    a: ({ href, children }) => <a href={href} className="text-blue underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </motion.div>

                        {/* Citations for verified messages */}
                        {isVerified && message.role === 'assistant' && (message as VerifiedAIMessage).citations && (
                          <div className="ml-12 mt-2 space-y-2">
                            {(message as VerifiedAIMessage).citations!.map((citation, citIndex) => (
                              <CitationCard
                                key={citIndex}
                                citation={citation}
                                onClick={() => setSelectedMessageForReasoning(message as VerifiedAIMessage)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-neon/30 p-4 bg-white dark:bg-slate-800">
              <div className="flex gap-2">
                <Input
                  placeholder={placeholderText}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  disabled={isLoading}
                  className="border border-neon/30 font-bold text-white placeholder:text-white/50 bg-black/50 focus-visible:ring-neon focus-visible:ring-2"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={isLoading}
                  onClick={handleVoiceInput}
                  className={`border border-neon/30 ${isListening ? 'bg-primary text-black animate-pulse' : 'bg-primary/20 text-primary hover:bg-primary hover:text-black'} font-black`}
                >
                  <Mic className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="border border-purple bg-accent text-white hover:bg-accent/80 shadow-pink-heavy font-black"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Suggestions Sidebar */}
          <div className="hidden lg:block space-y-4">
            {/* Recent Conversations */}
            <SpotlightCard spotlightColor="rgba(255, 20, 147, 0.3)">
              <Card className="p-6 border border-purple shadow-pink-brutal bg-white dark:bg-slate-800">
                <h3 className="mb-4 text-xl font-black uppercase text-accent flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <TranslatedText text="History" />
                </h3>
                <div className="space-y-2">
                  {MOCK_CONVERSATIONS.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-2 border border-purple/30 rounded bg-black/30 hover:bg-accent/10 cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-bold text-accent truncate">{conv.title}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-white/60">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(conv.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </SpotlightCard>
          </div>
        </div>
      </div>

      {/* Source Panel */}
      {mode === 'verified' && (
        <SourcePanel
          sources={sources}
          isOpen={showSourcePanel}
          onClose={() => setShowSourcePanel(false)}
        />
      )}

      {/* Reasoning Drawer */}
      <ReasoningDrawer
        message={selectedMessageForReasoning}
        isOpen={!!selectedMessageForReasoning}
        onClose={() => setSelectedMessageForReasoning(null)}
      />

      {/* Instructor Source Manager */}
      <InstructorSourceManager
        sources={sources}
        isOpen={showSourceManager}
        onClose={() => setShowSourceManager(false)}
        onSourcesUpdate={setSources}
      />
    </div>
  );
}

