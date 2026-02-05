import { motion } from 'framer-motion';
import { DailyAffirmation } from '@/mocks/wellness';
import { Sparkles } from 'lucide-react';

interface MotivationCardProps {
  affirmation: DailyAffirmation;
  size?: 'small' | 'large';
}

export default function MotivationCard({ affirmation, size = 'large' }: MotivationCardProps) {
  const categoryColors = {
    strength: 'from-orange-400/30 to-red-400/20',
    progress: 'from-green-400/30 to-emerald-400/20',
    resilience: 'from-blue-400/30 to-cyan-400/20',
    'self-care': 'from-pink-400/30 to-purple-400/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-gradient-to-br ${categoryColors[affirmation.category]} backdrop-blur-xl rounded-2xl p-6 border border-white/20 relative overflow-hidden group`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl bg-gradient-to-br from-[#C9B458] to-[#C27BA0]" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`${size === 'large' ? 'text-5xl' : 'text-4xl'}`}>{affirmation.icon}</div>
          <Sparkles className="w-5 h-5 text-[#C9B458]" />
        </div>

        <p
          className={`text-white font-bold leading-relaxed ${
            size === 'large' ? 'text-lg' : 'text-base'
          }`}
        >
          {affirmation.text}
        </p>

        <div className="mt-4 pt-6 border-t border-white/10">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {affirmation.category.replace('-', ' ')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
