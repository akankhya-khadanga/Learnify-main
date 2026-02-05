import { motion } from 'framer-motion';
import { Teacher } from '@/mocks/onboarding';
import { Button } from '@/components/ui/button';
import { Award, Users, Star, CheckCircle2, Sparkles } from 'lucide-react';

interface TeacherAssignmentProps {
  teacher: Teacher;
  iqTier: 'low' | 'medium' | 'high';
  onAccept: () => void;
}

export default function TeacherAssignment({ teacher, iqTier, onAccept }: TeacherAssignmentProps) {
  const tierInfo = {
    low: {
      title: 'Foundation Builder',
      description: 'You\'ve been matched with an expert mentor who specializes in building strong fundamentals',
      color: '#C9B458',
      gradient: 'from-[#C9B458] to-[#C27BA0]',
    },
    medium: {
      title: 'Balanced Learner',
      description: 'You\'ve been matched with a mentor who balances theory and practical application',
      color: '#C27BA0',
      gradient: 'from-[#C27BA0] to-[#6DAEDB]',
    },
    high: {
      title: 'Advanced Explorer',
      description: 'You\'ve been matched with a mentor who will guide your independent learning journey',
      color: '#6DAEDB',
      gradient: 'from-[#6DAEDB] to-[#C9B458]',
    },
  };

  const info = tierInfo[iqTier];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1115] via-[#151823] to-[#0F1115] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-50"
                style={{ backgroundColor: info.color }}
              />
              <CheckCircle2 size={64} style={{ color: info.color }} className="relative z-10" />
            </div>
          </motion.div>

          <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}>
            {info.title}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">{info.description}</p>
        </motion.div>

        {/* Teacher card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: info.color }}
          />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-50"
                    style={{ backgroundColor: info.color }}
                  />
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-7xl border-4 border-white/20">
                    {teacher.avatar}
                  </div>
                </div>
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  {teacher.name}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-gray-300 mb-6 leading-relaxed"
                >
                  {teacher.bio}
                </motion.p>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-wrap gap-6 mb-6 justify-center md:justify-start"
                >
                  <div className="flex items-center gap-2">
                    <Award size={20} style={{ color: info.color }} />
                    <span className="text-white font-semibold">{teacher.experience} years</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={20} style={{ color: info.color }} />
                    <span className="text-white font-semibold">{teacher.rating}/5.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={20} style={{ color: info.color }} />
                    <span className="text-white font-semibold">{teacher.studentsCount} students</span>
                  </div>
                </motion.div>

                {/* Specialties */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="text-sm text-gray-400 mb-2">Specialties</div>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {teacher.specialties.map((specialty, index) => (
                      <motion.span
                        key={specialty}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1 + index * 0.1 }}
                        className="px-4 py-2 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${info.color}20`,
                          color: info.color,
                        }}
                      >
                        {specialty}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Accept button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="mt-10"
            >
              <Button
                onClick={onAccept}
                size="lg"
                className={`w-full bg-gradient-to-r ${info.gradient} hover:opacity-90 text-white font-semibold text-lg py-7 rounded-xl group relative overflow-hidden`}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Sparkles size={20} />
                  Accept & Start Learning Journey
                </span>
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, ${info.color}, transparent)`,
                  }}
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Button>
              <p className="text-center text-sm text-gray-500 mt-4">
                You can change your mentor anytime from settings
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
