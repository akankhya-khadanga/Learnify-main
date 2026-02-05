/**
 * Sign Language Learning - Main Page
 * 
 * Mobile-first entry point for sign language education
 * Accessibility-focused, life-changing design
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mic,
  Zap,
  BookOpen,
  TrendingUp,
  Play,
  Settings,
  Download,
  Languages,
  Hand,
} from 'lucide-react';
import type {
  SignLanguageType,
  DifficultyLevel,
  LearningSpeed,
  SignLesson,
} from '@/types/signLanguage';
import { getGeminiLessonService } from '@/services/geminiLesson';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function SignLanguage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentLessons, setRecentLessons] = useState<SignLesson[]>([]);
  const [voiceInput, setVoiceInput] = useState(false);

  // Suggested topics for quick start
  const suggestedTopics = [
    { emoji: '🔢', title: 'Basic Mathematics', subject: 'math' },
    { emoji: '🌍', title: 'World Geography', subject: 'geography' },
    { emoji: '🧬', title: 'Human Biology', subject: 'science' },
    { emoji: '📖', title: 'English Grammar', subject: 'language' },
    { emoji: '💻', title: 'Introduction to Coding', subject: 'technology' },
    { emoji: '🎨', title: 'Art History', subject: 'arts' },
  ];

  // Start voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    recognition.onstart = () => {
      setVoiceInput(true);
      if ('vibrate' in navigator) navigator.vibrate([50, 100, 50]);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTopic(transcript);
      setVoiceInput(false);
    };

    recognition.onerror = () => {
      setVoiceInput(false);
    };

    recognition.onend = () => {
      setVoiceInput(false);
    };

    recognition.start();
  };

  // Navigate to setup
  const handleStartLesson = (initialTopic?: string) => {
    navigate('/sign-language/setup', {
      state: { topic: initialTopic || topic },
    });
  };

  // Load recent lessons
  useEffect(() => {
    // TODO: Load from Supabase
    setRecentLessons([]);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-6 pt-12 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Hand className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-black uppercase">
                <span className="text-primary">Sign</span>{' '}
                <span className="text-accent">Language</span>
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/sign-language/translator')}
                variant="ghost"
                size="icon"
                className="border-2 border-purple text-accent hover:bg-accent/20"
              >
                <Languages size={20} />
              </Button>
              <Button
                onClick={() => navigate('/sign-language/settings')}
                variant="ghost"
                size="icon"
                className="border-2 border-neon text-primary hover:bg-primary/20"
              >
                <Settings size={20} />
              </Button>
            </div>
          </div>

          {/* Mission statement */}
          <div className="mb-8">
            <p className="text-white text-lg leading-relaxed font-bold">
              Learn <span className="text-primary">any subject</span> through{' '}
              <span className="text-accent">sign language</span>.
              <br />
              Powered by AI. Built for accessibility.
            </p>
          </div>

          {/* Topic input */}
          <div className="mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="What do you want to learn?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && topic.trim()) {
                    handleStartLesson();
                  }
                }}
                className="w-full h-14 px-5 pr-14 bg-black/50 border-2 border-neon/30 text-white placeholder:text-white/50 focus:border-primary focus:ring-2 focus:ring-primary/20 font-bold"
              />

              {/* Voice input button */}
              <button
                onClick={handleVoiceInput}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 border-2 transition ${voiceInput
                  ? 'bg-primary text-black border-neon animate-pulse'
                  : 'bg-primary/20 text-primary border-neon/30 hover:bg-primary hover:text-black'
                  }`}
              >
                <Mic size={20} />
              </button>
            </div>

            {voiceInput && (
              <p className="mt-2 text-xs text-primary animate-pulse text-center font-bold">
                🎤 Listening...
              </p>
            )}
          </div>

          {/* Start button */}
          <Button
            onClick={() => handleStartLesson()}
            disabled={!topic.trim() || isGenerating}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-black text-base shadow-primary border-2 border-black disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                Generating Lesson...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Start Learning
              </>
            )}
          </Button>
        </div>
      </div>


      {/* Recent Lessons */}
      {recentLessons.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-sm font-black text-accent mb-4 flex items-center uppercase">
            <BookOpen size={16} className="mr-2" />
            Continue Learning
          </h2>

          <div className="space-y-4">
            {recentLessons.map((lesson) => (
              <Card
                key={lesson.id}
                onClick={() => navigate(`/sign-language/lesson/${lesson.id}`)}
                className="p-4 bg-card border border-border shadow-lg hover:shadow-xl cursor-pointer transition-all hover:border-primary/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-black text-white mb-1">{lesson.topic}</h3>
                    <p className="text-xs text-white/70 font-bold">
                      {lesson.completion_percentage}% complete • {lesson.gesture_count} gestures
                    </p>
                  </div>
                  <div className="p-2 bg-primary/20 border-2 border-neon">
                    <Play size={16} className="text-primary" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-2 bg-black border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: `${lesson.completion_percentage}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            onClick={() => navigate('/sign-language/translator')}
            className="p-5 bg-card border border-border shadow-lg hover:shadow-xl cursor-pointer transition-all hover:border-secondary/50"
          >
            <div className="flex flex-col items-start">
              <div className="p-2 bg-accent/20 border-2 border-purple mb-3">
                <Languages size={20} className="text-accent" />
              </div>
              <h3 className="font-black text-white mb-1">Text to Sign Translator</h3>
              <p className="text-sm text-white/70 font-bold">
                Convert any text to sign language with 3D avatars
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-card border border-primary/50 shadow-lg hover:shadow-xl transition-all">
            <div className="flex flex-col items-start">
              <div className="p-2 bg-primary/20 border-2 border-neon mb-3">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <h3 className="font-black text-white mb-1">Adaptive Learning</h3>
              <p className="text-sm text-white/70 font-bold">
                AI adjusts speed and difficulty to match your pace
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-card border border-secondary/50 shadow-lg hover:shadow-xl transition-all">
            <div className="flex flex-col items-start">
              <div className="p-2 bg-accent/20 border-2 border-purple mb-3">
                <Download size={20} className="text-accent" />
              </div>
              <h3 className="font-black text-white mb-1">Offline Learning</h3>
              <p className="text-sm text-white/70 font-bold">
                Download lessons for practice anywhere
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Support multiple sign languages badge */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center text-xs text-white/50 font-bold uppercase tracking-wider">
          Supporting ASL • ISL • BSL • CSL • JSL • LSF • DGS
        </div>
      </div>
    </div>
  );
}
