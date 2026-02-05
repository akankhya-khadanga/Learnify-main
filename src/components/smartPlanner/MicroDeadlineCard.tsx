import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ExamEntry } from '@/mocks/studyPlanner';
import { Progress } from '@/components/ui/progress';

interface MicroDeadlineCardProps {
  exam: ExamEntry;
  daysRemaining: number;
}

export default function MicroDeadlineCard({ exam, daysRemaining }: MicroDeadlineCardProps) {
  const getUrgencyColor = () => {
    if (daysRemaining <= 3) return '#C27BA0'; // Purple - urgent
    if (daysRemaining <= 7) return '#C9B458'; // Neon - soon
    return '#6DAEDB'; // Blue - comfortable
  };

  const getUrgencyLabel = () => {
    if (daysRemaining <= 3) return 'URGENT';
    if (daysRemaining <= 7) return 'SOON';
    return 'ON TRACK';
  };

  const completedTopics = Math.floor(Math.random() * exam.topics.length);
  const progress = (completedTopics / exam.topics.length) * 100;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 relative overflow-hidden group"
    >
      {/* Accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: exam.color }}
      />

      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl"
        style={{
          background: `radial-gradient(circle at top right, ${exam.color}, transparent)`
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-white mb-1 line-clamp-1">{exam.subject}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(exam.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })} · {exam.time}
              </span>
            </div>
          </div>
          <div
            className="px-2 py-1 rounded text-[10px] font-black"
            style={{
              backgroundColor: `${getUrgencyColor()}30`,
              color: getUrgencyColor()
            }}
          >
            {getUrgencyLabel()}
          </div>
        </div>

        {/* Days remaining */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {daysRemaining <= 3 ? (
              <AlertCircle className="w-4 h-4" style={{ color: getUrgencyColor() }} />
            ) : (
              <CheckCircle2 className="w-4 h-4" style={{ color: getUrgencyColor() }} />
            )}
            <span className="text-2xl font-black" style={{ color: getUrgencyColor() }}>
              {daysRemaining}
            </span>
            <span className="text-sm text-gray-400">days left</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-semibold">TOPICS COVERED</span>
            <span className="text-xs font-bold text-white">
              {completedTopics}/{exam.topics.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1">
          {exam.topics.slice(0, 3).map((topic, index) => (
            <span
              key={index}
              className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10"
            >
              {topic}
            </span>
          ))}
          {exam.topics.length > 3 && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-gray-400">
              +{exam.topics.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
