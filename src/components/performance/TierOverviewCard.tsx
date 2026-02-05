import { motion } from 'framer-motion';
import { PerformanceTier, TierStatistics } from '@/mocks/performanceTiers';
import { TrendingUp, TrendingDown, Users, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TierOverviewCardProps {
  tier: PerformanceTier;
  statistics: TierStatistics | undefined;
  onClick?: () => void;
}

export default function TierOverviewCard({ tier, statistics, onClick }: TierOverviewCardProps) {
  if (!statistics) return null;

  const getTierLabel = (tier: PerformanceTier) => {
    return tier === 'BEST' ? 'Top Performers' : tier === 'MEDIUM' ? 'Average' : 'Needs Support';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        onClick={onClick}
        className="bg-white dark:bg-slate-800 border-4 border-neon shadow-[4px_4px_0px_0px_rgba(201,180,88,1)] hover:shadow-[6px_6px_0px_0px_rgba(201,180,88,1)] cursor-pointer transition-all p-6 relative overflow-hidden"
      >
        {/* Accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2"
          style={{ backgroundColor: statistics.color }}
        />

        <div className="relative z-10 pl-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-black uppercase" style={{ color: statistics.color }}>
                {statistics.tier}
              </h3>
              <p className="text-sm text-white/70 mt-1 font-bold">{getTierLabel(statistics.tier)}</p>
            </div>
            <Award className="w-8 h-8 opacity-50" style={{ color: statistics.color }} />
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-white/50" />
                <span className="text-xs text-white/50 font-black">STUDENTS</span>
              </div>
              <div className="text-3xl font-black text-white">{statistics.totalStudents}</div>
            </div>
            <div>
              <div className="text-xs text-white/50 font-black mb-1">AVG SCORE</div>
              <div className="text-3xl font-black text-white">{statistics.averageScore}%</div>
            </div>
          </div>

          {/* Movement Rates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/50 border-2 border-green-500/30 p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-white/70 font-bold">Promoted</span>
              </div>
              <div className="text-lg font-black text-green-400">{statistics.promotionRate}%</div>
            </div>
            <div className="bg-black/50 border-2 border-red-500/30 p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-xs text-white/70 font-bold">Demoted</span>
              </div>
              <div className="text-lg font-black text-red-400">{statistics.demotionRate}%</div>
            </div>
          </div>

          {/* Retention Rate */}
          <div className="mt-4 pt-4 border-t-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 font-black">RETENTION RATE</span>
              <span className="text-sm font-black text-white">{statistics.retentionRate}%</span>
            </div>
            <div className="mt-2 h-2 bg-black border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${statistics.retentionRate}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full"
                style={{ backgroundColor: statistics.color }}
              />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
