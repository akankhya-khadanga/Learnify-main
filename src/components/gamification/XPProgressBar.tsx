import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPProgressBarProps {
    currentXP: number;
    requiredXP: number;
    level: number;
    showDetails?: boolean;
    className?: string;
}

export default function XPProgressBar({
    currentXP,
    requiredXP,
    level,
    showDetails = true,
    className = ''
}: XPProgressBarProps) {
    const percentage = Math.min((currentXP / requiredXP) * 100, 100);
    const xpLeft = requiredXP - currentXP;

    return (
        <div className={`space-y-2 ${className}`}>
            {showDetails && (
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#6C5BA6] to-[#6C5BA6]/70 rounded-full border border-[#6C5BA6]/50">
                            <Zap className="w-3 h-3 text-primary" />
                            <span className="font-bold text-white">LEVEL {level}</span>
                        </div>
                        <span className="text-muted-foreground">
                            {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
                        </span>
                    </div>
                    <span className="text-primary font-semibold">
                        {xpLeft > 0 ? `${xpLeft.toLocaleString()} to Level ${level + 1}` : 'MAX LEVEL!'}
                    </span>
                </div>
            )}

            {/* Progress Bar */}
            <div className="relative h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#6C5BA6]/20 via-[#DAFD78]/20 to-[#6C5BA6]/20 animate-pulse" />

                {/* Progress fill */}
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#6C5BA6] via-[#DAFD78] to-yellow-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.div>

                {/* Particles on hover */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    whileHover={{ scale: 1.02 }}
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-primary rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 1.5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.4,
                            }}
                        />
                    ))}
                </motion.div>
            </div>

            {!showDetails && (
                <div className="text-xs text-center text-muted-foreground">
                    {percentage.toFixed(0)}% to next level
                </div>
            )}
        </div>
    );
}
