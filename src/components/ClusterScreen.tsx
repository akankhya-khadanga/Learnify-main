import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ClusterConfig } from '@/types/navigation';
import { useNavigationStore } from '@/store/navigationStore';

interface ClusterScreenProps {
  cluster: ClusterConfig;
}

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: 20,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function ClusterScreen({ cluster }: ClusterScreenProps) {
  const navigate = useNavigate();
  const exitCluster = useNavigationStore((state) => state.exitCluster);

  const handleBack = () => {
    exitCluster();
    navigate('/dashboard');
  };

  const handleItemClick = (href: string) => {
    navigate(href);
  };

  // Helper to get icon component
  const getIconComponent = (iconName: string) => {
    return (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated background gradient with parallax effect */}
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={{ scale: 1.2, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${cluster.gradient} animate-pulse`} />
          <motion.div
            className={`absolute inset-0 bg-gradient-to-tl ${cluster.gradient}`}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="relative z-10 p-6 md:p-8"
        >
          <motion.button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </motion.button>

          <div className="flex items-center gap-4 mb-2">
            {(() => {
              const IconComponent = getIconComponent(cluster.icon);
              return IconComponent ? (
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cluster.gradient} flex items-center justify-center shadow-lg`}
                  whileHover={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </motion.div>
              ) : null;
            })()}
            <div>
              <motion.h1
                className="text-4xl md:text-5xl font-black tracking-tight"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {cluster.label}
              </motion.h1>
              <motion.p
                className="text-white/60 text-lg mt-1"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {cluster.description}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Grid of items with staggered animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
            {cluster.items.map((item, index) => {
              const IconComponent = getIconComponent(item.icon);

              return (
                <motion.button
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    transition: { duration: 0.2 },
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleItemClick(item.href)}
                  className="relative group"
                >
                  {/* Card */}
                  <div className="relative bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-3xl p-8 h-full overflow-hidden hover:border-white/30 transition-all shadow-2xl">
                    {/* Gradient overlay with smooth transition */}
                    {item.color && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${item.color}`}
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 0.15 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    {/* Animated shine effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      initial={{ x: '-100%', y: '-100%' }}
                      whileHover={{
                        x: '100%',
                        y: '100%',
                      }}
                      transition={{ duration: 0.8 }}
                      style={{
                        background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                      }}
                    />

                    {/* Icon with bounce animation */}
                    <motion.div
                      className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color || cluster.gradient} flex items-center justify-center mb-4 shadow-lg`}
                      whileHover={{
                        rotate: [0, -5, 5, 0],
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                    </motion.div>

                    {/* Label */}
                    <h3 className="relative z-10 text-2xl font-black mb-2 text-white">
                      {item.label}
                    </h3>

                    {/* Description */}
                    {item.description && (
                      <p className="relative z-10 text-white/60 text-sm">
                        {item.description}
                      </p>
                    )}

                    {/* Hover arrow with smooth animation */}
                    <motion.div
                      className="absolute bottom-4 right-4"
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.5,
                          ease: 'easeInOut',
                        }}
                        className="text-white/60 text-xl font-bold"
                      >
                        →
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
