import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { DeadlineTask } from '@/mocks/deadlineRadar';
import { Target, AlertTriangle, Clock } from 'lucide-react';

interface DeadlineRadarPanelProps {
  tasks: DeadlineTask[];
}

export const DeadlineRadarPanel: React.FC<DeadlineRadarPanelProps> = ({ tasks }) => {
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  // Sort tasks by urgency
  const sortedTasks = [...tasks].sort((a, b) => b.urgencyScore - a.urgencyScore).slice(0, 8);

  // Calculate segment angles
  const getSegmentColor = (urgency: number) => {
    if (urgency >= 80) return '#C9B458'; // Gold - Urgent
    if (urgency >= 50) return '#C27BA0'; // Pink - Moderate
    return '#6DAEDB'; // Blue - Low
  };

  const getDaysUntil = (dueDate: Date) => {
    const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Create radar segments
  const segmentAngle = 360 / Math.max(sortedTasks.length, 1);

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Target className="w-6 h-6 text-[#C9B458]" />
          Deadline Radar
        </h2>
        <p className="text-white/60 text-sm mt-1">Visual overview of upcoming tasks by urgency</p>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-white/40">
          <Target className="w-16 h-16 mb-4" />
          <p className="text-lg font-bold">No upcoming deadlines</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      ) : (
        <div className="relative flex items-center justify-center" style={{ height: '400px' }}>
          {/* Center circle - "Today" indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute z-10 w-32 h-32 rounded-full bg-[#C9B458] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center"
          >
            <Clock className="w-8 h-8 text-black mb-1" />
            <span className="text-black font-black text-lg">TODAY</span>
            <span className="text-black/70 font-bold text-xs">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </motion.div>

          {/* Radar segments */}
          <svg width="400" height="400" className="absolute" viewBox="0 0 400 400">
            <defs>
              {sortedTasks.map((task, index) => (
                <filter key={`glow-${task.id}`} id={`glow-${task.id}`}>
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {/* Circular rings */}
            <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx="200" cy="200" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

            {/* Task segments */}
            {sortedTasks.map((task, index) => {
              const startAngle = index * segmentAngle - 90;
              const endAngle = (index + 1) * segmentAngle - 90;
              const radius = 180;
              const innerRadius = 80;

              const x1 = 200 + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 200 + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 200 + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 200 + radius * Math.sin((endAngle * Math.PI) / 180);
              const x3 = 200 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
              const y3 = 200 + innerRadius * Math.sin((endAngle * Math.PI) / 180);
              const x4 = 200 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y4 = 200 + innerRadius * Math.sin((startAngle * Math.PI) / 180);

              const largeArcFlag = segmentAngle > 180 ? 1 : 0;

              const pathData = `
                M ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                L ${x3} ${y3}
                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
                Z
              `;

              return (
                <motion.path
                  key={task.id}
                  d={pathData}
                  fill={getSegmentColor(task.urgencyScore)}
                  stroke="black"
                  strokeWidth="2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: hoveredTask === task.id ? 1 : 0.8,
                    scale: hoveredTask === task.id ? 1.05 : 1
                  }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                  className="cursor-pointer"
                  filter={hoveredTask === task.id ? `url(#glow-${task.id})` : undefined}
                />
              );
            })}
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredTask && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-0 right-0 z-20 w-64"
              >
                {(() => {
                  const task = sortedTasks.find((t) => t.id === hoveredTask);
                  if (!task) return null;
                  const daysUntil = getDaysUntil(task.dueDate);
                  
                  return (
                    <Card className="p-4 border-4 border-black bg-obsidian shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-[#C9B458] flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-black text-white text-sm line-clamp-2">{task.title}</h4>
                          <p className="text-xs text-white/60 mt-1">{task.courseName}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/60">Due in:</span>
                          <span className="font-bold text-white">{daysUntil} day{daysUntil !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Est. Time:</span>
                          <span className="font-bold text-white">{task.estimatedHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Difficulty:</span>
                          <span className="font-bold text-white">{task.difficulty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Urgency:</span>
                          <span 
                            className="font-bold"
                            style={{ color: getSegmentColor(task.urgencyScore) }}
                          >
                            {task.urgencyScore}%
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#C9B458] border-2 border-black"></div>
          <span className="text-xs font-bold text-white">Urgent (80-100%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#C27BA0] border-2 border-black"></div>
          <span className="text-xs font-bold text-white">Moderate (50-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#6DAEDB] border-2 border-black"></div>
          <span className="text-xs font-bold text-white">Low (&lt;50%)</span>
        </div>
      </div>
    </Card>
  );
};
