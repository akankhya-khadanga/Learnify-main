import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// TODO [Phase 35]: Replace mock content generation with AI-powered adaptive content
// import { useAIContext } from '@/hooks/useAIContext';
// const aiContext = useAIContext({ contextType: 'content-generator' });
// Use aiContext.sendMessage() with difficulty/style/tone parameters for intelligent content creation
import { StylePresetSelector } from '@/components/adaptiveContent/StylePresetSelector';
import { DifficultyToneSelector } from '@/components/adaptiveContent/DifficultyToneSelector';
import { OutputCard } from '@/components/adaptiveContent/OutputCard';
import {
  ContentStyle,
  DifficultyLevel,
  ToneType,
  GeneratedContent,
  generateMockContent,
  TOPIC_SUGGESTIONS,
} from '@/mocks/adaptiveContent';
import {
  Sparkles,
  Upload,
  Trash2,
  Lightbulb,
  Video,
  Smile,
  Users,
  FileText,
  Award,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdaptiveContentPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<ContentStyle>('reels');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('high');
  const [tone, setTone] = useState<ToneType>('casual');
  const [generatedContent, setGeneratedContent] = useState<Record<ContentStyle, GeneratedContent | null>>({
    reels: null,
    meme: null,
    character: null,
    notes: null,
    exam: null,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<ContentStyle>('reels');

  const handleGenerateAll = async () => {
    if (!topic.trim()) {
      toast({
        title: '⚠️ Topic Required',
        description: 'Please enter a topic to generate content',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }

    setIsGenerating(true);
    toast({
      title: '✨ Generating Content...',
      description: 'Creating all formats for you',
      duration: 2000,
    });

    try {
      const styles: ContentStyle[] = ['reels', 'meme', 'character', 'notes', 'exam'];
      const results = await Promise.all(
        styles.map((style) =>
          generateMockContent({ topic, style, difficulty, tone })
        )
      );

      const newContent: Record<ContentStyle, GeneratedContent | null> = {
        reels: results[0],
        meme: results[1],
        character: results[2],
        notes: results[3],
        exam: results[4],
      };

      setGeneratedContent(newContent);
      setActiveTab(selectedStyle);

      toast({
        title: '🎉 Content Generated!',
        description: 'All formats are ready. Check out the tabs!',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: '❌ Generation Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateFormat = async (style: ContentStyle) => {
    setIsGenerating(true);
    try {
      const newContent = await generateMockContent({ topic, style, difficulty, tone });
      setGeneratedContent((prev) => ({ ...prev, [style]: newContent }));
      toast({
        title: '✅ Regenerated!',
        description: `${style} format has been refreshed`,
        duration: 2000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicSuggestion = (suggestion: string) => {
    setTopic(suggestion);
  };

  const hasAnyContent = Object.values(generatedContent).some((c) => c !== null);

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-[#C9B458]" />
            Adaptive Content Generator
          </h1>
          <p className="text-white/70 text-lg">
            Transform any topic into multiple engaging formats - reels, memes, dialogues, notes, and more!
          </p>
        </motion.div>

        {/* Control Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-6">
            <StylePresetSelector
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <DifficultyToneSelector
            difficulty={difficulty}
            tone={tone}
            onDifficultyChange={setDifficulty}
            onToneChange={setTone}
          />
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel - Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-[#C9B458]" />
                <h2 className="text-xl font-black text-white">Input Your Topic</h2>
              </div>

              {/* Topic Input */}
              <div className="space-y-4">
                <Textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter any topic, concept, or question you want explained..."
                  className="min-h-[200px] border-4 border-black bg-black/50 text-white placeholder:text-white/40 font-bold resize-none focus-visible:ring-[#C9B458]"
                />

                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{topic.length} characters</span>
                  {topic && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setTopic('')}
                      className="text-white/60 hover:text-white"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Quick Topic Suggestions */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-white/60 uppercase">Quick Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_SUGGESTIONS.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        onClick={() => handleTopicSuggestion(suggestion)}
                        className="cursor-pointer border-2 border-black bg-black/50 hover:bg-[#C9B458] text-white hover:text-black font-bold transition-all"
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* PDF Upload Placeholder */}
                <div className="border-4 border-dashed border-white/20 bg-black/20 p-6 text-center">
                  <Upload className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-sm text-white/60 font-bold mb-1">Upload PDF (Coming Soon)</p>
                  <p className="text-xs text-white/40">Drag & drop or click to upload</p>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerateAll}
                  disabled={isGenerating || !topic.trim()}
                  className="w-full border-4 border-black bg-[#C9B458] hover:bg-[#B8A347] text-black font-black text-lg py-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating All Formats...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Generate All Formats
                    </span>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Right Panel - Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3"
          >
            {!hasAnyContent ? (
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-4 mb-6">
                    <Video className="w-12 h-12 text-[#C9B458]" />
                    <Smile className="w-12 h-12 text-[#C27BA0]" />
                    <Users className="w-12 h-12 text-[#6DAEDB]" />
                  </div>
                  <h3 className="text-2xl font-black text-white">No Content Yet</h3>
                  <p className="text-white/60 max-w-md mx-auto">
                    Enter a topic on the left and click "Generate All Formats" to see your content
                    transformed into multiple engaging formats!
                  </p>
                </div>
              </Card>
            ) : (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentStyle)}>
                <TabsList className="grid grid-cols-5 gap-2 bg-transparent mb-4 h-auto p-0">
                  <TabsTrigger
                    value="reels"
                    className="border-4 border-black data-[state=active]:bg-[#C9B458] data-[state=active]:text-black bg-black/50 text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Reels
                  </TabsTrigger>
                  <TabsTrigger
                    value="meme"
                    className="border-4 border-black data-[state=active]:bg-[#C27BA0] data-[state=active]:text-black bg-black/50 text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Smile className="w-4 h-4 mr-1" />
                    Meme
                  </TabsTrigger>
                  <TabsTrigger
                    value="character"
                    className="border-4 border-black data-[state=active]:bg-[#6DAEDB] data-[state=active]:text-black bg-black/50 text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Character
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className="border-4 border-black data-[state=active]:bg-[#C9B458] data-[state=active]:text-black bg-black/50 text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Notes
                  </TabsTrigger>
                  <TabsTrigger
                    value="exam"
                    className="border-4 border-black data-[state=active]:bg-[#C27BA0] data-[state=active]:text-black bg-black/50 text-white font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Award className="w-4 h-4 mr-1" />
                    Exam
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  {(['reels', 'meme', 'character', 'notes', 'exam'] as ContentStyle[]).map((style) => (
                    <TabsContent key={style} value={style} className="mt-0">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {generatedContent[style] ? (
                          <OutputCard
                            content={generatedContent[style]!}
                            onRegenerate={() => handleRegenerateFormat(style)}
                            isLoading={isGenerating}
                          />
                        ) : (
                          <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-12">
                            <div className="text-center">
                              <p className="text-white/60">
                                Generate content to see the {style} format
                              </p>
                            </div>
                          </Card>
                        )}
                      </motion.div>
                    </TabsContent>
                  ))}
                </AnimatePresence>
              </Tabs>
            )}
          </motion.div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="border-4 border-[#6DAEDB] bg-[#6DAEDB]/10 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#6DAEDB] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-white text-sm mb-1">How It Works</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Our Adaptive Content Generator transforms any topic into multiple formats tailored to your
                  learning style. Choose your difficulty level, explanation tone, and content style - then watch
                  as we create reels scripts, memes, character dialogues, study notes, and exam prep materials
                  all from the same input. Perfect for visual learners, auditory learners, and everyone in between!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
