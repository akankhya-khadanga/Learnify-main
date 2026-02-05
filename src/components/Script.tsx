/**
 * Script Component - React equivalent to Next.js Script
 * Dynamically loads external scripts
 */

import { useEffect } from 'react';

interface ScriptProps {
  src: string;
  strategy?: 'afterInteractive' | 'beforeInteractive' | 'lazyOnload';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function Script({ src, strategy = 'afterInteractive', onLoad, onError }: ScriptProps) {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
            onLoad?.();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    script.onload = () => {
            onLoad?.();
    };

    script.onerror = (error) => {
      console.error('[Script] Error loading:', src, error);
      onError?.(new Error(`Failed to load script: ${src}`));
    };

    if (strategy === 'beforeInteractive') {
      document.head.insertBefore(script, document.head.firstChild);
    } else {
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [src, strategy, onLoad, onError]);

  return null;
}


