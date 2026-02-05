import { motion } from 'framer-motion';
import { StudentTierProfile, TIER_COLORS } from '@/mocks/performanceTiers';
import { TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImprovementTrackerProps {
  student: StudentTierProfile;
}

export default function ImprovementTracker({ student }: ImprovementTrackerProps) {
  const tierColor = TIER_COLORS[student.currentTier];
  const improvementGoal = 85; // Target score
  const progressToGoal = (student.metrics.averageScore / improvementGoal) * 100;
  const daysActive = Math.floor(
    (Date.now() - new Date(student.joinDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br from-white/20 to-white/10 border-2"
            style={{ borderColor: tierColor }}
          >
            {student.avatar}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-white">{student.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="px-3 py-1 rounded-full text-xs font-black"
                style={{
                  backgroundColor: `${tierColor}30`,
                  color: tierColor
                }}
              >
                {student.currentTier}
              </div>
              <span className="text-sm text-gray-400">Active for {daysActive} days</span>
            </div>
          </div>
        </div>

        {/* Goal Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C9B458]" />
              <span className="font-bold text-white">Goal Progress</span>
            </div>
            <span className="text-sm text-gray-400">
              {student.metrics.averageScore}% / {improvementGoal}%
            </span>
          </div>
          <Progress value={progressToGoal} className="h-3 mb-2" />
          <p className="text-xs text-gray-400">
            {improvementGoal - student.metrics.averageScore > 0
              ? `${improvementGoal - student.metrics.averageScore}% more to reach target`
              : 'Target achieved! 🎉'}
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-green-500/20 to-green-500/10 backdrop-blur-xl rounded-xl p-5 border border-green-500/30"
        >
          <TrendingUp className="w-6 h-6 text-green-400 mb-3" />
          <div className="text-2xl font-black text-white mb-1">
            {student.metrics.improvementRate > 0 ? '+' : ''}
            {student.metrics.improvementRate}%
          </div>
          <div className="text-xs text-gray-400">Improvement Rate</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-gradient-to-br from-[#C9B458]/20 to-[#C9B458]/10 backdrop-blur-xl rounded-xl p-5 border border-[#C9B458]/30"
        >
          <Award className="w-6 h-6 text-[#C9B458] mb-3" />
          <div className="text-2xl font-black text-white mb-1">
            {student.achievements.length}
          </div>
          <div className="text-xs text-gray-400">Achievements</div>
        </motion.div>
      </div>

      {/* Achievements List */}
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h4 className="font-bold text-white mb-4">Recent Achievements</h4>
        <div className="space-y-3">
          {student.achievements.slice(0, 3).map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9B458]/30 to-[#C9B458]/10 flex items-center justify-center text-xl border border-[#C9B458]/30 flex-shrink-0">
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm">{achievement.title}</div>
                <div className="text-xs text-gray-400 mt-0.5">{achievement.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-500">
                    {new Date(achievement.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Current Warnings */}
      {student.warnings.filter(w => !w.resolved).length > 0 && (
        <div className="bg-gradient-to-br from-red-500/20 to-red-500/10 backdrop-blur-xl rounded-xl p-6 border border-red-500/30">
          <h4 className="font-bold text-white mb-4">Active Warnings</h4>
          <div className="space-y-3">
            {student.warnings
              .filter(w => !w.resolved)
              .map((warning, index) => (
                <div
                  key={index}
                  className="bg-black/20 rounded-lg p-3 border border-red-500/20"
                >
                  <div className="font-bold text-red-400 text-sm mb-1">
                    {warning.type}
                  </div>
                  <div className="text-xs text-gray-400">{warning.message}</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
