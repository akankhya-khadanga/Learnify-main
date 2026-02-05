import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface XPGainAnimationProps {
    amount: number;
    show: boolean;
    onComplete?: () => void;
    position?: { x: number; y: number };
}

export const XPGainAnimation: React.FC<XPGainAnimationProps> = ({
    amount,
    show,
    onComplete,
    position = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
}) => {
    useEffect(() => {
        if (show && amount > 0) {
            // Trigger confetti
            const colors = ['#FFD700', '#FF1493', '#00CED1'];

            confetti({
                particleCount: amount > 50 ? 100 : 50,
                spread: 70,
                origin: {
                    x: position.x / window.innerWidth,
                    y: position.y / window.innerHeight,
                },
                colors,
            });

            // Auto-complete after animation
            const timer = setTimeout(() => {
                onComplete?.();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [show, amount, position, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -100, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: position.x,
                        top: position.y,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <div className="flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black text-2xl">
                        <Sparkles className="w-6 h-6" />
                        <span>+{amount} XP</span>
                        <Sparkles className="w-6 h-6" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

interface LevelUpAnimationProps {
    level: number;
    show: boolean;
    onComplete?: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
    level,
    show,
    onComplete,
}) => {
    useEffect(() => {
        if (show) {
            // Epic confetti for level up
            const duration = 3000;
            const animationEnd = Date.now() + duration;

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min;
            };

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    onComplete?.();
                    return;
                }

                confetti({
                    particleCount: 3,
                    angle: randomInRange(55, 125),
                    spread: randomInRange(50, 70),
                    origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
                    colors: ['#FFD700', '#FF1493', '#00CED1', '#FFFFFF'],
                });
            }, 50);

            return () => clearInterval(interval);
        }
    }, [show, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="bg-gradient-to-br from-gold via-pink to-gold p-8 rounded-2xl border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-8xl mb-4"
                            >
                                🎉
                            </motion.div>

                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-6xl font-black text-black mb-2"
                            >
                                LEVEL UP!
                            </motion.h1>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-4xl font-black text-black"
                            >
                                Level {level}
                            </motion.p>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="text-xl font-bold text-black/80 mt-4"
                            >
                                Keep up the amazing work! 🚀
                            </motion.p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
