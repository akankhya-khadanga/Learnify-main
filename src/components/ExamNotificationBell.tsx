/**
 * EXAM NOTIFICATION BELL
 * Global notification icon with badge and dropdown
 * Shows countdown for nearest exam
 * Appears in navbar across all pages
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Clock, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { useExamCountdown } from '@/hooks/useExamCountdown';
import { cn } from '@/lib/utils';

export function ExamNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    nearestExam,
    upcomingExams,
    hasExamToday,
    hasExamTomorrow,
    upcomingCount,
    isLoading,
  } = useExamCountdown();

  // Don't render if no upcoming exams
  if (!isLoading && upcomingCount === 0) {
    return null;
  }

  // Badge color based on urgency
  const getBadgeColor = () => {
    if (hasExamToday) return 'bg-red-500';
    if (hasExamTomorrow) return 'bg-orange-500';
    if (nearestExam && nearestExam.daysLeft <= 3) return 'bg-yellow-500';
    return 'bg-[#C9B458]'; // Gold for normal upcoming exams
  };

  // Icon animation based on urgency
  const getIconAnimation = () => {
    if (hasExamToday || hasExamTomorrow) {
      return {
        scale: [1, 1.1, 1],
        rotate: [0, 10, -10, 0],
      };
    }
    return {};
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-all duration-200",
          "hover:bg-white/10",
          isOpen && "bg-white/10"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={getIconAnimation()}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
        ) : (
          <>
            <Bell className="w-5 h-5 text-white" />
            
            {/* Badge */}
            {upcomingCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "absolute -top-1 -right-1",
                  "flex items-center justify-center",
                  "w-5 h-5 rounded-full",
                  "text-white text-xs font-bold",
                  "border-2 border-deepblack",
                  getBadgeColor()
                )}
              >
                {upcomingCount}
              </motion.span>
            )}

            {/* Pulse animation for critical exams */}
            {(hasExamToday || hasExamTomorrow) && (
              <motion.span
                className="absolute inset-0 rounded-lg"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  background: hasExamToday 
                    ? 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)',
                }}
              />
            )}
          </>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 mt-2 w-80 z-50",
              "bg-gradient-to-br from-[#0F1115] to-[#151823]",
              "border border-white/10 rounded-xl shadow-2xl",
              "overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C9B458]/20 to-[#C27BA0]/20 p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9B458]" />
                <h3 className="font-bold text-white">Exam Countdown</h3>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {upcomingExams.length === 0 ? (
                <div className="p-6 text-center text-white/50">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p className="text-sm">No upcoming exams</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {upcomingExams.map((countdown, index) => (
                    <motion.div
                      key={countdown.exam.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-4 hover:bg-white/5 transition-colors cursor-pointer",
                        index === 0 && "bg-white/5" // Highlight nearest exam
                      )}
                    >
                      {/* Exam Name */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">
                            {countdown.exam.exam_name}
                          </h4>
                          {countdown.exam.subject && (
                            <p className="text-xs text-white/50">
                              {countdown.exam.subject}
                            </p>
                          )}
                        </div>
                        
                        {/* Urgency Badge */}
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                            countdown.isToday && "bg-red-500/20 text-red-400",
                            countdown.isTomorrow && "bg-orange-500/20 text-orange-400",
                            countdown.urgencyLevel === 'urgent' && !countdown.isTomorrow && "bg-yellow-500/20 text-yellow-400",
                            countdown.urgencyLevel === 'moderate' && "bg-blue-500/20 text-blue-400",
                            countdown.urgencyLevel === 'calm' && "bg-green-500/20 text-green-400"
                          )}
                        >
                          {countdown.daysLeft} {countdown.daysLeft === 1 ? 'day' : 'days'}
                        </span>
                      </div>

                      {/* Countdown Message */}
                      <p className="text-sm text-white/70 mb-3">
                        {countdown.message}
                      </p>

                      {/* Exam Details */}
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(countdown.exam.exam_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        
                        {countdown.exam.exam_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{countdown.exam.exam_time}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - View All Link */}
            {upcomingExams.length > 0 && (
              <div className="border-t border-white/10 p-3 bg-white/5">
                <a
                  href="/study-planner"
                  className="flex items-center justify-between text-sm text-[#C9B458] hover:text-[#C27BA0] transition-colors font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <span>View Study Planner</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
