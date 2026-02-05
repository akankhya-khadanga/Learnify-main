import { motion } from 'framer-motion';
import { EmotionalTag, EMOTIONAL_TAGS } from '@/mocks/wellness';

interface QuickTagSelectorProps {
  selectedTags: EmotionalTag[];
  onToggle: (tag: EmotionalTag) => void;
}

export default function QuickTagSelector({ selectedTags, onToggle }: QuickTagSelectorProps) {
  const isSelected = (tag: EmotionalTag) => selectedTags.includes(tag);

  const getTagColor = (tagType: EmotionalTag): string => {
    const negativeStates: EmotionalTag[] = ['OVERWHELMED', 'DEMOTIVATED', 'BURNOUT_RISK', 'CONFUSED', 'ANXIOUS', 'LONELY'];
    return negativeStates.includes(tagType) ? '#C27BA0' : '#10B981';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span className="text-2xl">🏷️</span>
        What's on your mind?
      </h3>
      <div className="flex flex-wrap gap-2">
        {EMOTIONAL_TAGS.map((tag, index) => {
          const selected = isSelected(tag.type);
          const color = getTagColor(tag.type);

          return (
            <motion.button
              key={tag.type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggle(tag.type)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all border-2 ${
                selected
                  ? 'border-white/40 shadow-lg'
                  : 'border-white/10 hover:border-white/30'
              }`}
              style={{
                background: selected
                  ? `linear-gradient(135deg, ${color}40, ${color}20)`
                  : 'rgba(255, 255, 255, 0.05)',
                color: selected ? 'white' : '#9CA3AF'
              }}
            >
              <span className="mr-2">{tag.icon}</span>
              {tag.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
