import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown, CloudRain, Trees, Coffee, Radio, Waves, Sparkles, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useMusicPlayerStore, type SoundType } from '@/store/musicPlayerStore';
import { cn } from '@/lib/utils';

const AUDIO_URLS: Record<Exclude<SoundType, null>, string[]> = {
  'rain': ['/audio/rain.mp3'],
  'forest': ['/audio/forest.mp3'],
  'cafe': ['/audio/cafe.mp3'],
  'white-noise': ['/audio/white-noise.mp3'],
  'ocean': ['/audio/ocean.mp3'],
  'space': ['/audio/space.mp3'],
};

const SOUND_OPTIONS = [
  { type: 'rain' as SoundType, icon: CloudRain, label: 'Rain' },
  { type: 'forest' as SoundType, icon: Trees, label: 'Forest' },
  { type: 'cafe' as SoundType, icon: Coffee, label: 'Cafe' },
  { type: 'white-noise' as SoundType, icon: Radio, label: 'White Noise' },
  { type: 'ocean' as SoundType, icon: Waves, label: 'Ocean' },
  { type: 'space' as SoundType, icon: Sparkles, label: 'Space' },
];

export function GlobalMusicPlayer() {
  const {
    currentSound,
    isPlaying,
    volume,
    isMuted,
    isMinimized,
    setIsPlaying,
    setVolume,
    toggleMute,
    toggleMinimized,
    playSound,
    stopSound,
  } = useMusicPlayerStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio context and element
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Handle audio playback
  useEffect(() => {
    if (!currentSound || !isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    const playAudio = async () => {
      try {
        // Create or reuse audio element
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.loop = true;
        }

        const urls = AUDIO_URLS[currentSound];
        if (urls && urls.length > 0) {
          audioRef.current.src = urls[0];
          audioRef.current.volume = isMuted ? 0 : volume;
          
          // Resume audio context if suspended
          if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
          }
          
          await audioRef.current.play();
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        // Generate fallback sound
        generateFallbackSound(currentSound);
      }
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentSound, isPlaying]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Generate fallback sounds using Web Audio API
  const generateFallbackSound = useCallback((type: SoundType) => {
    if (!audioContextRef.current || !type) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    gainNodeRef.current = gainNode;
    
    // Create noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const filter = ctx.createBiquadFilter();
    
    switch (type) {
      case 'rain':
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        break;
      case 'ocean':
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        break;
      case 'forest':
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        break;
      default:
        filter.type = 'lowpass';
        filter.frequency.value = 800;
    }

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    gainNode.gain.value = isMuted ? 0 : volume * 0.3;
    
    noise.start();
  }, [volume, isMuted]);

  const handleSoundToggle = (sound: SoundType) => {
    if (currentSound === sound && isPlaying) {
      stopSound();
    } else {
      playSound(sound);
    }
    setIsExpanded(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopSound();
    } else if (currentSound) {
      setIsPlaying(true);
    } else {
      // Default to rain if no sound selected
      playSound('rain');
    }
  };

  const getSoundLabel = () => {
    if (!currentSound) return 'No sound';
    const option = SOUND_OPTIONS.find(o => o.type === currentSound);
    return option?.label || 'Unknown';
  };

  const SoundIcon = currentSound 
    ? SOUND_OPTIONS.find(o => o.type === currentSound)?.icon || Music 
    : Music;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed top-4 right-4 z-[100]"
      >
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-xl px-2 py-1.5">
          {/* Quick Play/Pause */}
          <Button
            onClick={handlePlayPause}
            size="sm"
            className={cn(
              "h-8 w-8 rounded-full transition-all p-0",
              isPlaying
                ? "bg-primary hover:bg-primary/90 text-[#0C0E17]"
                : "bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:bg-slate-600 text-white border border-slate-200 dark:border-slate-700"
            )}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </Button>
          
          {/* Expand button */}
          <Button
            onClick={toggleMinimized}
            variant="ghost"
            size="sm"
            className="h-8 px-2 hover:bg-slate-200 dark:bg-slate-600 text-white rounded-full"
          >
            <Music className="w-4 h-4 mr-1.5 text-primary" />
            <span className="text-xs font-medium">{isPlaying ? getSoundLabel() : 'Music'}</span>
            <ChevronDown className="w-3 h-3 ml-1.5 text-muted-foreground" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white dark:bg-slate-800 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/50 px-4 py-2.5 sticky top-0 z-40"
    >
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Play/Pause + Sound selector */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button - More Prominent */}
          <Button
            onClick={handlePlayPause}
            size="sm"
            className={cn(
              "h-10 w-10 rounded-full transition-all flex-shrink-0",
              isPlaying
                ? "bg-primary hover:bg-primary/90 text-[#0C0E17] shadow-[0_0_20px_rgba(218,253,120,0.4)]"
                : "bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:bg-slate-600 text-white border-2 border-[#DAFD78]/50 hover:border-[#DAFD78]"
            )}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          {/* Sound selector dropdown */}
          <div className="relative">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="h-9 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:bg-slate-600 border border-slate-200 dark:border-slate-700 text-white rounded-lg"
            >
              <SoundIcon className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium">{getSoundLabel()}</span>
              {isExpanded ? (
                <ChevronUp className="w-3 h-3 ml-2 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3 h-3 ml-2 text-muted-foreground" />
              )}
            </Button>

            {/* Dropdown */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {SOUND_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    const isActive = currentSound === option.type && isPlaying;
                    return (
                      <button
                        key={option.type}
                        onClick={() => handleSoundToggle(option.type)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-[#E6E7E9] hover:bg-slate-200 dark:bg-slate-600"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                        {isActive && (
                          <div className="ml-auto flex gap-1">
                            <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                            <span className="w-1 h-3 bg-primary rounded-full animate-pulse delay-75" />
                            <span className="w-1 h-3 bg-primary rounded-full animate-pulse delay-150" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center: Now Playing indicator */}
        <div className="flex items-center gap-2">
          {isPlaying && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-[#DAFD78]/30">
              <div className="flex gap-0.5">
                <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                <span className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.15s' }} />
                <span className="w-1 h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <span className="text-xs font-medium text-primary">Now Playing</span>
            </div>
          )}
        </div>

        {/* Right: Volume controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-white hover:bg-slate-200 dark:bg-slate-600"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          
          <div className="w-24">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              onValueChange={([val]) => {
                setVolume(val / 100);
                if (val > 0 && isMuted) {
                  toggleMute();
                }
              }}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          <span className="text-xs text-muted-foreground w-8">
            {isMuted ? '0' : Math.round(volume * 100)}%
          </span>

          {/* Minimize button */}
          <Button
            onClick={toggleMinimized}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-white hover:bg-slate-200 dark:bg-slate-600"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
