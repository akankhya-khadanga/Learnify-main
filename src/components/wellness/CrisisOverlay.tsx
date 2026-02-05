import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BreathingExercise, CrisisResource } from '@/mocks/wellness';
import { X, Phone, MessageCircle, ExternalLink, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CrisisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: BreathingExercise;
  resources: CrisisResource[];
}

export default function CrisisOverlay({ isOpen, onClose, exercise, resources }: CrisisOverlayProps) {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  useEffect(() => {
    if (!isBreathingActive) return;

    const phases: Array<'inhale' | 'hold' | 'exhale' | 'pause'> = ['inhale', 'hold', 'exhale', 'pause'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setBreathingPhase(phases[currentIndex]);
    }, exercise.pattern[phases[currentIndex]] * 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, exercise]);

  const getPhaseText = (): string => {
    switch (breathingPhase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      case 'pause': return 'Pause...';
    }
  };

  const getPhaseColor = (): string => {
    switch (breathingPhase) {
      case 'inhale': return '#6DAEDB';
      case 'hold': return '#C9B458';
      case 'exhale': return '#C27BA0';
      case 'pause': return '#9CA3AF';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50"
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="min-h-screen px-4 py-8">
              <div className="max-w-4xl mx-auto">
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={onClose}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Breathing Exercise */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/20 mb-8 text-center"
                >
                  <h2 className="text-3xl font-black text-white mb-4">Take a Deep Breath</h2>
                  <p className="text-gray-400 mb-8">
                    You're not alone. Let's take a moment together to find some calm.
                  </p>

                  {/* Breathing Circle */}
                  <div className="relative w-64 h-64 mx-auto mb-8">
                    <motion.div
                      animate={{
                        scale: breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'exhale' ? 0.7 : 1,
                        opacity: breathingPhase === 'pause' ? 0.5 : 1
                      }}
                      transition={{
                        duration: exercise.pattern[breathingPhase],
                        ease: 'easeInOut'
                      }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${getPhaseColor()}40, ${getPhaseColor()}10)`,
                        boxShadow: `0 0 60px ${getPhaseColor()}40`
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <Wind className="w-12 h-12 text-white mx-auto mb-4" />
                        <motion.p
                          key={breathingPhase}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-bold text-white"
                        >
                          {getPhaseText()}
                        </motion.p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsBreathingActive(!isBreathingActive)}
                    className={`${
                      isBreathingActive
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-r from-[#C9B458] to-[#C27BA0] hover:opacity-90'
                    } text-white font-bold px-8 py-3`}
                  >
                    {isBreathingActive ? 'Stop Exercise' : 'Start Breathing Exercise'}
                  </Button>
                </motion.div>

                {/* Crisis Resources */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20"
                >
                  <h3 className="text-2xl font-black text-white mb-2">You're Not Alone</h3>
                  <p className="text-gray-400 mb-6">
                    Reach out to trained professionals who can help. All services are confidential.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((resource, index) => (
                      <motion.div
                        key={resource.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {resource.type === 'hotline' && (
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                              <Phone className="w-5 h-5 text-green-400" />
                            </div>
                          )}
                          {resource.type === 'chat' && (
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <MessageCircle className="w-5 h-5 text-blue-400" />
                            </div>
                          )}
                          {resource.type === 'website' && (
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="w-5 h-5 text-purple-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1">{resource.name}</h4>
                            <p className="text-sm text-gray-400 mb-2">{resource.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-black text-[#C9B458]">{resource.contact}</span>
                              <span className="text-xs text-gray-500">{resource.available}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
