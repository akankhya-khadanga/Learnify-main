import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, isToday, isYesterday } from 'date-fns';

export interface UserStreak {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
    streak_freezes_available: number;
    created_at: string;
    updated_at: string;
}

export interface StreakActivity {
    id: string;
    user_id: string;
    activity_date: string;
    activity_type: string;
    created_at: string;
}

export const useStreak = () => {
    const [streak, setStreak] = useState<UserStreak | null>(null);
    const [activityHistory, setActivityHistory] = useState<StreakActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Load streak data
    const loadStreak = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!data) {
                // Create initial streak
                const { data: newStreak, error: createError } = await supabase
                    .from('user_streaks')
                    .insert([
                        {
                            user_id: user.id,
                            current_streak: 0,
                            longest_streak: 0,
                            last_activity_date: null,
                            streak_freezes_available: 2,
                        },
                    ])
                    .select()
                    .single();

                if (createError) throw createError;
                setStreak(newStreak);
            } else {
                setStreak(data);
            }
        } catch (err) {
            console.error('Load streak error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load activity history (last 30 days)
    const loadActivityHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('streak_history')
                .select('*')
                .eq('user_id', user.id)
                .gte('activity_date', thirtyDaysAgo)
                .order('activity_date', { ascending: false });

            if (error) throw error;

            setActivityHistory(data || []);
        } catch (err) {
            console.error('Load activity history error:', err);
        }
    };

    // Record activity and update streak
    const recordActivity = async (activityType: string = 'login') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('User not authenticated');

            if (!streak) {
                await loadStreak();
                return;
            }

            const today = format(new Date(), 'yyyy-MM-dd');
            const lastActivity = streak.last_activity_date ? new Date(streak.last_activity_date) : null;

            // Check if already recorded today
            const todayActivity = activityHistory.find(
                a => a.activity_date === today
            );

            if (todayActivity) {
                return { streakIncreased: false, currentStreak: streak.current_streak };
            }

            let newStreak = streak.current_streak;
            let streakBroken = false;

            if (!lastActivity) {
                // First activity ever
                newStreak = 1;
            } else if (isYesterday(lastActivity)) {
                // Consecutive day
                newStreak = streak.current_streak + 1;
            } else if (isToday(lastActivity)) {
                // Already recorded today
                return { streakIncreased: false, currentStreak: streak.current_streak };
            } else {
                // Streak broken
                streakBroken = true;
                newStreak = 1;
            }

            const newLongestStreak = Math.max(newStreak, streak.longest_streak);

            // Update streak
            const { data: updatedStreak, error: updateError } = await supabase
                .from('user_streaks')
                .update({
                    current_streak: newStreak,
                    longest_streak: newLongestStreak,
                    last_activity_date: today,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Record activity
            const { error: activityError } = await supabase
                .from('streak_history')
                .insert([
                    {
                        user_id: user.id,
                        activity_date: today,
                        activity_type: activityType,
                    },
                ]);

            if (activityError) throw activityError;

            setStreak(updatedStreak);
            await loadActivityHistory();

            if (streakBroken && streak.current_streak > 1) {
                toast({
                    title: 'Streak Reset',
                    description: `Your ${streak.current_streak}-day streak was reset. Start a new one today!`,
                    variant: 'destructive',
                });
            } else if (newStreak > 1) {
                toast({
                    title: `🔥 ${newStreak}-Day Streak!`,
                    description: 'Keep it up! Come back tomorrow to continue.',
                });
            }

            return {
                streakIncreased: newStreak > streak.current_streak,
                currentStreak: newStreak,
                streakBroken,
            };
        } catch (err) {
            console.error('Record activity error:', err);
            toast({
                title: 'Error',
                description: 'Failed to record activity',
                variant: 'destructive',
            });
            return { streakIncreased: false, currentStreak: 0 };
        }
    };

    // Use streak freeze
    const useStreakFreeze = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user || !streak) throw new Error('User not authenticated');

            if (streak.streak_freezes_available <= 0) {
                toast({
                    title: 'No Freezes Available',
                    description: 'You have no streak freezes left',
                    variant: 'destructive',
                });
                return false;
            }

            const { data, error } = await supabase
                .from('user_streaks')
                .update({
                    streak_freezes_available: streak.streak_freezes_available - 1,
                    last_activity_date: format(new Date(), 'yyyy-MM-dd'),
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            setStreak(data);

            toast({
                title: 'Streak Freeze Used',
                description: `Your streak is safe! ${data.streak_freezes_available} freezes remaining.`,
            });

            return true;
        } catch (err) {
            console.error('Use streak freeze error:', err);
            return false;
        }
    };

    // Check if active on specific date
    const isActiveOnDate = (date: Date): boolean => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return activityHistory.some(a => a.activity_date === dateStr);
    };

    // Get calendar data for last 30 days
    const getCalendarData = () => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = subDays(new Date(), i);
            days.push({
                date,
                active: isActiveOnDate(date),
                isToday: isToday(date),
            });
        }
        return days;
    };

    useEffect(() => {
        loadStreak();
        loadActivityHistory();
    }, []);

    return {
        streak,
        activityHistory,
        loading,
        recordActivity,
        useStreakFreeze,
        isActiveOnDate,
        getCalendarData,
        refreshStreak: loadStreak,
    };
};
