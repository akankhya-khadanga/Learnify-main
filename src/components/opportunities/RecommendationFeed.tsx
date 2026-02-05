import { motion } from 'framer-motion';
import { Opportunity, OPPORTUNITY_COLORS } from '@/mocks/opportunities';
import { Sparkles, TrendingUp } from 'lucide-react';

interface RecommendationFeedProps {
  opportunities: Opportunity[];
  onSelect: (opportunity: Opportunity) => void;
}

export default function RecommendationFeed({ opportunities, onSelect }: RecommendationFeedProps) {
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-5 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-black text-white">Top Picks For You</h3>
      </div>
      <div className="space-y-3">
        {opportunities.slice(0, 5).map((opp, index) => (
          <motion.button
            key={opp.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(opp)}
            className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-slate-200 dark:border-slate-700 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: OPPORTUNITY_COLORS[opp.category] }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                  {opp.title}
                </h4>
                <p className="text-xs text-gray-400 mb-2 line-clamp-1">{opp.provider}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold text-primary">{opp.matchScore}%</span>
                  </div>
                  {opp.amount && (
                    <span className="text-xs text-gray-500">• {opp.amount}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
