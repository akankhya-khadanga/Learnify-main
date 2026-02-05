import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Workspace {
    id: string;
    user_id: string;
    name: string;
    type: string;
    tools: any[];
    layout_mode: 'grid' | 'split' | 'freeform';
    created_at: string;
    updated_at: string;
}

export const useWorkspace = () => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Load all workspaces for current user
    const loadWorkspaces = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('User not authenticated');
                return;
            }

            const { data, error: fetchError } = await supabase
                .from('workspaces')
                .select('*')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false });

            if (fetchError) throw fetchError;

            setWorkspaces(data || []);
            setError(null);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load workspaces';
            setError(errorMsg);
            console.error('Load workspaces error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new workspace
    const createWorkspace = async (workspace: Omit<Workspace, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error: insertError } = await supabase
                .from('workspaces')
                .insert([
                    {
                        ...workspace,
                        user_id: user.id,
                    },
                ])
                .select()
                .single();

            if (insertError) throw insertError;

            setWorkspaces(prev => [data, ...prev]);

            toast({
                title: 'Workspace Created',
                description: `${workspace.name} has been created successfully`,
            });

            return data;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to create workspace';
            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'destructive',
            });
            throw err;
        }
    };

    // Update existing workspace
    const updateWorkspace = async (id: string, updates: Partial<Workspace>) => {
        try {
            const { data, error: updateError } = await supabase
                .from('workspaces')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            setWorkspaces(prev =>
                prev.map(w => (w.id === id ? data : w))
            );

            return data;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to update workspace';
            console.error('Update workspace error:', err);
            throw err;
        }
    };

    // Delete workspace
    const deleteWorkspace = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('workspaces')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setWorkspaces(prev => prev.filter(w => w.id !== id));

            toast({
                title: 'Workspace Deleted',
                description: 'Workspace has been removed',
            });
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to delete workspace';
            toast({
                title: 'Error',
                description: errorMsg,
                variant: 'destructive',
            });
            throw err;
        }
    };

    // Auto-save workspace state
    const saveWorkspaceState = async (id: string, tools: any[], layoutMode: string) => {
        try {
            await updateWorkspace(id, {
                tools,
                layout_mode: layoutMode as 'grid' | 'split' | 'freeform',
            });
        } catch (err) {
            console.error('Auto-save error:', err);
        }
    };

    // Load workspaces on mount
    useEffect(() => {
        loadWorkspaces();
    }, []);

    return {
        workspaces,
        loading,
        error,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        saveWorkspaceState,
        refreshWorkspaces: loadWorkspaces,
    };
};
