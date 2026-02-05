/**
 * PHASE 19: LeaderboardPreview Component
 * Top 5 players widget for lobby/results
 */

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LobbyPlayer } from '@/mocks/gameHub';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardPreviewProps {
  players: LobbyPlayer[];
  title?: string;
  maxPlayers?: number;
}

export function LeaderboardPreview({ 
  players, 
  title = 'Top Players',
  maxPlayers = 5 
}: LeaderboardPreviewProps) {
  const topPlayers = players.slice(0, maxPlayers);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-primary" />;
      case 2:
        return <Medal className="h-5 w-5 text-[#C0C0C0]" />;
      case 3:
        return <Medal className="h-5 w-5 text-[#CD7F32]" />;
      default:
        return <Award className="h-5 w-5 text-text/40" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-neon bg-primary/10';
      case 2:
        return 'border-[#C0C0C0] bg-[#C0C0C0]/10';
      case 3:
        return 'border-[#CD7F32] bg-[#CD7F32]/10';
      default:
        return 'border-text/20 bg-white dark:bg-slate-800';
    }
  };

  return (
    <Card className="border-4 border-black bg-white dark:bg-slate-800 shadow-primary p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neon/30">
        <Trophy className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-black text-primary uppercase">{title}</h3>
      </div>

      {/* Player List */}
      <div className="space-y-2">
        {topPlayers.map((player, index) => (
          <motion.div
            key={player.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded border-2 ${getRankColor(player.rank)}`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8">
              {getRankIcon(player.rank)}
            </div>

            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-surface-light border-2 border-black rounded-full flex items-center justify-center text-2xl">
                {player.avatar}
              </div>
              {/* Level Badge */}
              <div className="absolute -bottom-1 -right-1 bg-primary text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-black border-2 border-black">
                {player.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text truncate">{player.username}</p>
              <p className="text-xs text-text/60">
                {player.xp.toLocaleString()} XP
              </p>
            </div>

            {/* Rank Number */}
            <div className="text-right">
              <p className="text-lg font-black text-primary">#{player.rank}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 py-2 bg-white dark:bg-slate-800 border border-neon/30 text-primary font-bold uppercase text-sm rounded hover:bg-primary/10 transition-colors"
      >
        View Full Leaderboard
      </motion.button>
    </Card>
  );
}
