/**
 * Sign Language Avatar Renderer Component
 * 
 * Uses CWASA (Communication With Avatars - Signing Avatars) for real 3D sign language rendering
 * Supports Indian Sign Language with 848+ signs from shoebham/text_to_isl
 */

import { useEffect, useRef, useState } from 'react';
import type { SignGesture } from '@/types/signLanguage';

interface CWASAAvatarConstructor {
  new (config: {
    containerDiv: HTMLElement;
    avatarName: string;
    avatarSizePx: number;
    backgroundColour: string;
    playSpeed: number;
    sigmlPath: string;
    jasPath: string;
  }): CWASAAvatarInstance;
}

interface CWASAAvatarInstance {
  playText: (text: string, callback?: () => void) => void;
  stop: () => void;
}

declare global {
  interface Window {
    CWASASigningAvatar: CWASAAvatarConstructor;
    cwasaAvatarAPI: unknown;
  }
}

interface SignAvatarProps {
  gesture?: SignGesture;
  word?: string;
  isPlaying?: boolean;
  speed?: number;
  onComplete?: () => void;
  avatarName?: 'Marc' | 'Anna' | 'Luna' | 'Siggi' | 'Francoise';
  backgroundColor?: string;
}

// Word translations for common Indian languages to English
const WORD_TRANSLATIONS: Record<string, string> = {
  // Tamil
  'வணக்கம்': 'hello',
  'நன்றி': 'thankyou',
  'ஆம்': 'yes',
  'இல்லை': 'no',
  // Hindi
  'नमस्ते': 'hello',
  'धन्यवाद': 'thankyou',
  'हाँ': 'yes',
  'नहीं': 'no',
};

export function SignAvatar({
  gesture,
  word,
  isPlaying = false,
  speed = 1.0,
  onComplete,
  avatarName = 'Marc',
  backgroundColor = '#2a2a2a',
}: SignAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const avatarRef = useRef<CWASAAvatarInstance | null>(null);
  const [currentWord, setCurrentWord] = useState<string>('');

  // Initialize CWASA avatar
  useEffect(() => {
    if (!containerRef.current) return;

    // Wait for CWASA to load
    const initAvatar = () => {
      if (typeof window.CWASASigningAvatar === 'undefined') {

        setTimeout(initAvatar, 500);
        return;
      }

      try {

        // Create avatar instance with proper configuration
        const avatar = new window.CWASASigningAvatar({
          containerDiv: containerRef.current,
          avatarName: avatarName,
          avatarSizePx: 400,
          backgroundColour: backgroundColor,
          playSpeed: speed,
          sigmlPath: '/SignFiles/',
          jasPath: '/jas/',
        });

        avatarRef.current = avatar;
        setIsLoading(false);
        setError(null);

      } catch (err) {
        console.error('[SignAvatar] Failed to initialize CWASA:', err);
        setError('Failed to initialize avatar. Please check console.');
        setIsLoading(false);
      }
    };

    // Start initialization
    initAvatar();
  }, [avatarName, backgroundColor, speed]);

  // Play sign when isPlaying changes
  useEffect(() => {
    if (!isPlaying || !avatarRef.current) return;

    let wordToSign = word || gesture?.word_or_phrase || '';
    if (!wordToSign) {

      return;
    }

    // Translate if in Tamil/Hindi
    const translatedWord = WORD_TRANSLATIONS[wordToSign.toLowerCase()] || wordToSign;
    
    // Clean and normalize the word
    wordToSign = translatedWord.toLowerCase().trim();
    setCurrentWord(wordToSign);

    try {

      // Use playText method which converts text to SiGML automatically
      avatarRef.current.playText(wordToSign, () => {

        setCurrentWord('');
        onComplete?.();
      });
    } catch (err) {
      console.error('[SignAvatar] ❌ Failed to play sign:', err);
      setError('Failed to play sign animation');
    }
  }, [isPlaying, word, gesture, onComplete]);

  return (
    <div className="relative w-full h-full bg-neutral-900 rounded-2xl overflow-hidden">
      {/* CWASA Avatar Container */}
      <div 
        ref={containerRef}
        className="CWASAAvatar av0 w-full h-full"
        style={{ minHeight: '400px' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/90">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <div className="text-neutral-400 text-sm">Loading 3D avatar...</div>
          </div>
        </div>
      )}

      {/* Current word indicator */}
      {!isLoading && !error && currentWord && (
        <div className="absolute bottom-4 left-4 right-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-gradient-to-r from-amber-900/90 to-rose-900/90 backdrop-blur-md px-6 py-3 rounded-xl shadow-lg border border-amber-500/20">
            <p className="text-white text-base font-semibold text-center tracking-wide">
              🤟 {currentWord.toUpperCase()}
            </p>
          </div>
        </div>
      )}

      {/* Avatar info badge */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4">
          <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white/80 font-medium">
            {avatarName} Avatar
          </div>
        </div>
      )}
    </div>
  );
}

