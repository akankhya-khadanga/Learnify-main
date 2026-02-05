/**
 * PHASE 19: DifficultySelector Component
 * Tier picker (Bronze/Silver/Gold/Diamond)
 */

import { motion } from 'framer-motion';
import { DifficultyTier, getTierColor } from '@/mocks/gameHub';
import { Shield, Star, Crown, Gem } from 'lucide-react';

interface DifficultySelectorProps {
  selected: DifficultyTier;
  onChange: (tier: DifficultyTier) => void;
  availableTiers?: DifficultyTier[];
}

const TIER_CONFIG = {
  Bronze: {
    icon: Shield,
    label: 'Bronze',
    description: 'Beginner friendly',
  },
  Silver: {
    icon: Star,
    label: 'Silver',
    description: 'Intermediate challenge',
  },
  Gold: {
    icon: Crown,
    label: 'Gold',
    description: 'Advanced players',
  },
  Diamond: {
    icon: Gem,
    label: 'Diamond',
    description: 'Expert mode',
  },
};

export function DifficultySelector({ 
  selected, 
  onChange,
  availableTiers = ['Bronze', 'Silver', 'Gold', 'Diamond']
}: DifficultySelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-text/80 uppercase">Select Difficulty</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {availableTiers.map((tier) => {
          const config = TIER_CONFIG[tier];
          const Icon = config.icon;
          const tierColor = getTierColor(tier);
          const isSelected = selected === tier;

          return (
            <motion.button
              key={tier}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange(tier)}
              className={`relative p-4 rounded-lg border-4 border-black transition-all ${
                isSelected
                  ? 'shadow-soft'
                  : 'shadow-soft-sm hover:shadow-soft opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: isSelected ? tierColor : 'transparent',
                borderColor: tierColor,
              }}
            >
              {/* Icon */}
              <Icon
                className={`h-8 w-8 mx-auto mb-2 ${
                  isSelected ? 'text-black' : 'text-text/60'
                }`}
              />

              {/* Label */}
              <p
                className={`text-sm font-black uppercase ${
                  isSelected ? 'text-black' : 'text-text'
                }`}
              >
                {config.label}
              </p>

              {/* Description */}
              <p
                className={`text-xs mt-1 ${
                  isSelected ? 'text-black/70' : 'text-text/50'
                }`}
              >
                {config.description}
              </p>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="difficulty-selected"
                  className="absolute -top-2 -right-2 bg-black text-primary w-6 h-6 rounded-full flex items-center justify-center border border-neon/30"
                >
                  ✓
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
