/**
 * PHASE 19: GameCard Component
 * Interactive game card with hover effects and tier badges
 */

import { motion } from 'framer-motion';
import { Game, getTierColor } from '@/mocks/gameHub';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Zap, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: Game;
  delay?: number;
}

export function GameCard({ game, delay = 0 }: GameCardProps) {
  const navigate = useNavigate();
  const tierColor = getTierColor(game.tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05, y: -8 }}
      onClick={() => navigate(`/game-hub/${game.id}`)}
      className="relative group cursor-pointer"
    >
      {/* Card Container */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-surface-light to-[#0D1117] overflow-hidden">
          {/* Placeholder gradient */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `linear-gradient(135deg, ${tierColor}33 0%, transparent 100%)`,
            }}
          />

          {/* Featured Badge */}
          {game.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary border-2 border-black text-black font-black uppercase text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* VR Badge */}
          {game.isVRCompatible && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue border-2 border-black text-black font-black uppercase text-xs">
                VR
              </Badge>
            </div>
          )}

          {/* Tier Indicator */}
          <div
            className="absolute bottom-3 left-3 px-3 py-1 rounded border-2 border-black font-black text-sm uppercase"
            style={{ backgroundColor: tierColor, color: '#000' }}
          >
            {game.tier}
          </div>

          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-black uppercase border border-primary shadow-lg"
            >
              Play Now
            </motion.div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-xl font-black text-primary uppercase leading-tight">
            {game.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-text/70 line-clamp-2">{game.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {game.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-2 border-text/20 text-text/60 text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t-2 border-text/10">
            <div className="flex items-center gap-1 text-text/60 text-sm">
              <Users className="h-4 w-4" />
              <span>{game.maxPlayers}P</span>
            </div>
            <div className="flex items-center gap-1 text-text/60 text-sm">
              <Clock className="h-4 w-4" />
              <span>{game.avgDuration}</span>
            </div>
            <div className="flex items-center gap-1 text-primary text-sm font-bold">
              <Trophy className="h-4 w-4" />
              <span>{game.minXP}-{game.maxXP} XP</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
