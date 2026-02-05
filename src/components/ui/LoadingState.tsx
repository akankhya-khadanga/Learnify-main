import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface LoadingStateProps {
    state: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    className?: string;
}

export function LoadingState({ state, message, className = '' }: LoadingStateProps) {
    if (state === 'idle') return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`flex items-center gap-3 ${className}`}
        >
            {state === 'loading' && (
                <>
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span className="text-white/90 font-bold">{message || 'Loading...'}</span>
                </>
            )}

            {state === 'success' && (
                <>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span className="text-green-500 font-bold">{message || 'Success!'}</span>
                </>
            )}

            {state === 'error' && (
                <>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                    >
                        <XCircle className="w-5 h-5 text-red-500" />
                    </motion.div>
                    <span className="text-red-500 font-bold">{message || 'Error occurred'}</span>
                </>
            )}
        </motion.div>
    );
}
