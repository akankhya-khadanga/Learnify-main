import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaceSuggestion } from '@/mocks/deadlineRadar';
import { Lightbulb, TrendingUp, Calendar, Clock } from 'lucide-react';

interface PaceSuggestionCardProps {
  suggestions: PaceSuggestion[];
}

export const PaceSuggestionCard: React.FC<PaceSuggestionCardProps> = ({ suggestions }) => {
  const topSuggestions = suggestions.slice(0, 3);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return '#C9B458'; // Gold
    if (confidence >= 70) return '#C27BA0'; // Pink
    return '#6DAEDB'; // Blue
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {topSuggestions.length === 0 ? (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-6">
          <div className="flex flex-col items-center justify-center h-48 text-white/40">
            <Lightbulb className="w-12 h-12 mb-3" />
            <p className="text-sm font-bold">No pacing suggestions available</p>
          </div>
        </Card>
      ) : (
        topSuggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-start gap-3">
                <div 
                  className="w-10 h-10 rounded-full border-4 border-black flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: getConfidenceColor(suggestion.confidence) }}
                >
                  <Lightbulb className="w-5 h-5 text-black" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-black text-white text-sm line-clamp-2">
                      {suggestion.taskTitle}
                    </h3>
                    <Badge 
                      className="flex-shrink-0 border-2 border-black font-black text-xs"
                      style={{ 
                        backgroundColor: getConfidenceColor(suggestion.confidence),
                        color: 'black'
                      }}
                    >
                      {suggestion.confidence}%
                    </Badge>
                  </div>

                  <p className="text-xs text-white font-bold mb-3 leading-relaxed">
                    {suggestion.suggestion}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-white/70">
                      <Calendar className="w-3 h-3 text-[#C9B458]" />
                      <span className="font-bold">Start: {formatDate(suggestion.idealStartDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/70">
                      <Clock className="w-3 h-3 text-[#C27BA0]" />
                      <span className="font-bold">{suggestion.dailyHours}h/day</span>
                    </div>
                  </div>

                  {/* Confidence progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white/60">Confidence</span>
                      <span className="text-xs font-black text-white">{suggestion.confidence}%</span>
                    </div>
                    <div className="h-2 bg-black/50 border-2 border-black rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${suggestion.confidence}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.6, ease: 'easeOut' }}
                        className="h-full"
                        style={{ backgroundColor: getConfidenceColor(suggestion.confidence) }}
                      />
                    </div>
                  </div>

                  {/* Reasoning tooltip */}
                  <details className="mt-2">
                    <summary className="text-xs text-white/60 cursor-pointer hover:text-white/90 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Why this suggestion?
                    </summary>
                    <p className="text-xs text-white/80 mt-2 pl-4 italic border-l-2 border-[#C9B458]">
                      {suggestion.reasoning}
                    </p>
                  </details>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
};
