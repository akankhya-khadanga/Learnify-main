import { supabase } from '@/lib/supabase';

export interface Habit {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    frequency: 'daily' | 'weekly' | 'custom';
    target_days?: number[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface HabitCompletion {
    id: string;
    habit_id: string;
    user_id: string;
    completed_at: string;
    notes?: string;
    created_at: string;
}

export interface HabitStats {
    habit_id: string;
    user_id: string;
    title: string;
    icon?: string;
    color?: string;
    total_completions: number;
    last_completed?: string;
    current_streak: number;
    completions_this_week: number;
    completions_this_month: number;
}

class HabitService {
    /**
     * Create a new habit
     */
    async createHabit(
        userId: string,
        title: string,
        description?: string,
        icon?: string,
        color?: string,
        frequency: 'daily' | 'weekly' | 'custom' = 'daily',
        targetDays?: number[]
    ): Promise<Habit> {
        const { data, error } = await supabase
            .from('habits')
            .insert({
                user_id: userId,
                title,
                description,
                icon: icon || '✓',
                color: color || '#8b5cf6',
                frequency,
                target_days: targetDays || [1, 2, 3, 4, 5, 6, 7]
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating habit:', error);
            throw new Error(`Failed to create habit: ${error.message}`);
        }

        return data;
    }

    /**
     * Get all active habits for a user
     */
    async getUserHabits(userId: string): Promise<Habit[]> {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching habits:', error);
            throw new Error(`Failed to fetch habits: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get habit statistics
     */
    async getHabitStats(userId: string): Promise<HabitStats[]> {
        const { data, error } = await supabase
            .from('habit_stats')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching habit stats:', error);
            throw new Error(`Failed to fetch habit stats: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Update a habit
     */
    async updateHabit(
        habitId: string,
        updates: Partial<Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<Habit> {
        const { data, error } = await supabase
            .from('habits')
            .update(updates)
            .eq('id', habitId)
            .select()
            .single();

        if (error) {
            console.error('Error updating habit:', error);
            throw new Error(`Failed to update habit: ${error.message}`);
        }

        return data;
    }

    /**
     * Delete (archive) a habit
     */
    async deleteHabit(habitId: string): Promise<void> {
        const { error } = await supabase
            .from('habits')
            .update({ is_active: false })
            .eq('id', habitId);

        if (error) {
            console.error('Error deleting habit:', error);
            throw new Error(`Failed to delete habit: ${error.message}`);
        }
    }

    /**
     * Mark a habit as complete for a specific date
     */
    async completeHabit(
        habitId: string,
        userId: string,
        date: Date = new Date(),
        notes?: string
    ): Promise<HabitCompletion> {
        const completedAt = date.toISOString().split('T')[0]; // YYYY-MM-DD format

        const { data, error } = await supabase
            .from('habit_completions')
            .insert({
                habit_id: habitId,
                user_id: userId,
                completed_at: completedAt,
                notes
            })
            .select()
            .single();

        if (error) {
            console.error('Error completing habit:', error);
            throw new Error(`Failed to complete habit: ${error.message}`);
        }

        return data;
    }

    /**
     * Uncomplete a habit for a specific date
     */
    async uncompleteHabit(habitId: string, date: Date = new Date()): Promise<void> {
        const completedAt = date.toISOString().split('T')[0];

        const { error } = await supabase
            .from('habit_completions')
            .delete()
            .eq('habit_id', habitId)
            .eq('completed_at', completedAt);

        if (error) {
            console.error('Error uncompleting habit:', error);
            throw new Error(`Failed to uncomplete habit: ${error.message}`);
        }
    }

    /**
     * Check if a habit is completed for a specific date
     */
    async isHabitCompleted(habitId: string, date: Date = new Date()): Promise<boolean> {
        const completedAt = date.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('habit_completions')
            .select('id')
            .eq('habit_id', habitId)
            .eq('completed_at', completedAt)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found" which is expected
            console.error('Error checking habit completion:', error);
        }

        return !!data;
    }

    /**
     * Get completions for a habit within a date range
     */
    async getHabitCompletions(
        habitId: string,
        startDate: Date,
        endDate: Date
    ): Promise<HabitCompletion[]> {
        const { data, error } = await supabase
            .from('habit_completions')
            .select('*')
            .eq('habit_id', habitId)
            .gte('completed_at', startDate.toISOString().split('T')[0])
            .lte('completed_at', endDate.toISOString().split('T')[0])
            .order('completed_at', { ascending: false });

        if (error) {
            console.error('Error fetching completions:', error);
            throw new Error(`Failed to fetch completions: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Get today's habits with completion status
     */
    async getTodaysHabits(userId: string): Promise<Array<Habit & { completed: boolean }>> {
        const habits = await this.getUserHabits(userId);
        const today = new Date();
        const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday from 0 to 7

        // Filter habits based on target days
        const relevantHabits = habits.filter(habit =>
            habit.target_days?.includes(dayOfWeek) ?? true
        );

        // Check completion status for each habit
        const habitsWithStatus = await Promise.all(
            relevantHabits.map(async (habit) => {
                const completed = await this.isHabitCompleted(habit.id, today);
                return { ...habit, completed };
            })
        );

        return habitsWithStatus;
    }

    /**
     * Calculate streak for a habit
     */
    async calculateStreak(habitId: string): Promise<number> {
        const { data, error } = await supabase
            .rpc('calculate_habit_streak', { p_habit_id: habitId });

        if (error) {
            console.error('Error calculating streak:', error);
            return 0;
        }

        return data || 0;
    }

    /**
     * Get weekly completion grid data
     */
    async getWeeklyGrid(habitId: string): Promise<boolean[]> {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 6);

        const completions = await this.getHabitCompletions(habitId, weekAgo, today);
        const completionDates = new Set(completions.map(c => c.completed_at));

        const grid: boolean[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            grid.push(completionDates.has(dateStr));
        }

        return grid;
    }
}

export const habitService = new HabitService();
