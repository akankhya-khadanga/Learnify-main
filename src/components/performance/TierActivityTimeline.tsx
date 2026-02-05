import { motion } from 'framer-motion';
import { TierHistory } from '@/mocks/performanceTiers';
import { ArrowUp, ArrowDown, Trophy, TrendingUp } from 'lucide-react';

interface TierActivityTimelineProps {
  history: TierHistory[];
}

export default function TierActivityTimeline({ history }: TierActivityTimelineProps) {
  const getIcon = (change: TierHistory) => {
    // Determine if it's a promotion or demotion based on tier comparison
    const tierOrder = { WORST: 0, MEDIUM: 1, BEST: 2 };
    const isPromotion = tierOrder[change.toTier] > tierOrder[change.fromTier];
    
    if (isPromotion) {
      return <ArrowUp className="w-4 h-4 text-green-400" />;
    } else {
      return <ArrowDown className="w-4 h-4 text-red-400" />;
    }
  };

  const getColor = (change: TierHistory) => {
    const tierOrder = { WORST: 0, MEDIUM: 1, BEST: 2 };
    const isPromotion = tierOrder[change.toTier] > tierOrder[change.fromTier];
    
    if (isPromotion) {
      return 'bg-green-500/20 border-green-500/30';
    } else {
      return 'bg-red-500/20 border-red-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
      <h3 className="text-xl font-black text-white mb-6">Activity Timeline</h3>
      <div className="space-y-4">
        {history.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-8"
          >
            {/* Timeline Line */}
            {index < history.length - 1 && (
              <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-white/30 to-transparent" />
            )}

            {/* Timeline Dot */}
            <div
              className={`absolute left-0 top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getColor(event)}`}
            >
              {getIcon(event)}
            </div>

            {/* Event Content */}
            <div className="pb-6">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-bold text-white">{event.reason}</h4>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {event.fromTier} → {event.toTier}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
