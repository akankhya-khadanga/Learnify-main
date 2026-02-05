import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface WellnessLog {
    id: string;
    user_id: string;
    activity_type: 'mood' | 'meditation' | 'breathing' | 'exercise';
    mood_rating?: number;
    duration_minutes?: number;
    notes?: string;
    created_at: string;
}

export const useWellness = () => {
    const [logs, setLogs] = useState<WellnessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Load wellness logs
    const loadLogs = async (days: number = 30) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data, error } = await supabase
                .from('wellness_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            setLogs(data || []);
        } catch (err) {
            console.error('Load wellness logs error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Log mood
    const logMood = async (rating: number, notes?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('wellness_logs')
                .insert([
                    {
                        user_id: user.id,
                        activity_type: 'mood',
                        mood_rating: rating,
                        notes,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            setLogs(prev => [data, ...prev]);

            toast({
                title: 'Mood Logged',
                description: 'Your mood has been recorded',
            });

            return data;
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to log mood',
                variant: 'destructive',
            });
            throw err;
        }
    };

    // Log activity (meditation, breathing, exercise)
    const logActivity = async (
        type: 'meditation' | 'breathing' | 'exercise',
        durationMinutes: number,
        notes?: string
    ) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('wellness_logs')
                .insert([
                    {
                        user_id: user.id,
                        activity_type: type,
                        duration_minutes: durationMinutes,
                        notes,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            setLogs(prev => [data, ...prev]);

            toast({
                title: 'Activity Logged',
                description: `${type} session recorded`,
            });

            return data;
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to log activity',
                variant: 'destructive',
            });
            throw err;
        }
    };

    // Get mood trend data
    const getMoodTrend = () => {
        return logs
            .filter(log => log.activity_type === 'mood' && log.mood_rating)
            .map(log => ({
                date: new Date(log.created_at).toLocaleDateString(),
                rating: log.mood_rating!,
            }));
    };

    // Get activity summary
    const getActivitySummary = () => {
        const summary = {
            meditation: 0,
            breathing: 0,
            exercise: 0,
            totalMinutes: 0,
        };

        logs.forEach(log => {
            if (log.duration_minutes) {
                summary.totalMinutes += log.duration_minutes;
                if (log.activity_type in summary) {
                    summary[log.activity_type as keyof typeof summary] += log.duration_minutes;
                }
            }
        });

        return summary;
    };

    useEffect(() => {
        loadLogs();
    }, []);

    return {
        logs,
        loading,
        logMood,
        logActivity,
        getMoodTrend,
        getActivitySummary,
        refreshLogs: loadLogs,
    };
};
