import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Target } from 'lucide-react';

interface ProcessingScreenProps {
  onComplete: () => void;
}

export default function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = Array.from({ length: 20 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1115] via-[#151823] to-[#0F1115] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated particles */}
      {particles.map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#C9B458', '#C27BA0', '#6DAEDB'][index % 3],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}

      <div className="max-w-2xl w-full text-center relative z-10">
        {/* Main icon */}
        <motion.div
          className="mb-8 inline-block"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C9B458] to-[#6DAEDB] rounded-full blur-2xl opacity-50" />
            <Brain size={80} className="text-[#C9B458] relative z-10" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#C9B458] via-[#C27BA0] to-[#6DAEDB] bg-clip-text text-transparent"
        >
          Analyzing Your Performance
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-lg mb-12"
        >
          Calculating your level and finding the perfect mentor match...
        </motion.p>

        {/* Processing steps */}
        <div className="space-y-6 max-w-md mx-auto">
          {[
            { icon: Brain, label: 'Evaluating responses', delay: 0.6 },
            { icon: Target, label: 'Determining skill level', delay: 1.2 },
            { icon: Sparkles, label: 'Matching with mentor', delay: 1.8 },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.delay }}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <step.icon size={24} className="text-[#C9B458]" />
              </motion.div>
              <span className="text-white font-medium">{step.label}</span>
              <div className="ml-auto flex gap-1">
                {[0, 1, 2].map((dot) => (
                  <motion.div
                    key={dot}
                    className="w-2 h-2 rounded-full bg-[#C9B458]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: dot * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
