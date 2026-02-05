import { supabase } from '@/lib/supabase';

// Types
export interface StudyPlan {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export interface StudyTask {
    id: string;
    user_id: string;
    study_plan_id?: string;
    title: string;
    description?: string;
    subject?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimated_hours?: number;
    deadline?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Exam {
    id: string;
    user_id: string;
    study_plan_id?: string;
    subject: string;
    title: string;
    exam_date: string;
    duration_minutes?: number;
    location?: string;
    notes?: string;
    importance: 'low' | 'medium' | 'high' | 'critical';
    preparation_status: 'not_started' | 'in_progress' | 'ready';
    created_at: string;
    updated_at: string;
}

export interface DailySchedule {
    id: string;
    user_id: string;
    study_plan_id?: string;
    date: string;
    total_hours: number;
    tasks: Array<{
        task_id: string;
        allocated_hours: number;
        time_slot?: string;
    }>;
    generated_at: string;
}

// Study Plans CRUD
export const studyPlanService = {
    async getAll(): Promise<StudyPlan[]> {
        const { data, error } = await supabase
            .from('study_plans')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<StudyPlan | null> {
        const { data, error } = await supabase
            .from('study_plans')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(plan: Omit<StudyPlan, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<StudyPlan> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('study_plans')
            .insert([{ ...plan, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<StudyPlan>): Promise<StudyPlan> {
        const { data, error } = await supabase
            .from('study_plans')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('study_plans')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// Study Tasks CRUD
export const studyTaskService = {
    async getAll(planId?: string): Promise<StudyTask[]> {
        let query = supabase
            .from('study_tasks')
            .select('*')
            .order('deadline', { ascending: true });

        if (planId) {
            query = query.eq('study_plan_id', planId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<StudyTask | null> {
        const { data, error } = await supabase
            .from('study_tasks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(task: Omit<StudyTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<StudyTask> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('study_tasks')
            .insert([{ ...task, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<StudyTask>): Promise<StudyTask> {
        const { data, error } = await supabase
            .from('study_tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async markComplete(id: string): Promise<StudyTask> {
        return this.update(id, {
            status: 'completed',
            completed_at: new Date().toISOString(),
        });
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('study_tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getUpcoming(days: number = 7): Promise<StudyTask[]> {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const { data, error } = await supabase
            .from('study_tasks')
            .select('*')
            .gte('deadline', new Date().toISOString())
            .lte('deadline', endDate.toISOString())
            .eq('status', 'pending')
            .order('deadline', { ascending: true });

        if (error) throw error;
        return data || [];
    },
};

// Exams CRUD
export const examService = {
    async getAll(planId?: string): Promise<Exam[]> {
        let query = supabase
            .from('exams')
            .select('*')
            .order('exam_date', { ascending: true });

        if (planId) {
            query = query.eq('study_plan_id', planId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async getById(id: string): Promise<Exam | null> {
        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(exam: Omit<Exam, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Exam> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('exams')
            .insert([{ ...exam, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async update(id: string, updates: Partial<Exam>): Promise<Exam> {
        const { data, error } = await supabase
            .from('exams')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('exams')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getUpcoming(days: number = 30): Promise<Exam[]> {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        const { data, error } = await supabase
            .from('exams')
            .select('*')
            .gte('exam_date', new Date().toISOString())
            .lte('exam_date', endDate.toISOString())
            .order('exam_date', { ascending: true });

        if (error) throw error;
        return data || [];
    },
};

// Daily Schedules
export const dailyScheduleService = {
    async getByDate(date: string): Promise<DailySchedule | null> {
        const { data, error } = await supabase
            .from('daily_schedules')
            .select('*')
            .eq('date', date)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data;
    },

    async getRange(startDate: string, endDate: string): Promise<DailySchedule[]> {
        const { data, error } = await supabase
            .from('daily_schedules')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async save(schedule: Omit<DailySchedule, 'id' | 'user_id' | 'generated_at'>): Promise<DailySchedule> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('daily_schedules')
            .upsert([{ ...schedule, user_id: user.id }], {
                onConflict: 'user_id,date'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(date: string): Promise<void> {
        const { error } = await supabase
            .from('daily_schedules')
            .delete()
            .eq('date', date);

        if (error) throw error;
    },
};
