import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface ThreeDFallbackProps {
  children: ReactNode;
  fallbackColor?: string;
}

export function ThreeDFallback({ children, fallbackColor = 'from-primary/5 to-accent/5' }: ThreeDFallbackProps) {
  const fallback = (
    <div className={`absolute inset-0 bg-gradient-to-br ${fallbackColor} opacity-50`}>
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}
