/**
 * PHASE 19: XPBar Component
 * Animated progress bar with level and XP display
 */

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

interface XPBarProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  showLabel?: boolean;
  animate?: boolean;
}

export function XPBar({ 
  level, 
  currentXP, 
  xpToNextLevel, 
  showLabel = true,
  animate = false 
}: XPBarProps) {
  const progress = (currentXP / xpToNextLevel) * 100;

  return (
    <div className="space-y-2">
      {/* Header */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-black px-3 py-1 rounded border-2 border-black font-black text-sm">
              LVL {level}
            </div>
            <span className="text-sm text-text/60 font-bold">
              {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-1 text-primary text-sm font-bold">
            <Zap className="h-4 w-4" />
            <span>{(xpToNextLevel - currentXP).toLocaleString()} to next level</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <Progress
          value={progress}
          className="h-4 border-4 border-black bg-surface-light"
        />
        
        {/* Glow Effect */}
        {animate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-primary/30 rounded blur-sm"
          />
        )}

        {/* Percentage Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-black/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
