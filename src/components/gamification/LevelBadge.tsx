import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';

interface LevelBadgeProps {
    level: number;
    rank?: string;
    size?: 'sm' | 'md' | 'lg';
    showRank?: boolean;
    className?: string;
}

const rankNames: Record<number, string> = {
    1: 'Novice',
    5: 'Explorer',
    10: 'Adept',
    15: 'Expert',
    20: 'Master',
    25: 'Grandmaster',
    30: 'Legend',
};

const getRank = (level: number): string => {
    const thresholds = Object.keys(rankNames).map(Number).sort((a, b) => b - a);
    const threshold = thresholds.find(t => level >= t) ?? 1;
    return rankNames[threshold];
};

const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-24 h-24 text-3xl',
    lg: 'w-32 h-32 text-4xl',
};

export default function LevelBadge({
    level,
    rank,
    size = 'md',
    showRank = true,
    className = ''
}: LevelBadgeProps) {
    const displayRank = rank || getRank(level);
    const isHighLevel = level >= 20;

    return (
        <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
            {/* Circular badge */}
            <motion.div
                className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Animated border */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: isHighLevel
                            ? 'linear-gradient(45deg, #CCFF00, #FFD700, #CCFF00)'
                            : 'linear-gradient(45deg, #A855F7, #CCFF00, #A855F7)',
                    }}
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Inner circle */}
                <div className="absolute inset-1 rounded-full bg-slate-50 dark:bg-slate-900" />

                {/* Level number */}
                <motion.span
                    className="relative z-10 font-display font-black bg-gradient-to-br from-primary via-yellow-400 to-primary bg-clip-text text-transparent"
                    animate={{
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {level}
                </motion.span>

                {/* Crown for high levels */}
                {isHighLevel && (
                    <motion.div
                        className="absolute -top-2 -right-2"
                        animate={{
                            rotate: [-10, 10, -10],
                            y: [0, -2, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Crown className="w-5 h-5 text-primary" fill="currentColor" />
                    </motion.div>
                )}

                {/* Particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary rounded-full"
                        style={{
                            left: '50%',
                            top: '50%',
                        }}
                        animate={{
                            x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                            y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3,
                        }}
                    />
                ))}
            </motion.div>

            {/* Rank name */}
            {showRank && (
                <div className="text-center">
                    <p className="font-bold text-white text-sm uppercase tracking-wider">
                        {displayRank}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Rank
                    </p>
                </div>
            )}
        </div>
    );
}
