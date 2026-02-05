import { motion } from 'framer-motion';
import { StressLevel } from '@/mocks/wellness';
import { Activity } from 'lucide-react';

interface StressSliderProps {
  level: StressLevel;
  onChange: (level: StressLevel) => void;
}

export default function StressSlider({ level, onChange }: StressSliderProps) {
  const getStressColor = (value: number): string => {
    if (value <= 3) return '#10B981';
    if (value <= 6) return '#F59E0B';
    return '#EF4444';
  };

  const getStressLabel = (value: number): string => {
    if (value === 0) return 'Completely Calm';
    if (value <= 3) return 'Low Stress';
    if (value <= 6) return 'Moderate Stress';
    if (value <= 8) return 'High Stress';
    return 'Severe Stress';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Stress Level
        </h3>
        <motion.div
          key={level}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="px-4 py-2 rounded-full font-black text-lg"
          style={{
            backgroundColor: `${getStressColor(level)}30`,
            color: getStressColor(level)
          }}
        >
          {level}/10
        </motion.div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="10"
          value={level}
          onChange={e => onChange(Number(e.target.value) as StressLevel)}
          className="w-full h-3 rounded-full appearance-none cursor-pointer slider-custom"
          style={{
            background: `linear-gradient(to right, 
              #10B981 0%, 
              #10B981 30%, 
              #F59E0B 30%, 
              #F59E0B 60%, 
              #EF4444 60%, 
              #EF4444 100%)`
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>😌 Calm</span>
          <span>😰 Stressed</span>
        </div>
      </div>

      {/* Label */}
      <motion.div
        key={`label-${level}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-sm text-gray-400">{getStressLabel(level)}</p>
      </motion.div>

      <style>{`
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 3px solid ${getStressColor(level)};
        }

        .slider-custom::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          border: 3px solid ${getStressColor(level)};
        }
      `}</style>
    </div>
  );
}
