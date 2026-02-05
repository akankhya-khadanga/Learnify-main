import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { WeeklyLoad } from '@/mocks/deadlineRadar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface StudyLoadForecastProps {
  weeklyLoad: WeeklyLoad[];
}

export const StudyLoadForecast: React.FC<StudyLoadForecastProps> = ({ weeklyLoad }) => {
  const maxHours = Math.max(...weeklyLoad.map((day) => day.hours));
  const avgHours = weeklyLoad.reduce((sum, day) => sum + day.hours, 0) / weeklyLoad.length;

  const getBarColor = (stressLevel: number) => {
    if (stressLevel >= 80) return '#C9B458'; // Gold - High stress
    if (stressLevel >= 50) return '#C27BA0'; // Pink - Medium stress
    return '#6DAEDB'; // Blue - Low stress
  };

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: WeeklyLoad;
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <Card className="border-4 border-black bg-obsidian p-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-black text-white text-sm mb-2">{data.day} - {data.date}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-white/60">Study Hours:</span>
              <span className="font-bold text-white">{data.hours}h</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/60">Tasks:</span>
              <span className="font-bold text-white">{data.taskCount}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-white/60">Stress Level:</span>
              <span 
                className="font-black"
                style={{ color: getBarColor(data.stressLevel) }}
              >
                {data.stressLevel}%
              </span>
            </div>
          </div>
        </Card>
      );
    }
    return null;
  };

  const peakDay = weeklyLoad.reduce((max, day) => 
    day.hours > max.hours ? day : max
  , weeklyLoad[0]);

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-obsidian p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#6DAEDB]" />
          Weekly Load Forecast
        </h2>
        <p className="text-white/60 text-sm mt-1">Projected study hours and stress distribution</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-3 border-4 border-black bg-black/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <p className="text-xs text-white/60 font-bold mb-1">Peak Load</p>
          <p className="text-2xl font-black text-[#C9B458]">{maxHours}h</p>
          <p className="text-xs text-white/70 mt-1">{peakDay.day}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-3 border-4 border-black bg-black/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <p className="text-xs text-white/60 font-bold mb-1">Avg Daily</p>
          <p className="text-2xl font-black text-[#C27BA0]">{avgHours.toFixed(1)}h</p>
          <p className="text-xs text-white/70 mt-1">This week</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-3 border-4 border-black bg-black/50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <p className="text-xs text-white/60 font-bold mb-1">Total Tasks</p>
          <p className="text-2xl font-black text-[#6DAEDB]">
            {weeklyLoad.reduce((sum, day) => sum + day.taskCount, 0)}
          </p>
          <p className="text-xs text-white/70 mt-1">7 days</p>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="h-64 border-4 border-black bg-black/30 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyLoad} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF"
              tick={{ fill: '#E6E8ED', fontSize: 12, fontWeight: 'bold' }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#E6E8ED', fontSize: 12, fontWeight: 'bold' }}
              tickLine={{ stroke: '#9CA3AF' }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#9CA3AF', fontWeight: 'bold' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
            <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
              {weeklyLoad.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.stressLevel)} stroke="#000" strokeWidth={2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stress warning */}
      {weeklyLoad.some((day) => day.stressLevel >= 80) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-3 border-4 border-[#C9B458] bg-[#C9B458]/10 flex items-start gap-2"
        >
          <AlertTriangle className="w-5 h-5 text-[#C9B458] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-white">High Stress Alert</p>
            <p className="text-xs text-white/80 mt-1">
              {weeklyLoad.filter((d) => d.stressLevel >= 80).length} day(s) this week have high workload. 
              Consider redistributing tasks or adjusting deadlines.
            </p>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#C9B458] border-2 border-black"></div>
          <span className="font-bold text-white/70">High Stress (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#C27BA0] border-2 border-black"></div>
          <span className="font-bold text-white/70">Medium (50-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#6DAEDB] border-2 border-black"></div>
          <span className="font-bold text-white/70">Low (&lt;50%)</span>
        </div>
      </div>
    </Card>
  );
};
