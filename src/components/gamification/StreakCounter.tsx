import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakCounterProps {
    days: number;
    isActive?: boolean;
    className?: string;
}

export default function StreakCounter({
    days,
    isActive = true,
    className = ''
}: StreakCounterProps) {
    const isWarning = days < 2;

    return (
        <motion.div
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Flame icon with animation */}
            <motion.div
                animate={{
                    scale: isActive ? [1, 1.2, 1] : 1,
                    rotate: isActive ? [0, -5, 5, 0] : 0,
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Flame
                    className={`w-5 h-5 ${isWarning ? 'text-orange-400' : 'text-orange-500'
                        }`}
                    fill="currentColor"
                />
            </motion.div>

            {/* Streak count */}
            <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-white leading-none">
                    {days}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Day Streak
                </span>
            </div>

            {/* Warning indicator */}
            {isWarning && (
                <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-deepblack"
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                    }}
                />
            )}

            {/* Glow effect */}
            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl blur-xl -z-10 opacity-50" />
            )}
        </motion.div>
    );
}
