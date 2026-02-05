import { motion } from 'framer-motion';
import { MoodOption, MoodType } from '@/mocks/wellness';

interface MoodSelectorProps {
  moods: MoodOption[];
  selectedMood: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

export default function MoodSelector({ moods, selectedMood, onSelect }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span className="text-2xl">💭</span>
        How are you feeling?
      </h3>
      <div className="grid grid-cols-5 gap-3">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.type}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mood.type)}
            className={`relative p-4 rounded-2xl border-2 transition-all ${
              selectedMood === mood.type
                ? 'border-white/50 shadow-lg'
                : 'border-white/10 hover:border-white/30'
            }`}
            style={{
              background:
                selectedMood === mood.type
                  ? `linear-gradient(135deg, ${mood.color}30, ${mood.color}10)`
                  : 'rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Glow effect */}
            {selectedMood === mood.type && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                className="absolute inset-0 rounded-2xl blur-xl"
                style={{ backgroundColor: mood.color }}
              />
            )}

            <div className="relative z-10 text-center">
              <div className="text-4xl mb-2">{mood.emoji}</div>
              <div
                className={`text-xs font-bold ${
                  selectedMood === mood.type ? 'text-white' : 'text-gray-400'
                }`}
              >
                {mood.label}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
