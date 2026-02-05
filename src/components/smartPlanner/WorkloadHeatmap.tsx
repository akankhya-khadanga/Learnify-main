import { motion } from 'framer-motion';
import { WorkloadDay } from '@/mocks/studyPlanner';
import { TrendingUp } from 'lucide-react';

interface WorkloadHeatmapProps {
  workloadData: WorkloadDay[];
}

export default function WorkloadHeatmap({ workloadData }: WorkloadHeatmapProps) {
  const getIntensityColor = (intensity: WorkloadDay['intensity']) => {
    switch (intensity) {
      case 'low':
        return '#6DAEDB40';
      case 'medium':
        return '#C9B45880';
      case 'high':
        return '#C9B458';
      case 'extreme':
        return '#C27BA0';
      default:
        return '#ffffff10';
    }
  };

  const getIntensityLabel = (intensity: WorkloadDay['intensity']) => {
    switch (intensity) {
      case 'low':
        return 'Light';
      case 'medium':
        return 'Moderate';
      case 'high':
        return 'Heavy';
      case 'extreme':
        return 'Intense';
      default:
        return 'None';
    }
  };

  // Group by weeks
  const weeks: WorkloadDay[][] = [];
  let currentWeek: WorkloadDay[] = [];

  workloadData.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);

    if (index === workloadData.length - 1) {
      weeks.push(currentWeek);
    }
  });

  // Calculate statistics
  const totalHours = workloadData.reduce((sum, day) => sum + day.hours, 0);
  const avgHours = (totalHours / workloadData.length).toFixed(1);
  const maxHours = Math.max(...workloadData.map(d => d.hours));
  const peakDays = workloadData.filter(d => d.intensity === 'extreme').length;

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-white">Workload Distribution</h3>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-black text-primary">{totalHours}h</div>
          <div className="text-xs text-gray-400 font-semibold mt-1">TOTAL HOURS</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-black text-accent">{avgHours}h</div>
          <div className="text-xs text-gray-400 font-semibold mt-1">AVG PER DAY</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-black text-[#6DAEDB]">{maxHours}h</div>
          <div className="text-xs text-gray-400 font-semibold mt-1">PEAK DAY</div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-2xl font-black text-white">{peakDays}</div>
          <div className="text-xs text-gray-400 font-semibold mt-1">INTENSE DAYS</div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-2 mb-6">
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-bold text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {/* Fill empty cells at start of first week */}
            {weekIndex === 0 && week.length > 0 && (
              <>
                {Array.from({ length: new Date(week[0].date).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
              </>
            )}

            {week.map((day, dayIndex) => {
              const date = new Date(day.date);
              const dayNum = date.getDate();

              return (
                <motion.div
                  key={dayIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                  whileHover={{ scale: 1.1, zIndex: 10 }}
                  className="group relative aspect-square rounded-lg cursor-pointer transition-all"
                  style={{
                    backgroundColor: getIntensityColor(day.intensity),
                    border: `2px solid ${getIntensityColor(day.intensity)}`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{dayNum}</span>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-black border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                      <div className="font-bold text-white mb-1">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-gray-300">
                        {day.hours}h · {getIntensityLabel(day.intensity)}
                      </div>
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                        style={{ borderTopColor: '#000' }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
        <span className="text-xs text-gray-400 font-semibold">INTENSITY</span>
        <div className="flex items-center gap-3">
          {[
            { label: 'Light', intensity: 'low' as const },
            { label: 'Moderate', intensity: 'medium' as const },
            { label: 'Heavy', intensity: 'high' as const },
            { label: 'Intense', intensity: 'extreme' as const },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: getIntensityColor(item.intensity) }}
              />
              <span className="text-xs text-gray-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
