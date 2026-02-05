import { motion } from 'framer-motion';
import { EnergyBar } from './EnergyBar';
import { Trophy, Target, Flame, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface GameHUDProps {
  energy: number;
  streak: number;
  bestStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
  mode: 'PRACTICE' | 'COMPETITION';
  lastAnswerCorrect?: boolean | null;
}

export const GameHUD = ({
  energy,
  streak,
  bestStreak,
  questionsAnswered,
  correctAnswers,
  mode,
  lastAnswerCorrect
}: GameHUDProps) => {
  const accuracy = questionsAnswered > 0 
    ? Math.round((correctAnswers / questionsAnswered) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="p-4 bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <div className="space-y-4">
          {/* Mode Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`${
                mode === 'PRACTICE' 
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                  : 'bg-purple-500/20 border-purple-500 text-purple-400'
              }`}
            >
              {mode === 'PRACTICE' ? '🎯 Practice Mode' : '🏆 Competition Mode'}
            </Badge>
            
            {lastAnswerCorrect !== null && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {lastAnswerCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </motion.div>
            )}
          </div>

          {/* Energy Bar */}
          <EnergyBar currentEnergy={energy} />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50">
              <Target className="w-4 h-4 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Questions</span>
                <span className="text-sm font-bold text-white">{questionsAnswered}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50">
              <Trophy className="w-4 h-4 text-green-400" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Correct</span>
                <span className="text-sm font-bold text-white">{correctAnswers}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50">
              <Flame className="w-4 h-4 text-orange-400" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Streak</span>
                <span className="text-sm font-bold text-white">
                  {streak} {streak > 0 && '🔥'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#C9B458] to-[#C27BA0]" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Accuracy</span>
                <span className="text-sm font-bold text-white">{accuracy}%</span>
              </div>
            </div>
          </div>

          {/* Best Streak Indicator */}
          {bestStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gradient-to-r from-[#C9B458]/20 to-[#C27BA0]/20 border border-[#C9B458]/30"
            >
              <Trophy className="w-4 h-4 text-[#C9B458]" />
              <span className="text-xs text-gray-300">
                Best Streak: <span className="font-bold text-[#C9B458]">{bestStreak}</span>
              </span>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
