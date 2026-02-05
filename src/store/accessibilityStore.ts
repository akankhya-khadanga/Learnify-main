import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type TextScale = 100 | 125 | 150;
export type SignLanguage = 'none' | 'ASL' | 'ISL' | 'BSL';

interface AccessibilityState {
  // Font & Display
  dyslexiaFont: boolean;
  colorblindMode: ColorblindMode;
  textScale: TextScale;
  highContrast: boolean;

  // Captions & Audio
  captionsEnabled: boolean;

  // Sign Language
  signLanguage: SignLanguage;

  // Actions
  setDyslexiaFont: (enabled: boolean) => void;
  setColorblindMode: (mode: ColorblindMode) => void;
  setTextScale: (scale: TextScale) => void;
  setHighContrast: (enabled: boolean) => void;
  setCaptionsEnabled: (enabled: boolean) => void;
  setSignLanguage: (language: SignLanguage) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  dyslexiaFont: false,
  colorblindMode: 'none' as ColorblindMode,
  textScale: 100 as TextScale,
  highContrast: false,
  captionsEnabled: false,
  signLanguage: 'none' as SignLanguage,
};

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      setDyslexiaFont: (enabled) => set({ dyslexiaFont: enabled }),
      setColorblindMode: (mode) => set({ colorblindMode: mode }),
      setTextScale: (scale) => set({ textScale: scale }),
      setHighContrast: (enabled) => set({ highContrast: enabled }),
      setCaptionsEnabled: (enabled) => set({ captionsEnabled: enabled }),
      setSignLanguage: (language) => set({ signLanguage: language }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'INTELLI-LEARN-accessibility',
    }
  )
);
