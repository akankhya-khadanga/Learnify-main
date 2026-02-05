/**
 * PHASE 19: PlayerAvatar Component
 * Profile picture with level badge and status indicator
 */

import { motion } from 'framer-motion';
import { LobbyPlayer } from '@/mocks/gameHub';
import { CheckCircle2, Clock } from 'lucide-react';

interface PlayerAvatarProps {
  player: LobbyPlayer;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  showLevel?: boolean;
}

export function PlayerAvatar({ 
  player, 
  size = 'md',
  showStatus = true,
  showLevel = true 
}: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
  };

  const levelSizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-8 h-8 text-sm',
  };

  return (
    <div className="relative inline-block">
      {/* Avatar Circle */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`${sizeClasses[size]} bg-surface-light border-4 border-black rounded-full flex items-center justify-center relative overflow-hidden`}
      >
        {player.avatar}
        
        {/* Ready Glow */}
        {showStatus && player.isReady && (
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-primary/30 rounded-full"
          />
        )}
      </motion.div>

      {/* Level Badge */}
      {showLevel && (
        <div
          className={`absolute -bottom-1 -right-1 bg-primary text-black rounded-full ${levelSizeClasses[size]} flex items-center justify-center font-black border-2 border-black`}
        >
          {player.level}
        </div>
      )}

      {/* Status Indicator */}
      {showStatus && (
        <div className="absolute -top-1 -right-1">
          {player.isReady ? (
            <CheckCircle2 className="h-5 w-5 text-primary bg-black rounded-full" />
          ) : (
            <Clock className="h-5 w-5 text-text/40 bg-black rounded-full" />
          )}
        </div>
      )}

      {/* Ping Indicator (optional) */}
      {showStatus && (
        <div className="absolute -bottom-1 -left-1 bg-black rounded-full px-1.5 py-0.5 border border-text/20">
          <div className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                player.ping < 30 ? 'bg-green-500' : player.ping < 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-text/60 font-bold">{player.ping}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
