import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStreak } from '@/hooks/useStreak';
import { Flame, Snowflake, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export const StreakCalendar: React.FC = () => {
    const { streak, loading, getCalendarData, useStreakFreeze } = useStreak();

    if (loading) {
        return <div className="text-white/60">Loading streak data...</div>;
    }

    if (!streak) {
        return <div className="text-white/60">No streak data available</div>;
    }

    const calendarData = getCalendarData();

    return (
        <Card className="border border-neon shadow-float p-6 bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-black text-primary mb-2 flex items-center gap-2">
                        <Flame className="w-8 h-8 text-orange-500" />
                        Daily Streak
                    </h2>
                    <p className="text-white/70 font-bold">Keep your learning momentum going!</p>
                </div>

                <div className="text-right">
                    <div className="text-5xl font-black text-primary">{streak.current_streak}</div>
                    <div className="text-sm font-bold text-white/60">Day Streak</div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-black/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-center">
                    <div className="text-2xl font-black text-accent">{streak.current_streak}</div>
                    <div className="text-xs font-bold text-white/60">Current</div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-center">
                    <div className="text-2xl font-black text-primary flex items-center justify-center gap-1">
                        <Trophy className="w-5 h-5" />
                        {streak.longest_streak}
                    </div>
                    <div className="text-xs font-bold text-white/60">Best</div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700 text-center">
                    <div className="text-2xl font-black text-blue-400 flex items-center justify-center gap-1">
                        <Snowflake className="w-5 h-5" />
                        {streak.streak_freezes_available}
                    </div>
                    <div className="text-xs font-bold text-white/60">Freezes</div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
                <h3 className="text-lg font-black text-white mb-3">Last 30 Days</h3>
                <div className="grid grid-cols-10 gap-2">
                    {calendarData.map((day, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className={`aspect-square rounded border-2 flex items-center justify-center text-xs font-bold ${day.isToday
                                    ? 'border-neon bg-primary text-black ring-2 ring-neon/50'
                                    : day.active
                                        ? 'border-green-500 bg-green-500/20 text-green-400'
                                        : 'border-slate-200 dark:border-slate-700 bg-black/20 text-white/30'
                                }`}
                            title={format(day.date, 'MMM dd, yyyy')}
                        >
                            {format(day.date, 'd')}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Streak Freeze Button */}
            {streak.streak_freezes_available > 0 && (
                <Button
                    onClick={() => useStreakFreeze()}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white border border-slate-200 dark:border-slate-700 shadow-float font-black"
                >
                    <Snowflake className="w-4 h-4 mr-2" />
                    Use Streak Freeze ({streak.streak_freezes_available} available)
                </Button>
            )}

            {/* Motivational Messages */}
            <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-white font-bold text-center">
                    {streak.current_streak === 0 && "🌟 Start your streak today!"}
                    {streak.current_streak >= 1 && streak.current_streak < 7 && "🔥 Great start! Keep going!"}
                    {streak.current_streak >= 7 && streak.current_streak < 30 && "⭐ You're on fire! Week streak achieved!"}
                    {streak.current_streak >= 30 && streak.current_streak < 100 && "🏆 Amazing! Month streak unlocked!"}
                    {streak.current_streak >= 100 && "👑 Legendary! You're unstoppable!"}
                </p>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-500/20"></div>
                    <span className="text-white/60">Active</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded border-2 border-slate-200 dark:border-slate-700 bg-black/20"></div>
                    <span className="text-white/60">Inactive</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded border-2 border-neon bg-primary"></div>
                    <span className="text-white/60">Today</span>
                </div>
            </div>
        </Card>
    );
};
