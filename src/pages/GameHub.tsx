/**
 * PHASE 19: Game Hub — Main Landing Page
 * VR Game Hub with hero banner, game grid, quick stats
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GameCard } from '@/components/game/GameCard';
import { LeaderboardPreview } from '@/components/game/LeaderboardPreview';
import { XPBar } from '@/components/game/XPBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MOCK_GAMES,
  MOCK_PLAYER_PROFILE,
  MOCK_GAME_LEADERBOARD,
  GameType
} from '@/mocks/gameHub';
import { ArrowLeft, Gamepad2, Trophy, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GameHub() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<GameType | 'All'>('All');

  const filteredGames = selectedFilter === 'All'
    ? MOCK_GAMES
    : MOCK_GAMES.filter(game => game.type === selectedFilter);

  const featuredGames = MOCK_GAMES.filter(game => game.featured);

  return (
    <div className="min-h-screen bg-[#0F1115]">
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white dark:bg-slate-800/80 backdrop-blur-sm border-b border-neon/30 shadow-float sticky top-0 z-20"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="border border-neon text-primary hover:bg-primary hover:text-black"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-2">
                <Gamepad2 className="h-7 w-7" />
                Game Hub
              </h1>
              <p className="text-sm text-text/60 uppercase font-bold">
                VR + XP Competition System
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-64 rounded-lg overflow-hidden border border-neon shadow-float"
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-purple/20 to-blue/30" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                <Badge className="w-fit bg-primary text-black border-2 border-black font-black mb-3">
                  NEW SEASON
                </Badge>
                <h2 className="text-4xl font-black text-primary uppercase mb-2">
                  Winter Championship 2025
                </h2>
                <p className="text-text/80 mb-4">
                  Compete in VR challenges and earn exclusive rewards. Top 100 players get Diamond badges!
                </p>
                <Button className="w-fit bg-primary hover:bg-primary/90 text-black border-4 border-black font-black">
                  View Season Details
                </Button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border border-border bg-card p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold text-text/60 uppercase">Games Played</span>
                </div>
                <p className="text-3xl font-black text-primary">{MOCK_PLAYER_PROFILE.totalGamesPlayed}</p>
              </Card>

              <Card className="border border-border bg-card p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-accent" />
                  <span className="text-xs font-bold text-text/60 uppercase">Total XP</span>
                </div>
                <p className="text-3xl font-black text-accent">{MOCK_PLAYER_PROFILE.totalXPEarned.toLocaleString()}</p>
              </Card>

              <Card className="border border-border bg-card p-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5 text-blue" />
                  <span className="text-xs font-bold text-text/60 uppercase">Global Rank</span>
                </div>
                <p className="text-3xl font-black text-blue">#{MOCK_PLAYER_PROFILE.globalRank}</p>
              </Card>
            </div>

            {/* Player XP Bar */}
            <Card className="border border-border bg-card p-4 shadow-md">
              <XPBar
                level={MOCK_PLAYER_PROFILE.level}
                currentXP={MOCK_PLAYER_PROFILE.currentXP}
                xpToNextLevel={MOCK_PLAYER_PROFILE.xpToNextLevel}
              />
            </Card>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-primary uppercase">Browse Games</h2>
              <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as GameType | 'All')}>
                <TabsList className="bg-surface border-2 border-black">
                  <TabsTrigger value="All">All</TabsTrigger>
                  <TabsTrigger value="VR">VR</TabsTrigger>
                  <TabsTrigger value="Puzzle">Puzzle</TabsTrigger>
                  <TabsTrigger value="Reflex">Reflex</TabsTrigger>
                  <TabsTrigger value="Strategy">Strategy</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Featured Games Section */}
            {selectedFilter === 'All' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-black text-primary uppercase">Featured Games</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredGames.map((game, index) => (
                    <GameCard key={game.id} game={game} delay={index * 0.1} />
                  ))}
                </div>
              </div>
            )}

            {/* All Games Grid */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-text uppercase">
                {selectedFilter === 'All' ? 'All Games' : `${selectedFilter} Games`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGames.map((game, index) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    delay={(selectedFilter === 'All' ? featuredGames.length : 0) * 0.1 + index * 0.1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LeaderboardPreview players={MOCK_GAME_LEADERBOARD} />

            {/* Badges Preview */}
            <Card className="border border-neon bg-white dark:bg-slate-800 shadow-float p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-purple/30">
                <Trophy className="h-6 w-6 text-accent" />
                <h3 className="text-xl font-black text-accent uppercase">My Badges</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MOCK_PLAYER_PROFILE.badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`aspect-square rounded-lg border-4 border-black flex items-center justify-center text-4xl ${badge.unlockedAt
                        ? 'bg-card shadow-md'
                        : 'bg-surface-light opacity-30'
                      }`}
                    title={badge.description}
                  >
                    {badge.icon}
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-text/50 mt-3 text-center">
                {MOCK_PLAYER_PROFILE.badges.filter(b => b.unlockedAt).length} / {MOCK_PLAYER_PROFILE.badges.length} Unlocked
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
