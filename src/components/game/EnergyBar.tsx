import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { ENERGY_CONFIG } from '@/mocks/game';

interface EnergyBarProps {
  currentEnergy: number;
  maxEnergy?: number;
  showLabel?: boolean;
}

export const EnergyBar = ({ 
  currentEnergy, 
  maxEnergy = ENERGY_CONFIG.maxEnergy,
  showLabel = true 
}: EnergyBarProps) => {
  const percentage = (currentEnergy / maxEnergy) * 100;
  
  const getEnergyColor = () => {
    if (percentage >= 70) return 'from-[#C9B458] to-[#FFD700]';
    if (percentage >= 40) return 'from-amber-500 to-yellow-500';
    if (percentage >= 20) return 'from-orange-500 to-amber-500';
    return 'from-red-500 to-orange-500';
  };

  const getGlowColor = () => {
    if (percentage >= 70) return 'shadow-[0_0_20px_rgba(201,180,88,0.6)]';
    if (percentage >= 40) return 'shadow-[0_0_20px_rgba(245,158,11,0.5)]';
    if (percentage >= 20) return 'shadow-[0_0_20px_rgba(249,115,22,0.5)]';
    return 'shadow-[0_0_20px_rgba(239,68,68,0.5)]';
  };

  return (
    <div className="w-full space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#C9B458]" />
            <span className="font-semibold">Energy</span>
          </div>
          <span className="font-bold text-[#C9B458]">
            {currentEnergy}/{maxEnergy}
          </span>
        </div>
      )}
      
      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getEnergyColor()} ${getGlowColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </motion.div>
        
        {/* Energy level indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-xs font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            key={currentEnergy}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {percentage.toFixed(0)}%
          </motion.span>
        </div>
      </div>
    </div>
  );
};
