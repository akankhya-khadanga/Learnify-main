/**
 * CWASA Avatar Component
 * 
 * Integrates the real CWASA (Communication With Avatars - Signing Avatars) library
 * Uses the real 3D signing avatars with SiGML files from public folder
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCw, User } from 'lucide-react';

interface CWASAAvatarProps {
  /** Text to sign */
  text?: string;
  /** Array of SiGML files to play */
  sigmlFiles?: string[];
  /** Avatar model: marc, anna, luna, siggi, francoise */
  avatar?: 'marc' | 'anna' | 'luna' | 'siggi' | 'francoise';
  /** Playback speed (0.5 - 2.0) */
  speed?: number;
  /** Auto-play when text/files change */
  autoPlay?: boolean;
  /** Show controls */
  showControls?: boolean;
  /** Callback when signing completes */
  onComplete?: () => void;
  /** Callback when signing starts */
  onStart?: () => void;
}

interface CWASAInstance {
  init: (config?: unknown) => void;
  playSiGMLURL: (url: string) => void;
  playSiGMLText: (text: string) => void;
  stopSiGML: () => void;
  getLogger: (name: string, level: number) => unknown;
}

export function CWASAAvatar({
  text,
  sigmlFiles,
  avatar = 'marc',
  speed = 1.0,
  autoPlay = false,
  showControls = true,
  onComplete,
  onStart,
}: CWASAAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cwasaReady, setCwasaReady] = useState(false);
  const avatarIdRef = useRef(`cwasa-avatar-${Math.random().toString(36).substr(2, 9)}`);

  // Initialize CWASA library
  useEffect(() => {
    const checkCWASA = () => {
      if (window.CWASA) {
        console.log('[CWASA] Library detected:', {
          CWASA: !!window.CWASA,
          init: typeof window.CWASA.init,
          playSiGMLURL: typeof window.CWASA.playSiGMLURL
        });
        
        setCwasaReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkCWASA()) return;

    // Check every 100ms for up to 15 seconds
    let attempts = 0;
    const maxAttempts = 150;
    
    const interval = setInterval(() => {
      attempts++;
      if (attempts % 10 === 0) {
        console.log(`[CWASA] Checking library (attempt ${attempts}/${maxAttempts})`);
      }
      
      if (checkCWASA()) {
        console.log('[CWASA] Library loaded successfully');
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        console.error('[CWASA] Library failed to load after', attempts, 'attempts');
        clearInterval(interval);
        setError('CWASA library not loaded. Please refresh the page.');
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Initialize avatar when CWASA is ready
  useEffect(() => {
    if (!cwasaReady || !containerRef.current) return;

    console.log('[CWASA Lesson] Setting up avatar container');
    
    // Create the container first
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'CWASAAvatar av0';
    avatarContainer.id = avatarIdRef.current;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(avatarContainer);

    console.log('[CWASA Lesson] Container created');
    
    // Check if already initialized
    const alreadyInit = window.tuavatarLoaded;
    console.log('[CWASA Lesson] Already initialized:', alreadyInit);
    
    if (!alreadyInit) {
      // Initialize CWASA
      const initCfg = {
        avsbsl: ["anna"],
        avSettings: { 
          avList: "avsbsl", 
          initAv: avatar || "anna"
        },
        sysPath: "/jas/loc2021",
      };
      
      console.log('[CWASA Lesson] Initializing CWASA with config:', initCfg);
      window.tuavatarLoaded = false;
      window.playerAvailableToPlay = true;
      
      try {
        window.CWASA!.init();
        console.log('[CWASA Lesson] Init called successfully');
      } catch (err) {
        console.error('[CWASA Lesson] Init error:', err);
      }
    }
    
    // Wait for avatar to render
    let attempts = 0;
    const checkInterval = setInterval(() => {
      const container = document.querySelector('.CWASAAvatar.av0');
      const canvas = container?.querySelector('canvas');
      const iframe = container?.querySelector('iframe');
      const hasContent = (container?.innerHTML.length || 0) > 100;
      
      attempts++;
      
      if (attempts % 4 === 0) {
        console.log('[CWASA Lesson] Waiting for render...', { 
          attempt: attempts, 
          canvas: !!canvas, 
          iframe: !!iframe, 
          hasContent 
        });
      }
      
      if (canvas || iframe || hasContent) {
        clearInterval(checkInterval);
        window.tuavatarLoaded = true;
        console.log('[CWASA Lesson] Avatar rendered!');
        setIsLoading(false);
      } else if (attempts >= 20) {
        clearInterval(checkInterval);
        console.warn('[CWASA Lesson] Timeout waiting for avatar');
        setIsLoading(false);
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
    };
  }, [cwasaReady, avatar]);

  // Play text/SiGML files
  const playSigning = useCallback(async () => {
    if (!cwasaReady || !window.CWASA) {
      console.warn('[CWASA] Not ready for playback');
      return;
    }

    try {
      console.log('[CWASA] Starting playback');
      setIsPlaying(true);
      onStart?.();

      if (sigmlFiles && sigmlFiles.length > 0) {
        console.log('[CWASA] Playing SiGML files:', sigmlFiles);
        
        // Play each SiGML file sequentially with minimal delay
        for (const file of sigmlFiles) {
          const sigmlPath = `/SignFiles/${file}.sigml`;
          console.log('[CWASA] Playing:', sigmlPath);
          
          // Use CWASA.playSiGMLURL to play the sign
          if (window.CWASA.playSiGMLURL) {
            await new Promise<void>((resolve) => {
              window.CWASA!.playSiGMLURL(sigmlPath);
              // Reduced delay for faster playback - signs play back-to-back
              setTimeout(() => resolve(), 600 / speed);
            });
          }
        }
      } else if (text) {
        console.log('[CWASA] Playing text:', text);
        
        // Convert text to individual signs
        const words = text.toLowerCase().split(/\s+/);
        for (const word of words) {
          const sigmlPath = `/SignFiles/${word}.sigml`;
          console.log('[CWASA] Playing word:', sigmlPath);
          
          if (window.CWASA.playSiGMLURL) {
            await new Promise<void>((resolve) => {
              window.CWASA!.playSiGMLURL(sigmlPath);
              // Faster word-to-word transition
              setTimeout(() => resolve(), 600 / speed);
            });
          }
        }
      }

      console.log('[CWASA] Playback complete');
      setIsPlaying(false);
      onComplete?.();
    } catch (err) {
      console.error('[CWASA] Playback error:', err);
      setIsPlaying(false);
      setError('Playback failed');
    }
  }, [cwasaReady, sigmlFiles, text, speed, onStart, onComplete]);

  // Auto-play when text/files change
  useEffect(() => {
    if (autoPlay && cwasaReady && (text || sigmlFiles)) {
      playSigning();
    }
  }, [text, sigmlFiles, autoPlay, cwasaReady, playSigning]);

  // Handle speed change
  useEffect(() => {
    if (window.SiGMLURL && speed !== 1.0) {
      // CWASA speed control (if available)
          }
  }, [speed]);

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause functionality (if supported)
      setIsPlaying(false);
    } else {
      playSigning();
    }
  };

  const handleReplay = () => {
    playSigning();
  };

  if (error) {
    return (
      <div className="w-full aspect-[9/16] bg-neutral-900 rounded-3xl flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-red-400" />
          </div>
          <p className="text-red-400 text-sm mb-2">Avatar Error</p>
          <p className="text-neutral-500 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[9/16] bg-neutral-900 rounded-3xl overflow-hidden">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
            <p className="text-neutral-400 text-sm">Loading avatar...</p>
            <p className="text-neutral-600 text-xs mt-2">First load may take 5-10s</p>
          </div>
        </div>
      )}
      
      {/* Avatar Container */}
      <div 
        ref={containerRef}
        className="w-full h-full"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        }}
      />

      {/* Overlay Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReplay}
              disabled={isPlaying}
              className="p-3 rounded-full bg-neutral-800/80 hover:bg-neutral-700/80 active:scale-95 transition disabled:opacity-50"
            >
              <RotateCw size={20} className="text-white" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={!text && !sigmlFiles}
              className="p-4 rounded-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 active:scale-95 transition shadow-lg disabled:opacity-50"
            >
              {isPlaying ? (
                <Pause size={24} className="text-white" />
              ) : (
                <Play size={24} className="text-white ml-0.5" />
              )}
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-neutral-800/80">
              <span className="text-xs text-neutral-400">{speed}x</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      {isPlaying && (
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-rose-600/90 rounded-full">
          <span className="text-xs text-white font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Signing
          </span>
        </div>
      )}
    </div>
  );
}


