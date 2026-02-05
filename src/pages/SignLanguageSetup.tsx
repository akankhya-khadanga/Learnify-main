/**
 * Sign Language Setup Page
 * 
 * Personalize learning experience before starting lesson
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Sparkles, Zap } from 'lucide-react';
import type { SignLanguageType, DifficultyLevel, LearningSpeed } from '@/types/signLanguage';
import { getGeminiLessonService } from '@/services/geminiLesson';
import { Button } from '@/components/ui/button';

export default function SignLanguageSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const topic = location.state?.topic || '';

  const [signLanguage, setSignLanguage] = useState<SignLanguageType>('ASL');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [speed, setSpeed] = useState<LearningSpeed>('medium');
  const [sessionLength, setSessionLength] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signLanguages: { value: SignLanguageType; label: string; flag: string }[] = [
    { value: 'ASL', label: 'American (ASL)', flag: '🇺🇸' },
    { value: 'ISL', label: 'Indian (ISL)', flag: '🇮🇳' },
    { value: 'BSL', label: 'British (BSL)', flag: '🇬🇧' },
    { value: 'CSL', label: 'Chinese (CSL)', flag: '🇨🇳' },
    { value: 'JSL', label: 'Japanese (JSL)', flag: '🇯🇵' },
    { value: 'LSF', label: 'French (LSF)', flag: '🇫🇷' },
    { value: 'DGS', label: 'German (DGS)', flag: '🇩🇪' },
  ];

  const difficulties: { value: DifficultyLevel; label: string; description: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'New to this topic' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some familiarity' },
    { value: 'advanced', label: 'Advanced', description: 'Solid understanding' },
    { value: 'expert', label: 'Expert', description: 'Deep knowledge' },
  ];

  const speeds: { value: LearningSpeed; label: string; icon: string }[] = [
    { value: 'slow', label: 'Slow', icon: '🐢' },
    { value: 'medium', label: 'Medium', icon: '🚶' },
    { value: 'fast', label: 'Fast', icon: '🏃' },
  ];

  const handleGenerateLesson = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {

      const lessonService = getGeminiLessonService();
      const result = await lessonService.generateLesson({
        topic,
        difficulty,
        signLanguage,
        learningSpeed: speed,
        sessionLengthMinutes: sessionLength,
      });

      
      // Navigate to lesson view
      navigate('/sign-language/lesson', {
        state: { lesson: result.lesson },
      });
    } catch (error: any) {
      console.error('[Setup] Failed to generate lesson:', error);
      
      // Set user-friendly error message
      const message = error.message || 'Failed to generate lesson. Please try again.';
      setErrorMessage(message);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-neutral-800/50 text-neutral-300 active:scale-95 transition mr-4"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">Personalize Your Lesson</h1>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-red-500 mr-3">⚠️</div>
              <div>
                <div className="font-medium text-red-400 mb-1">Error Generating Lesson</div>
                <div className="text-sm text-red-300">{errorMessage}</div>
                {errorMessage.includes('quota') && (
                  <div className="mt-2 text-xs text-red-400">
                    Tip: Wait a few minutes or check your API quota at{' '}
                    <a 
                      href="https://aistudio.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-red-300"
                    >
                      Google AI Studio
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Topic display */}
        <div className="mb-8 p-4 bg-gradient-to-r from-amber-900/30 to-rose-900/30 border border-amber-900/30 rounded-2xl">
          <div className="text-xs text-neutral-400 mb-1">Learning Topic</div>
          <div className="text-lg font-medium">{topic}</div>
        </div>

        {/* Sign Language Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Sign Language
          </label>
          <div className="grid grid-cols-1 gap-2">
            {signLanguages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setSignLanguage(lang.value)}
                className={`p-4 rounded-xl text-left transition ${
                  signLanguage === lang.value
                    ? 'bg-amber-900/30 border-2 border-amber-600'
                    : 'bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Skill Level */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Your Skill Level
          </label>
          <div className="grid grid-cols-2 gap-3">
            {difficulties.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setDifficulty(diff.value)}
                className={`p-4 rounded-xl text-left transition ${
                  difficulty === diff.value
                    ? 'bg-amber-900/30 border-2 border-amber-600'
                    : 'bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium mb-1">{diff.label}</div>
                <div className="text-xs text-neutral-400">{diff.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Learning Speed */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Learning Speed
          </label>
          <div className="grid grid-cols-3 gap-3">
            {speeds.map((s) => (
              <button
                key={s.value}
                onClick={() => setSpeed(s.value)}
                className={`p-4 rounded-xl text-center transition ${
                  speed === s.value
                    ? 'bg-amber-900/30 border-2 border-amber-600'
                    : 'bg-neutral-900 border-2 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="text-sm font-medium">{s.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Session Length */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-neutral-300 mb-3">
            Session Length: {sessionLength} seconds
          </label>
          <input
            type="range"
            min="20"
            max="60"
            step="5"
            value={sessionLength}
            onChange={(e) => setSessionLength(Number(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>20 sec</span>
            <span>60 sec</span>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateLesson}
          disabled={isGenerating}
          className="w-full h-14 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-2xl font-medium text-base shadow-lg shadow-amber-900/20 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 animate-spin" />
              Generating Your Lesson...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-5 w-5" />
              Generate Lesson
            </>
          )}
        </Button>

        {/* Info */}
        <div className="mt-6 p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
          <p className="text-xs text-neutral-400 text-center">
            AI will create a custom lesson optimized for visual learning and sign language teaching
          </p>
        </div>
      </div>
    </div>
  );
}


