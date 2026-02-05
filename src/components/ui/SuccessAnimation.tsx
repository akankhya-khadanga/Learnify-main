import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';

interface SuccessAnimationProps {
    show: boolean;
    message?: string;
}

export function SuccessAnimation({ show, message = 'Success!' }: SuccessAnimationProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                            delay: 0.1
                        }}
                        className="relative"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full animate-pulse" />

                        {/* Success icon */}
                        <div className="relative bg-white dark:bg-slate-800 border-4 border-green-500 rounded-full p-8 shadow-[0_0_50px_rgba(34,197,94,0.5)]">
                            <CheckCircle className="w-24 h-24 text-green-500" />
                        </div>

                        {/* Sparkles */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                    x: Math.cos((i * Math.PI * 2) / 6) * 100,
                                    y: Math.sin((i * Math.PI * 2) / 6) * 100,
                                }}
                                transition={{
                                    duration: 1,
                                    delay: 0.3 + i * 0.1,
                                    ease: 'easeOut'
                                }}
                                className="absolute top-1/2 left-1/2"
                            >
                                <Sparkles className="w-6 h-6 text-primary" />
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Message */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="absolute bottom-1/3 text-2xl font-black text-green-500 uppercase"
                    >
                        {message}
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
