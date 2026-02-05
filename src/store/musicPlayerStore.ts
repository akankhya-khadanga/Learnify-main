import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SoundType = 'rain' | 'forest' | 'cafe' | 'white-noise' | 'ocean' | 'space' | null;

interface MusicPlayerState {
  currentSound: SoundType;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isMinimized: boolean;
  setCurrentSound: (sound: SoundType) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
  toggleMinimized: () => void;
  playSound: (sound: SoundType) => void;
  stopSound: () => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>()(
  persist(
    (set, get) => ({
      currentSound: null,
      isPlaying: false,
      volume: 0.5,
      isMuted: false,
      isMinimized: false, // Always start expanded
      setCurrentSound: (sound) => set({ currentSound: sound }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setVolume: (volume) => set({ volume }),
      setIsMuted: (muted) => set({ isMuted: muted }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      toggleMinimized: () => set((state) => ({ isMinimized: !state.isMinimized })),
      playSound: (sound) => set({ currentSound: sound, isPlaying: true }),
      stopSound: () => set({ isPlaying: false }),
    }),
    {
      name: 'music-player-storage',
      partialize: (state) => ({ 
        volume: state.volume, 
        isMuted: state.isMuted,
        currentSound: state.currentSound,
        // Note: isMinimized is NOT persisted - always starts expanded
      }),
    }
  )
);
