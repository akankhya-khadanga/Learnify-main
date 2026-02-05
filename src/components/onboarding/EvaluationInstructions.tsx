import { motion } from 'framer-motion';
import { Domain } from '@/mocks/onboarding';
import { Button } from '@/components/ui/button';
import { Brain, Clock, Target, Sparkles } from 'lucide-react';

interface EvaluationInstructionsProps {
  domain: Domain;
  onStart: () => void;
}

export default function EvaluationInstructions({ domain, onStart }: EvaluationInstructionsProps) {
  const features = [
    {
      icon: Brain,
      title: 'Adaptive Testing',
      description: 'Questions adjust based on your performance',
      color: '#C9B458'
    },
    {
      icon: Clock,
      title: '5 Minutes',
      description: 'Quick evaluation to assess your level',
      color: '#C27BA0'
    },
    {
      icon: Target,
      title: 'Personalized Match',
      description: 'Get paired with the perfect mentor for you',
      color: '#6DAEDB'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1115] via-[#151823] to-[#0F1115] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C9B458]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#6DAEDB]/20 to-transparent rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* Domain badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="text-4xl">{domain.icon}</div>
              <div>
                <div className="text-sm text-gray-400">Selected Domain</div>
                <div className="text-xl font-semibold text-white">{domain.name}</div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#C9B458] via-[#C27BA0] to-[#6DAEDB] bg-clip-text text-transparent"
            >
              Quick Evaluation
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-300 text-lg mb-10 leading-relaxed"
            >
              We'll ask you a few questions to understand your current level and match you
              with the perfect mentor who can guide you effectively.
            </motion.p>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon size={24} style={{ color: feature.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Start button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                onClick={onStart}
                size="lg"
                className="w-full bg-gradient-to-r from-[#C9B458] to-[#C27BA0] hover:opacity-90 text-white font-semibold text-lg py-6 rounded-xl group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles size={20} />
                  Start Evaluation
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#C27BA0] to-[#6DAEDB]"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
