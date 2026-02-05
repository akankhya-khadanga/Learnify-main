/**
 * PHASE 19: Game Match Results
 * Post-game XP breakdown, ranking, rematch options
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MOCK_MATCH_RESULT, getGameById, MOCK_PLAYER_PROFILE } from '@/mocks/gameHub';
import { Trophy, Medal, TrendingUp, Clock, Target, Zap, ArrowLeft, RotateCcw, Home } from 'lucide-react';

export default function GameMatchResults() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [animateXP, setAnimateXP] = useState(false);
  const [displayedXP, setDisplayedXP] = useState(0);

  const game = getGameById(gameId || '');
  const result = MOCK_MATCH_RESULT;

  // Animate XP count-up
  useEffect(() => {
    setTimeout(() => setAnimateXP(true), 500);
  }, []);

  useEffect(() => {
    if (!animateXP) return;
    const duration = 2000;
    const steps = 60;
    const increment = result.myXpEarned / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= result.myXpEarned) {
        setDisplayedXP(result.myXpEarned);
        clearInterval(timer);
      } else {
        setDisplayedXP(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [animateXP, result.myXpEarned]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-primary';
    if (rank === 2) return 'text-[#C0C0C0]';
    if (rank === 3) return 'text-[#CD7F32]';
    return 'text-text/60';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-8 w-8 text-primary" />;
    if (rank === 2) return <Medal className="h-8 w-8 text-[#C0C0C0]" />;
    if (rank === 3) return <Medal className="h-8 w-8 text-[#CD7F32]" />;
    return null;
  };

  if (!game) {
    return <div>Game not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#0F1115]">
      {/* Victory/Defeat Banner */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden border-b border-neon/30 ${
          result.myRank === 1 ? 'bg-gradient-to-r from-primary/20 to-accent/20' : 'bg-gradient-to-r from-[#161B22] to-[#0D1117]'
        } py-12`}
      >
        {/* Confetti effect for victory */}
        {result.myRank === 1 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, x: Math.random() * window.innerWidth, rotate: 0 }}
                animate={{ y: window.innerHeight, rotate: 360 }}
                transition={{ duration: 3 + Math.random() * 2, delay: Math.random() }}
                className="absolute w-3 h-3 bg-primary rounded"
              />
            ))}
          </div>
        )}

        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            {result.myRank === 1 ? (
              <Trophy className="h-24 w-24 text-primary mx-auto mb-4" />
            ) : (
              <Medal className="h-24 w-24 text-text/60 mx-auto mb-4" />
            )}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-5xl font-black uppercase mb-2 ${
              result.myRank === 1 ? 'text-primary' : 'text-text'
            }`}
          >
            {result.myRank === 1 ? 'Victory!' : `${result.myRank}${result.myRank === 2 ? 'nd' : result.myRank === 3 ? 'rd' : 'th'} Place`}
          </motion.h1>
          
          <p className="text-text/60 uppercase font-bold">{game.title}</p>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* XP Earned Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-float p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-primary uppercase mb-4">XP Earned</h2>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: animateXP ? 1 : 0 }}
                    transition={{ type: 'spring', delay: 0.8 }}
                    className="text-7xl font-black text-primary"
                  >
                    +{displayedXP}
                  </motion.div>
                </div>

                {/* XP Breakdown */}
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded">
                    <span className="text-text/70">Base XP</span>
                    <span className="font-bold text-primary">+{Math.round(result.myXpEarned * 0.4)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded">
                    <span className="text-text/70">Time Bonus ({result.myStats.timeBonus}%)</span>
                    <span className="font-bold text-primary">+{Math.round(result.myXpEarned * (result.myStats.timeBonus / 100))}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded">
                    <span className="text-text/70">Difficulty Bonus</span>
                    <span className="font-bold text-primary">+{result.myStats.difficultyBonus}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded">
                    <span className="text-text/70">Rank Bonus (#{result.myRank})</span>
                    <span className="font-bold text-primary">+{Math.round(result.myXpEarned * 0.2)}</span>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-text/80">Level Progress</span>
                    <span className="text-sm text-primary font-bold">
                      {MOCK_PLAYER_PROFILE.currentXP} / {MOCK_PLAYER_PROFILE.xpToNextLevel} XP
                    </span>
                  </div>
                  <Progress 
                    value={(MOCK_PLAYER_PROFILE.currentXP / MOCK_PLAYER_PROFILE.xpToNextLevel) * 100} 
                    className="h-3 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </Card>
            </motion.div>

            {/* Player Rankings */}
            <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-float p-6">
              <h2 className="text-2xl font-black text-primary uppercase mb-4">Final Rankings</h2>
              <div className="space-y-2">
                {result.players.map((player, index) => (
                  <motion.div
                    key={player.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className={`flex items-center gap-4 p-4 rounded border ${
                      player.rank === result.myRank ? 'border-neon bg-primary/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {/* Rank Icon */}
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(player.rank) || (
                        <span className={`text-2xl font-black ${getRankColor(player.rank)}`}>
                          {player.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 bg-surface-light border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-2xl">
                      {player.avatar}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-bold text-text">{player.username}</p>
                      <p className="text-sm text-text/60">Score: {player.score.toLocaleString()}</p>
                    </div>

                    {/* XP Earned */}
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">+{player.xpEarned}</p>
                      <p className="text-xs text-text/60">XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => navigate(`/game-hub/${gameId}`)}
                className="h-14 bg-primary hover:bg-primary/90 text-black border border-slate-200 dark:border-slate-700 font-black uppercase"
              >
                <RotateCcw className="h-5 w-5 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={() => navigate('/game-hub')}
                variant="outline"
                className="h-14 border border-neon text-primary hover:bg-primary hover:text-black font-black uppercase"
              >
                <Home className="h-5 w-5 mr-2" />
                Game Hub
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personal Stats */}
            <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-float p-4">
              <h3 className="text-xl font-black text-primary uppercase mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    <span className="text-sm font-bold text-text/80">Accuracy</span>
                  </div>
                  <span className="text-lg font-black text-accent">{result.myStats.accuracy}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-sm font-bold text-text/80">Best Streak</span>
                  </div>
                  <span className="text-lg font-black text-primary">{result.myStats.streak}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue" />
                    <span className="text-sm font-bold text-text/80">Time</span>
                  </div>
                  <span className="text-lg font-black text-blue">
                    {Math.floor(result.duration / 60)}:{(result.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-text/60" />
                    <span className="text-sm font-bold text-text/80">Rank Change</span>
                  </div>
                  <Badge className="bg-primary text-black border border-slate-200 dark:border-slate-700">
                    +5
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Match Info */}
            <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-float p-4">
              <h3 className="text-xl font-black text-primary uppercase mb-4">Match Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text/60">Match ID</span>
                  <span className="font-mono text-text/80">{result.matchId.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Date</span>
                  <span className="text-text/80">{new Date(result.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Players</span>
                  <span className="text-text/80">{result.players.length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
