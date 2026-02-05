import { motion } from 'framer-motion';
import { StudentTierProfile, TIER_COLORS } from '@/mocks/performanceTiers';
import { Mail, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StudentTierCardProps {
  student: StudentTierProfile;
  onClick?: () => void;
}

export default function StudentTierCard({ student, onClick }: StudentTierCardProps) {
  const tierColor = TIER_COLORS[student.currentTier];
  const hasWarnings = student.warnings.filter(w => !w.resolved).length > 0;
  const completionRate = (student.metrics.assignmentsCompleted / student.metrics.assignmentsTotal) * 100;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 relative overflow-hidden group"
    >
      {/* Student Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-white/20 to-white/10 border-2"
            style={{ borderColor: tierColor }}
          >
            {student.avatar}
          </div>
          {hasWarnings && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white truncate">{student.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Mail className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400 truncate">{student.email}</span>
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-black"
          style={{
            backgroundColor: `${tierColor}30`,
            color: tierColor
          }}
        >
          {student.currentTier}
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Average Score</span>
            <span className="text-sm font-bold text-white">{student.metrics.averageScore}%</span>
          </div>
          <Progress value={student.metrics.averageScore} className="h-1.5" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Assignments</span>
            <span className="text-sm font-bold text-white">
              {student.metrics.assignmentsCompleted}/{student.metrics.assignmentsTotal}
            </span>
          </div>
          <Progress value={completionRate} className="h-1.5" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-5 border-t border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {student.metrics.improvementRate >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-xs font-semibold ${student.metrics.improvementRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.abs(student.metrics.improvementRate)}%
            </span>
          </div>
          <div className="text-xs text-gray-400">
            Rank {student.metrics.rankInTier}/{student.metrics.totalInTier}
          </div>
        </div>
        {student.achievements.length > 0 && (
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-[#C9B458]" />
            <span className="text-xs text-gray-400">{student.achievements.length}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
