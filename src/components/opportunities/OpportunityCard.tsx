import { motion } from 'framer-motion';
import { Opportunity, OPPORTUNITY_COLORS, ELIGIBILITY_COLORS } from '@/mocks/opportunities';
import { getDaysUntilDeadline } from '@/mocks/schemes';
import { Calendar, TrendingUp, MapPin, Clock, ExternalLink, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onAutoJudge: (opportunity: Opportunity) => void;
  onViewDetails: (opportunity: Opportunity) => void;
}

export default function OpportunityCard({ opportunity, onAutoJudge, onViewDetails }: OpportunityCardProps) {
  const daysLeft = getDaysUntilDeadline(opportunity.deadline);
  const categoryColor = OPPORTUNITY_COLORS[opportunity.category];
  const eligibilityColor = ELIGIBILITY_COLORS[opportunity.eligibilityScore];
  const isUrgent = daysLeft <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-slate-200 dark:border-slate-700 relative overflow-hidden group"
    >
      {/* Category Accent Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: categoryColor }}
      />

      {/* Glow Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-2xl"
        style={{ background: `radial-gradient(circle at top right, ${categoryColor}, transparent)` }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-black text-white mb-1 line-clamp-2">{opportunity.title}</h3>
            <p className="text-xs text-gray-400">{opportunity.provider}</p>
          </div>
          <Badge
            className="ml-3 flex-shrink-0"
            style={{
              backgroundColor: `${categoryColor}30`,
              color: categoryColor,
              borderColor: `${categoryColor}50`
            }}
          >
            {opportunity.category}
          </Badge>
        </div>

        {/* Match Score & Eligibility */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-white">{opportunity.matchScore}% Match</span>
          </div>
          <div
            className="px-2 py-1 rounded-md text-xs font-bold"
            style={{
              backgroundColor: `${eligibilityColor}20`,
              color: eligibilityColor
            }}
          >
            {opportunity.eligibilityScore} Eligibility
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{opportunity.description}</p>

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {opportunity.amount && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs text-gray-300 font-semibold">{opportunity.amount}</span>
            </div>
          )}
          {opportunity.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">{opportunity.location}</span>
            </div>
          )}
          {opportunity.duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">{opportunity.duration}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isUrgent ? 'text-red-400' : 'text-gray-400'}`} />
            <span className={`text-xs font-semibold ${isUrgent ? 'text-red-400' : 'text-gray-400'}`}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {opportunity.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded-md text-xs bg-white/5 text-gray-400 border border-slate-200 dark:border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onAutoJudge(opportunity)}
            className="flex-1 bg-primary hover:bg-primary/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            size="sm"
          >
            Auto-Judge Eligibility
          </Button>
          <Button
            onClick={() => onViewDetails(opportunity)}
            variant="outline"
            size="sm"
            className="border-slate-200 dark:border-slate-700 text-white hover:bg-white/10"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
