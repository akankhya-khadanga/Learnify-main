import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeadlineTask } from '@/mocks/deadlineRadar';
import { Calendar, ChevronLeft, ChevronRight, Flag, BookOpen, FileText, Trophy, ClipboardCheck } from 'lucide-react';

interface DeadlineTimelineProps {
  tasks: DeadlineTask[];
}

export const DeadlineTimeline: React.FC<DeadlineTimelineProps> = ({ tasks }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const getDaysUntil = (dueDate: Date) => {
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getTaskColor = (days: number) => {
    if (days <= 3) return '#C9B458'; // Gold - Urgent
    if (days <= 7) return '#C27BA0'; // Pink - Moderate
    return '#6DAEDB'; // Blue - Future
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Assignment':
        return <FileText className="w-4 h-4" />;
      case 'Exam':
        return <Trophy className="w-4 h-4" />;
      case 'Project':
        return <Flag className="w-4 h-4" />;
      case 'Quiz':
        return <ClipboardCheck className="w-4 h-4" />;
      case 'Reading':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#C27BA0]" />
            Deadline Timeline
          </h2>
          <p className="text-white/60 text-sm mt-1">Chronological view of all upcoming tasks</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 border-4 border-black bg-[#C9B458] hover:bg-[#B8A347] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 border-4 border-black bg-[#C9B458] hover:bg-[#B8A347] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </button>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-white/40">
          <Calendar className="w-12 h-12 mb-3" />
          <p className="text-sm font-bold">No upcoming deadlines</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-12 left-0 right-0 h-1 bg-white/20"></div>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {sortedTasks.map((task, index) => {
              const daysUntil = getDaysUntil(task.dueDate);
              const taskColor = getTaskColor(daysUntil);

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
                  className="flex-shrink-0 w-64"
                >
                  {/* Dot on timeline */}
                  <div className="flex flex-col items-center mb-4">
                    <div
                      className="w-8 h-8 rounded-full border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative z-10"
                      style={{ backgroundColor: taskColor }}
                    >
                      {getCategoryIcon(task.category)}
                    </div>
                  </div>

                  {/* Task card */}
                  <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-black/50 p-4 hover:translate-y-[-4px] hover:shadow-[6px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="space-y-3">
                      <div>
                        <Badge 
                          className="mb-2 border-2 border-black font-black text-xs"
                          style={{ backgroundColor: taskColor, color: 'black' }}
                        >
                          {task.category}
                        </Badge>
                        <h3 className="font-black text-white text-sm line-clamp-2 leading-tight">
                          {task.title}
                        </h3>
                        <p className="text-xs text-white/60 mt-1 font-bold">{task.courseName}</p>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Due Date:</span>
                          <span className="font-bold text-white">
                            {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Days Left:</span>
                          <span 
                            className="font-black"
                            style={{ color: taskColor }}
                          >
                            {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Est. Time:</span>
                          <span className="font-bold text-white">{task.estimatedHours}h</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Difficulty:</span>
                          <span className="font-bold text-white">{task.difficulty}</span>
                        </div>
                      </div>

                      {/* Progress indicator */}
                      <div className="pt-2 border-t-2 border-white/10">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white/60">Urgency</span>
                          <span className="text-xs font-black text-white">{task.urgencyScore}%</span>
                        </div>
                        <div className="h-2 bg-black/50 border-2 border-black rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${task.urgencyScore}%` }}
                            transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                            className="h-full"
                            style={{ backgroundColor: taskColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
