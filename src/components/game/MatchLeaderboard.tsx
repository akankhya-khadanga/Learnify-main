import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockPlayer, calculateMatchReward } from '@/mocks/multiplayer';
import { Trophy, Award, TrendingUp, Zap, Crown, ArrowRight } from 'lucide-react';

interface MatchLeaderboardProps {
  players: MockPlayer[];
  onContinue: () => void;
}

export const MatchLeaderboard = ({ players, onContinue }: MatchLeaderboardProps) => {
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.energy !== a.energy) return b.energy - a.energy;
    if (b.correctAnswers !== a.correctAnswers) return b.correctAnswers - a.correctAnswers;
    return a.questionsAnswered - b.questionsAnswered;
  });

  const playerRank = sortedPlayers.findIndex(p => !p.isAI) + 1;
  const playerReward = calculateMatchReward(playerRank, players.length);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <Trophy className="w-4 h-4 text-gray-500" />;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-500';
    return 'from-gray-600 to-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="bg-gray-900/90 border-gray-700 backdrop-blur-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30 p-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#C9B458] to-[#C27BA0] flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Match Complete!
          </h2>
          
          <div className="flex items-center justify-center gap-2 text-lg">
            <span className="text-gray-400">You placed</span>
            <Badge 
              variant="outline" 
              className={`bg-gradient-to-r ${getRankColor(playerRank)} text-white border-0 text-lg px-3 py-1`}
            >
              #{playerRank}
            </Badge>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Reward Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-lg bg-gradient-to-r from-[#C9B458]/20 to-[#C27BA0]/20 border border-[#C9B458]/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9B458] to-[#C27BA0] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Match Reward</div>
                  <div className="text-2xl font-bold text-[#C9B458]">
                    +{playerReward} XP
                  </div>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          {/* Leaderboard */}
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              const isPlayer = !player.isAI;
              const reward = calculateMatchReward(rank, players.length);

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    isPlayer 
                      ? 'border-[#6DAEDB] bg-[#6DAEDB]/10' 
                      : 'border-gray-700 bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${getRankColor(rank)}`}>
                        {getRankIcon(rank)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {player.username}
                          </span>
                          {isPlayer && (
                            <Badge variant="outline" className="bg-[#6DAEDB]/20 text-[#6DAEDB] border-[#6DAEDB]">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>Level {player.level}</span>
                          <span>•</span>
                          <span>{player.correctAnswers}/5 Correct</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#C9B458]">
                        {player.energy}
                      </div>
                      <div className="text-xs text-gray-400">
                        +{reward} XP
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {sortedPlayers.find(p => !p.isAI)?.correctAnswers || 0}
              </div>
              <div className="text-xs text-gray-400">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {sortedPlayers.find(p => !p.isAI)?.energy || 0}
              </div>
              <div className="text-xs text-gray-400">Final Energy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#C9B458]">
                {Math.round((sortedPlayers.find(p => !p.isAI)?.correctAnswers || 0) / 5 * 100)}%
              </div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
          </motion.div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              size="lg"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
