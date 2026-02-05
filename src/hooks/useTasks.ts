import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    category?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    completed: boolean;
    completed_at?: string;
    parent_task_id?: string;
    created_at: string;
    updated_at: string;
}

export const useTasks = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Load all tasks
    const loadTasks = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id)
                .order('due_date', { ascending: true, nullsFirst: false });

            if (error) throw error;

            setTasks(data || []);
        } catch (err) {
            console.error('Load tasks error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create task
    const createTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed' | 'completed_at'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('tasks')
                .insert([
                    {
                        ...task,
                        user_id: user.id,
                        completed: false,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            setTasks(prev => [...prev, data]);

            toast({
                title: 'Task Created',
                description: task.title,
            });

            return data;
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to create task',
                variant: 'destructive',
            });
            throw err;
        }
    };

    // Update task
    const updateTask = async (id: string, updates: Partial<Task>) => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setTasks(prev => prev.map(t => (t.id === id ? data : t)));

            return data;
        } catch (err) {
            console.error('Update task error:', err);
            throw err;
        }
    };

    // Toggle task completion
    const toggleTaskCompletion = async (id: string) => {
        try {
            const task = tasks.find(t => t.id === id);
            if (!task) return;

            const completed = !task.completed;
            const completed_at = completed ? new Date().toISOString() : null;

            await updateTask(id, { completed, completed_at: completed_at || undefined });

            toast({
                title: completed ? 'Task Completed' : 'Task Reopened',
                description: task.title,
            });
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to update task',
                variant: 'destructive',
            });
        }
    };

    // Delete task
    const deleteTask = async (id: string) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTasks(prev => prev.filter(t => t.id !== id));

            toast({
                title: 'Task Deleted',
                description: 'Task has been removed',
            });
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete task',
                variant: 'destructive',
            });
            throw err;
        }
    };

    // Get tasks by category
    const getTasksByCategory = (category: string) => {
        return tasks.filter(t => t.category === category);
    };

    // Get tasks by priority
    const getTasksByPriority = (priority: string) => {
        return tasks.filter(t => t.priority === priority);
    };

    // Get overdue tasks
    const getOverdueTasks = () => {
        const now = new Date().toISOString();
        return tasks.filter(t => !t.completed && t.due_date && t.due_date < now);
    };

    // Get upcoming tasks (next 7 days)
    const getUpcomingTasks = () => {
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        return tasks.filter(
            t =>
                !t.completed &&
                t.due_date &&
                t.due_date >= now.toISOString() &&
                t.due_date <= nextWeek.toISOString()
        );
    };

    useEffect(() => {
        loadTasks();
    }, []);

    return {
        tasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        getTasksByCategory,
        getTasksByPriority,
        getOverdueTasks,
        getUpcomingTasks,
        refreshTasks: loadTasks,
    };
};
