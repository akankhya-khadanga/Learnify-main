import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, isDyslexia, isColorblind } = useThemeStore();

  // Directly apply theme class to HTML element
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove('light', 'dark', 'colorblind', 'dyslexia');

    // Apply current theme
    if (mode === 'light' || mode === 'dark') {
      root.classList.add(mode);
    }

    // Add accessibility modes
    if (isDyslexia) {
      root.classList.add('dyslexia');
    }

    if (isColorblind) {
      root.classList.add('colorblind');
    }

    console.log('Theme applied:', mode, 'Classes:', root.className);
  }, [mode, isDyslexia, isColorblind]);

  return <>{children}</>;
}
