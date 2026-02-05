import { motion } from 'framer-motion';
import { MotivationMemory } from '@/mocks/wellness';
import { Heart, Calendar } from 'lucide-react';

interface MemoryCardProps {
  memory: MotivationMemory;
}

export default function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-gradient-to-br from-[#C27BA0]/20 to-[#6DAEDB]/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 relative overflow-hidden group"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl bg-gradient-to-br from-[#C27BA0] to-[#6DAEDB]" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C27BA0] to-[#6DAEDB] flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {new Date(memory.date).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </div>

        <h4 className="text-xl font-black text-white mb-3">{memory.title}</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{memory.description}</p>
      </div>
    </motion.div>
  );
}
