import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MOCK_DEADLINES, 
  MOCK_WEEKLY_LOAD, 
  MOCK_PACE_SUGGESTIONS 
} from '@/mocks/deadlineRadar';
import { DeadlineRadarPanel } from '@/components/smartDeadline/DeadlineRadarPanel';
import { PaceSuggestionCard } from '@/components/smartDeadline/PaceSuggestionCard';
import { DeadlineTimeline } from '@/components/smartDeadline/DeadlineTimeline';
import { StudyLoadForecast } from '@/components/smartDeadline/StudyLoadForecast';
import { SmartPaceControls } from '@/components/smartDeadline/SmartPaceControls';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SmartDeadlinePage() {
  const { toast } = useToast();
  const [tasks] = useState(MOCK_DEADLINES);
  const [weeklyLoad] = useState(MOCK_WEEKLY_LOAD);
  const [suggestions] = useState(MOCK_PACE_SUGGESTIONS);

  const urgentTasks = tasks.filter((t) => t.urgencyScore >= 80).length;
  const nextDeadline = tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
  const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

  const handleGeneratePlan = () => {
    toast({
      title: '✨ Smart Plan Generated!',
      description: 'Your personalized study schedule has been created based on your deadlines and preferences.',
      duration: 3000,
    });
  };

  const getDaysUntil = (date: Date) => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
            <Target className="w-10 h-10 text-[#C9B458]" />
            Smart Deadline Radar
          </h1>
          <p className="text-white/70 text-lg">
            AI-powered deadline tracking and intelligent study pacing
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-black/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#C9B458] border-4 border-black flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-bold">Total Tasks</p>
                    <p className="text-2xl font-black text-white">{tasks.length}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-black/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#C27BA0] border-4 border-black flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-bold">Urgent</p>
                    <p className="text-2xl font-black text-white">{urgentTasks}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-black/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#6DAEDB] border-4 border-black flex items-center justify-center">
                    <Clock className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-bold">Next Deadline</p>
                    <p className="text-xl font-black text-white">
                      {nextDeadline ? `${getDaysUntil(nextDeadline.dueDate)}d` : 'None'}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-black/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#C9B458] border-4 border-black flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60 font-bold">Total Hours</p>
                    <p className="text-2xl font-black text-white">{totalHours}h</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Primary Visual Row - Radar + Pace Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-3"
          >
            <DeadlineRadarPanel tasks={tasks} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="mb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#C9B458]" />
                Pace Suggestions
              </h2>
            </div>
            <PaceSuggestionCard suggestions={suggestions} />
          </motion.div>
        </div>

        {/* Timeline Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <DeadlineTimeline tasks={tasks} />
        </motion.div>

        {/* Analytics Row - Load Forecast + Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <StudyLoadForecast weeklyLoad={weeklyLoad} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 }}
          >
            <SmartPaceControls onGeneratePlan={handleGeneratePlan} />
          </motion.div>
        </div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-6"
        >
          <Card className="border-4 border-[#6DAEDB] bg-[#6DAEDB]/10 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#6DAEDB] border-2 border-black flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-black" />
              </div>
              <div>
                <h3 className="font-black text-white text-sm mb-1">How Smart Deadline Radar Works</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Our AI analyzes your deadlines, task difficulty, and available time to create an optimized 
                  study schedule. The radar visualization shows urgency levels, while pace suggestions help 
                  you start tasks at the right time. Weekly forecasts predict stress spikes so you can 
                  redistribute workload proactively. Click "Generate Suggested Plan" to receive personalized 
                  recommendations based on your selected pacing mode.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
