import { motion } from 'framer-motion';
import { Target, ArrowRight, Zap } from 'lucide-react';

interface DailyQuestProps {
    title: string;
    description: string;
    progress: number;
    maxProgress: number;
    xpReward: number;
    className?: string;
    onClaim?: () => void;
}

export default function DailyQuest({
    title,
    description,
    progress,
    maxProgress,
    xpReward,
    className = '',
    onClaim
}: DailyQuestProps) {
    const percentage = (progress / maxProgress) * 100;
    const isComplete = progress >= maxProgress;

    return (
        <motion.div
            className={`relative p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 ${className}`}
            whileHover={{ scale: 1.02, y: -3 }}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C5BA6]/10 to-[#DAFD78]/5 rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-gradient-to-br from-[#6C5BA6] to-[#6C5BA6]/70 rounded-xl">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">Daily Quest</h3>
                            {isComplete && (
                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full border border-[#DAFD78]/30">
                                    COMPLETE!
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-semibold text-white/90 mt-0.5">{title}</p>
                    </div>
                </div>

                {/* XP Reward */}
                <div className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 rounded-full border border-[#DAFD78]/30">
                    <Zap className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                    <span className="text-xs font-bold text-primary">+{xpReward} XP</span>
                </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground mb-3">{description}</p>

            {/* Progress */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium">
                        {progress} / {maxProgress} Completed
                    </span>
                    <span className="text-primary font-semibold">{percentage.toFixed(0)}%</span>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#6C5BA6] via-[#DAFD78] to-yellow-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </motion.div>
                </div>
            </div>

            {/* Claim button */}
            {isComplete && (
                <motion.button
                    onClick={onClaim}
                    className="mt-3 w-full py-2.5 bg-gradient-to-r from-[#DAFD78] to-yellow-400 hover:from-[#DAFD78]/90 hover:to-yellow-400/90 text-[#0C0E17] font-bold rounded-xl flex items-center justify-center gap-2 group text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    Claim Reward
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            )}
        </motion.div>
    );
}
