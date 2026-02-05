/**
 * Sign Language Video Player Component
 * 
 * Mobile-first, gesture-controlled video player for sign language lessons
 * Uses CWASA real 3D avatars for authentic sign language rendering
 */

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Gauge, Volume2, VolumeX } from 'lucide-react';
import { SignAvatar } from './SignAvatar';
import type { SignGesture } from '@/types/signLanguage';

interface SignVideoPlayerProps {
  gestures: SignGesture[];
  currentGestureIndex: number;
  onGestureChange: (index: number) => void;
  subtitles?: string;
  speed?: number;
  onSpeedChange?: (speed: number) => void;
  showControls?: boolean;
  autoPlay?: boolean;
}

export function SignVideoPlayer({
  gestures,
  currentGestureIndex,
  onGestureChange,
  subtitles,
  speed = 1.0,
  onSpeedChange,
  showControls = true,
  autoPlay = false,
}: SignVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentGesture = gestures[currentGestureIndex];
  const hasNext = currentGestureIndex < gestures.length - 1;
  const hasPrevious = currentGestureIndex > 0;

  // Handle gesture completion
  const handleGestureComplete = () => {
    if (hasNext && isPlaying) {
      setTimeout(() => {
        onGestureChange(currentGestureIndex + 1);
      }, 300); // Small pause between gestures
    } else {
      setIsPlaying(false);
    }
  };

  // Tap to pause/play
  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.controls')) return;

    setIsPlaying(!isPlaying);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Horizontal swipe (change gesture)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && hasPrevious) {
        // Swipe right - previous gesture
        onGestureChange(currentGestureIndex - 1);
        if ('vibrate' in navigator) navigator.vibrate(15);
      } else if (deltaX < 0 && hasNext) {
        // Swipe left - next gesture
        onGestureChange(currentGestureIndex + 1);
        if ('vibrate' in navigator) navigator.vibrate(15);
      }
    }

    setTouchStart(null);
  };

  // Speed control
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
  const handleSpeedChange = (newSpeed: number) => {
    onSpeedChange?.(newSpeed);
    setShowSpeedMenu(false);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[9/16] bg-neutral-950 rounded-3xl overflow-hidden shadow-2xl"
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Avatar Renderer */}
      <div className="absolute inset-0">
        <SignAvatar
          gesture={currentGesture}
          word={currentGesture?.word_or_phrase}
          isPlaying={isPlaying}
          speed={speed}
          onComplete={handleGestureComplete}
          backgroundColor="#1a1a1a"
        />
      </div>

      {/* Subtitles */}
      {subtitles && (
        <div className="absolute bottom-24 left-0 right-0 px-6">
          <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-2xl">
            <p className="text-white text-center text-lg font-medium leading-relaxed">
              {subtitles}
            </p>
          </div>
        </div>
      )}

      {/* Gesture label */}
      <div className="absolute top-4 left-4 right-4">
        <div className="bg-gradient-to-r from-amber-900/80 to-rose-900/80 backdrop-blur-sm px-4 py-2 rounded-xl">
          <p className="text-white text-sm font-medium">
            {currentGesture?.word_or_phrase || 'Loading...'}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute top-16 left-4 right-4">
        <div className="flex gap-1">
          {gestures.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index === currentGestureIndex
                  ? 'bg-amber-500'
                  : index < currentGestureIndex
                  ? 'bg-amber-700'
                  : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="controls absolute bottom-4 left-4 right-4">
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4">
            {/* Main controls */}
            <div className="flex items-center justify-between gap-4">
              {/* Previous */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasPrevious) {
                    onGestureChange(currentGestureIndex - 1);
                  }
                }}
                disabled={!hasPrevious}
                className="p-3 rounded-xl bg-neutral-800 text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Replay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGestureChange(currentGestureIndex);
                  setIsPlaying(true);
                }}
                className="p-3 rounded-xl bg-neutral-800 text-amber-400 active:scale-95 transition-transform"
              >
                <RotateCcw size={24} />
              </button>

              {/* Play/Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                className="p-4 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 text-white active:scale-95 transition-transform shadow-lg"
              >
                {isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" />}
              </button>

              {/* Speed */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSpeedMenu(!showSpeedMenu);
                  }}
                  className="p-3 rounded-xl bg-neutral-800 text-white active:scale-95 transition-transform"
                >
                  <Gauge size={24} />
                </button>

                {/* Speed menu */}
                {showSpeedMenu && (
                  <div className="absolute bottom-full mb-2 right-0 bg-neutral-900 rounded-xl p-2 shadow-xl min-w-[100px]">
                    {speeds.map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeedChange(s);
                        }}
                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          speed === s
                            ? 'bg-amber-600 text-white'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Next */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasNext) {
                    onGestureChange(currentGestureIndex + 1);
                  }
                }}
                disabled={!hasNext}
                className="p-3 rounded-xl bg-neutral-800 text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Counter */}
            <div className="mt-3 text-center">
              <span className="text-xs text-neutral-400">
                {currentGestureIndex + 1} of {gestures.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tap hint (shows on first use) */}
      {!isPlaying && currentGestureIndex === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-xl animate-pulse">
            <p className="text-white text-sm">Tap to play • Swipe to navigate</p>
          </div>
        </div>
      )}
    </div>
  );
}
