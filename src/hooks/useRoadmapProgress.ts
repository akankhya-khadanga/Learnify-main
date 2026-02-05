import { useState, useEffect, useCallback } from 'react';
import type {
    RoadmapProgress,
    ProgressStatus,
    RoadmapAnalytics,
} from '@/types/roadmap';
import {
    completeMilestone,
    updateMilestoneProgress,
    getRoadmapAnalytics,
} from '@/services/roadmapService';
import { useUserStore } from '@/store/userStore';
import { useToast } from '@/hooks/use-toast';

interface UseRoadmapProgressOptions {
    roadmapId: string;
    onProgressUpdate?: (analytics: RoadmapAnalytics | null) => void;
}

export function useRoadmapProgress({ roadmapId, onProgressUpdate }: UseRoadmapProgressOptions) {
    const userId = useUserStore(state => state.user?.id);
    const { toast } = useToast();

    const [analytics, setAnalytics] = useState<RoadmapAnalytics | null>(null);
    const [loading, setLoading] = useState(false);

    // Load analytics
    const loadAnalytics = useCallback(async () => {
        if (!roadmapId) return;

        const data = await getRoadmapAnalytics(roadmapId);
        setAnalytics(data);
        onProgressUpdate?.(data);
    }, [roadmapId, onProgressUpdate]);

    useEffect(() => {
        loadAnalytics();
    }, [loadAnalytics]);

    // Complete a milestone
    const handleCompleteMilestone = useCallback(
        async (milestoneId: string, notes?: string) => {
            if (!userId) {
                toast({
                    title: 'Error',
                    description: 'You must be logged in to track progress',
                    variant: 'destructive',
                });
                return;
            }

            setLoading(true);
            try {
                const { error } = await completeMilestone(userId, roadmapId, milestoneId, notes);

                if (error) {
                    throw new Error(error);
                }

                toast({
                    title: '🎉 Milestone Completed!',
                    description: 'Great job! You earned XP and are one step closer to your goal.',
                });

                // Reload analytics
                await loadAnalytics();
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to complete milestone',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        },
        [userId, roadmapId, toast, loadAnalytics]
    );

    // Update milestone status
    const handleUpdateStatus = useCallback(
        async (milestoneId: string, status: ProgressStatus, completionPercentage?: number) => {
            if (!userId) return;

            setLoading(true);
            try {
                const { error } = await updateMilestoneProgress(
                    userId,
                    roadmapId,
                    milestoneId,
                    status,
                    completionPercentage
                );

                if (error) throw new Error(error);

                // Reload analytics
                await loadAnalytics();
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to update progress',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        },
        [userId, roadmapId, toast, loadAnalytics]
    );

    return {
        analytics,
        loading,
        completeMilestone: handleCompleteMilestone,
        updateStatus: handleUpdateStatus,
        refresh: loadAnalytics,
    };
}
