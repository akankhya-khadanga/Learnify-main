import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface UserProgress {
    user_id: string;
    total_xp: number;
    current_level: number;
    xp_this_week: number;
    xp_this_month: number;
    created_at: string;
    updated_at: string;
}

export interface XPTransaction {
    id: string;
    user_id: string;
    amount: number;
    action_type: string;
    description?: string;
    created_at: string;
}

// XP values for different actions
export const XP_REWARDS = {
    DAILY_LOGIN: 5,
    COMPLETE_TASK: 10,
    STUDY_30_MIN: 20,
    ROADMAP_SESSION: 50,
    HELP_COMMUNITY: 15,
    DAILY_CHALLENGE: 50,
    WEEK_STREAK: 100,
    MONTH_STREAK: 500,
};

// Calculate level from total XP
export const calculateLevel = (xp: number): number => {
    return Math.floor(Math.sqrt(xp / 100));
};

// Calculate XP needed for next level
export const xpForNextLevel = (currentLevel: number): number => {
    return Math.pow(currentLevel + 1, 2) * 100;
};

// Calculate XP progress to next level
export const xpProgressToNextLevel = (totalXp: number): { current: number; needed: number; percentage: number } => {
    const level = calculateLevel(totalXp);
    const xpForCurrentLevel = Math.pow(level, 2) * 100;
    const xpForNext = xpForNextLevel(level);
    const current = totalXp - xpForCurrentLevel;
    const needed = xpForNext - xpForCurrentLevel;
    const percentage = (current / needed) * 100;

    return { current, needed, percentage };
};

export const useXP = () => {
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<XPTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Load user progress
    const loadProgress = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!data) {
                // Create initial progress
                const { data: newProgress, error: createError } = await supabase
                    .from('user_progress')
                    .insert([
                        {
                            user_id: user.id,
                            total_xp: 0,
                            current_level: 1,
                            xp_this_week: 0,
                            xp_this_month: 0,
                        },
                    ])
                    .select()
                    .single();

                if (createError) throw createError;
                setProgress(newProgress);
            } else {
                setProgress(data);
            }
        } catch (err) {
            console.error('Load progress error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load recent XP transactions
    const loadRecentTransactions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('xp_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            setRecentTransactions(data || []);
        } catch (err) {
            console.error('Load transactions error:', err);
        }
    };

    // Award XP
    const awardXP = async (amount: number, actionType: string, description?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('User not authenticated');

            if (!progress) {
                await loadProgress();
                return;
            }

            const oldLevel = progress.current_level;
            const newTotalXP = progress.total_xp + amount;
            const newLevel = calculateLevel(newTotalXP);
            const leveledUp = newLevel > oldLevel;

            // Update progress
            const { data: updatedProgress, error: updateError } = await supabase
                .from('user_progress')
                .update({
                    total_xp: newTotalXP,
                    current_level: newLevel,
                    xp_this_week: progress.xp_this_week + amount,
                    xp_this_month: progress.xp_this_month + amount,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Create transaction record
            const { error: transactionError } = await supabase
                .from('xp_transactions')
                .insert([
                    {
                        user_id: user.id,
                        amount,
                        action_type: actionType,
                        description,
                    },
                ]);

            if (transactionError) throw transactionError;

            setProgress(updatedProgress);
            await loadRecentTransactions();

            // Return level up status for animations
            return {
                success: true,
                leveledUp,
                oldLevel,
                newLevel,
                xpGained: amount,
            };
        } catch (err) {
            console.error('Award XP error:', err);
            toast({
                title: 'Error',
                description: 'Failed to award XP',
                variant: 'destructive',
            });
            return { success: false, leveledUp: false };
        }
    };

    // Get level progress
    const getLevelProgress = () => {
        if (!progress) return { current: 0, needed: 100, percentage: 0 };
        return xpProgressToNextLevel(progress.total_xp);
    };

    // Get weekly XP
    const getWeeklyXP = () => {
        return progress?.xp_this_week || 0;
    };

    // Get monthly XP
    const getMonthlyXP = () => {
        return progress?.xp_this_month || 0;
    };

    useEffect(() => {
        loadProgress();
        loadRecentTransactions();
    }, []);

    return {
        progress,
        recentTransactions,
        loading,
        awardXP,
        getLevelProgress,
        getWeeklyXP,
        getMonthlyXP,
        refreshProgress: loadProgress,
    };
};
