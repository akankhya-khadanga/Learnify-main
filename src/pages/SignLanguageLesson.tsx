/**
 * Sign Language Lesson View
 * 
 * Main learning interface with avatar, subtitles, and gesture-first controls
 * Mobile-optimized, accessibility-first experience
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  Camera,
  BookOpen,
  Award,
  RotateCcw,
  Download,
  Share2,
} from 'lucide-react';
import { SignVideoPlayer } from '@/components/signLanguage/SignVideoPlayer';
import { CWASAAvatar } from '@/components/signLanguage/CWASAAvatar';
import type { SignLesson } from '@/types/signLanguage';
import { getCCMAService } from '@/services/ccmaSignLanguage';
import { Button } from '@/components/ui/button';

export default function SignLanguageLesson() {
  const navigate = useNavigate();
  const location = useLocation();
  const lesson = location.state?.lesson as SignLesson;

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentGestureIndex, setCurrentGestureIndex] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [showMenu, setShowMenu] = useState(false);
  const [gestures, setGestures] = useState<any[]>([]);
  const [isLoadingGestures, setIsLoadingGestures] = useState(true);
  const [sigmlFiles, setSigmlFiles] = useState<string[]>([]);
  const [useRealAvatar, setUseRealAvatar] = useState(true);

  if (!lesson) {
    navigate('/sign-language');
    return null;
  }

  const currentSection = lesson.lesson_script.sections[currentSectionIndex];
  const totalSections = lesson.lesson_script.sections.length;
  const progress = Math.round(((currentSectionIndex + 1) / totalSections) * 100);

  // Load gestures for current section
  useEffect(() => {
    const loadGestures = async () => {
      setIsLoadingGestures(true);
      
      try {
                
        // Extract words from content for CWASA
        const words = currentSection.content
          .toLowerCase()
          .replace(/[^a-z\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 2)
          .slice(0, 15); // Limit to 15 words for performance

                
        // Convert words to SiGML file names (these should exist in /SignFiles/)
        const sigmlFileNames = words.map(word => word.toLowerCase());
        setSigmlFiles(sigmlFileNames);

        // Also load gestures for fallback video player
        const ccmaService = getCCMAService();
        await ccmaService.initialize();

        // Get gestures from current section or generate them
        if (currentSection.sign_sequence && currentSection.sign_sequence.length > 0) {
                    setGestures(currentSection.sign_sequence);
        } else {
                    const generatedGestures = await Promise.all(
            words.map(async (word) => {
              const cleanWord = word.replace(/[^a-zA-Z]/g, '');
                            return ccmaService.generateGesture(cleanWord, lesson.sign_language);
            })
          );

                    setGestures(generatedGestures.filter(g => g !== null));
        }
      } catch (error) {
        console.error('[Lesson] Failed to load gestures:', error);
      } finally {
        setIsLoadingGestures(false);
      }
    };

    loadGestures();
  }, [currentSectionIndex, lesson.sign_language]);

  // Handle section navigation
  const handleNextSection = () => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentGestureIndex(0);
    } else {
      // Lesson complete
      navigate('/sign-language/quiz', { state: { lesson } });
    }
  };

  const handlePreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentGestureIndex(0);
    }
  };

  // Get current subtitle
  const getCurrentSubtitle = () => {
    if (gestures[currentGestureIndex]) {
      return gestures[currentGestureIndex].word_or_phrase;
    }
    return currentSection.content.split('.')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
      <div className="max-w-md mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-4 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-neutral-800 text-white active:scale-95 transition"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Progress */}
          <div className="flex-1 mx-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-400">
                Section {currentSectionIndex + 1}/{totalSections}
              </span>
              <span className="text-xs text-amber-400 font-medium">{progress}%</span>
            </div>
            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-rose-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-xl bg-neutral-800 text-white active:scale-95 transition"
          >
            <BookOpen size={20} />
          </button>
        </div>

        {/* Main Video Player */}
        <div className="px-4 pt-6">
          {isLoadingGestures ? (
            <div className="w-full aspect-[9/16] bg-neutral-900 rounded-3xl flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
                <p className="text-neutral-400">Loading gestures...</p>
              </div>
            </div>
          ) : (
            <CWASAAvatar
              sigmlFiles={sigmlFiles}
              avatar="anna"
              speed={speed}
              autoPlay={false}
              showControls={true}
              onStart={() => {}}
              onComplete={() => {}}
            />
          )}
        </div>

        {/* Content Text */}
        <div className="px-6 py-6">
          <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-5">
            <h2 className="text-lg font-semibold mb-3 text-amber-400">
              {currentSection.content.split('.')[0]}
            </h2>
            <p className="text-neutral-300 leading-relaxed text-sm">
              {currentSection.content}
            </p>

            {currentSection.emphasis_points && currentSection.emphasis_points.length > 0 && (
              <div className="mt-4 pt-6 border-t border-neutral-800">
                <p className="text-xs text-neutral-500 mb-2">Key Points:</p>
                <ul className="space-y-1">
                  {currentSection.emphasis_points.map((point, index) => (
                    <li key={index} className="text-xs text-neutral-400 flex items-start">
                      <span className="text-amber-500 mr-2">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 space-y-3">
          {/* Practice Mode */}
          <button
            onClick={() =>
              navigate('/sign-language/practice', {
                state: { lesson, gesture: gestures[currentGestureIndex] },
              })
            }
            className="w-full p-4 bg-gradient-to-r from-rose-900/30 to-rose-800/30 hover:from-rose-900/40 hover:to-rose-800/40 border border-rose-800/50 rounded-2xl flex items-center justify-between active:scale-95 transition"
          >
            <div className="flex items-center">
              <div className="p-2 bg-rose-900/50 rounded-lg mr-3">
                <Camera size={20} className="text-rose-300" />
              </div>
              <div className="text-left">
                <div className="font-medium text-white">Try It Yourself</div>
                <div className="text-xs text-neutral-400">Practice with your camera</div>
              </div>
            </div>
            <ChevronLeft size={20} className="text-rose-300 rotate-180" />
          </button>

          {/* Section Navigation */}
          <div className="flex gap-3">
            {currentSectionIndex > 0 && (
              <Button
                onClick={handlePreviousSection}
                variant="outline"
                className="flex-1 h-12 bg-neutral-900 border-neutral-700 hover:bg-neutral-800 rounded-xl"
              >
                <ChevronLeft size={18} className="mr-2" />
                Previous
              </Button>
            )}

            <Button
              onClick={handleNextSection}
              className="flex-1 h-12 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-xl font-medium"
            >
              {currentSectionIndex < totalSections - 1 ? (
                <>
                  Next Section
                  <ChevronLeft size={18} className="ml-2 rotate-180" />
                </>
              ) : (
                <>
                  Complete & Quiz
                  <Award size={18} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" onClick={() => setShowMenu(false)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-80 bg-neutral-900 p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Lesson Overview</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 rounded-lg bg-neutral-800 text-white"
              >
                ✕
              </button>
            </div>

            {/* Topic */}
            <div className="mb-6">
              <h3 className="text-sm text-neutral-400 mb-2">Topic</h3>
              <p className="font-medium">{lesson.topic}</p>
            </div>

            {/* Sections */}
            <div className="mb-6">
              <h3 className="text-sm text-neutral-400 mb-3">Sections</h3>
              <div className="space-y-2">
                {lesson.lesson_script.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setCurrentSectionIndex(index);
                      setCurrentGestureIndex(0);
                      setShowMenu(false);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition ${
                      index === currentSectionIndex
                        ? 'bg-amber-900/30 border border-amber-700'
                        : 'bg-neutral-800 hover:bg-neutral-700'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      Section {index + 1}
                    </div>
                    <div className="text-xs text-neutral-400 line-clamp-2">
                      {section.content.split('.')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-between">
                <span className="text-sm">Download Lesson</span>
                <Download size={18} />
              </button>
              <button className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-between">
                <span className="text-sm">Share Progress</span>
                <Share2 size={18} />
              </button>
              <button
                onClick={handlePreviousSection}
                className="w-full p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl flex items-center justify-between"
              >
                <span className="text-sm">Restart Section</span>
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


