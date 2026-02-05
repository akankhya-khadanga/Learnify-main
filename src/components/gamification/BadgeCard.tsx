import { motion } from 'framer-motion';
import { Trophy, Lock, LucideIcon } from 'lucide-react';

interface BadgeCardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    unlocked: boolean;
    progress?: number;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    className?: string;
}

const rarityColors = {
    common: {
        border: 'border-gray-400/30',
        glow: 'from-gray-400/20 to-gray-500/20',
        text: 'text-gray-400'
    },
    rare: {
        border: 'border-blue-400/30',
        glow: 'from-blue-400/20 to-cyan-400/20',
        text: 'text-blue-400'
    },
    epic: {
        border: 'border-purple/30',
        glow: 'from-accent/20 to-pink-400/20',
        text: 'text-accent'
    },
    legendary: {
        border: 'border-neon/30',
        glow: 'from-primary/20 to-yellow-400/20',
        text: 'text-primary'
    }
};

export default function BadgeCard({
    title,
    description,
    icon: Icon = Trophy,
    unlocked,
    progress = 0,
    rarity = 'common',
    className = ''
}: BadgeCardProps) {
    const colors = rarityColors[rarity];

    return (
        <motion.div
            className={`relative group ${className}`}
            whileHover={{ scale: unlocked ? 1.05 : 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Card */}
            <div className={`relative p-4 rounded-xl bg-obsidian border-2 ${unlocked ? colors.border : 'border-slate-200 dark:border-slate-700'} transition-all ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}>

                {/* Glow effect when unlocked */}
                {unlocked && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} rounded-xl blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                )}

                {/* Icon */}
                <div className={`relative w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${unlocked
                        ? `bg-gradient-to-br ${colors.glow} border-2 ${colors.border}`
                        : 'bg-white/5 border-2 border-slate-200 dark:border-slate-700'
                    }`}>
                    {unlocked ? (
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                            }}
                        >
                            <Icon className={`w-8 h-8 ${colors.text}`} />
                        </motion.div>
                    ) : (
                        <Lock className="w-8 h-8 text-muted-foreground" />
                    )}

                    {/* Sparkle particles */}
                    {unlocked && (
                        <>
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className={`absolute w-1 h-1 ${colors.text} rounded-full`}
                                    animate={{
                                        x: [0, Math.random() * 40 - 20],
                                        y: [0, Math.random() * 40 - 20],
                                        opacity: [0, 1, 0],
                                        scale: [0, 1, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.7,
                                    }}
                                />
                            ))}
                        </>
                    )}
                </div>

                {/* Title */}
                <h4 className={`font-bold text-center mb-1 ${unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                    {title}
                </h4>

                {/* Description */}
                <p className="text-xs text-muted-foreground text-center mb-2 line-clamp-2">
                    {description}
                </p>

                {/* Progress bar (if locked and has progress) */}
                {!unlocked && progress > 0 && (
                    <div className="mt-3">
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full bg-gradient-to-r ${colors.glow}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                        <p className="text-xs text-center text-muted-foreground mt-1">
                            {progress}% Complete
                        </p>
                    </div>
                )}

                {/* Rarity badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold uppercase ${colors.text} bg-black/40 backdrop-blur-sm`}>
                    {rarity}
                </div>
            </div>
        </motion.div>
    );
}
