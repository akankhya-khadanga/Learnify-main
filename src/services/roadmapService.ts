import { supabase } from '@/lib/supabase';
import { generateDetailedRoadmap, type RoadmapQuestionnaire } from '@/lib/gemini';
import type {
  UserRoadmap,
  RoadmapMilestone,
  RoadmapProgress,
  RoadmapTimeTracking,
  RoadmapWithMilestones,
  CreateRoadmapResponse,
  UpdateProgressResponse,
  RoadmapListResponse,
  RoadmapAnalytics,
  ProgressStatus,
} from '@/types/roadmap';

// ============================================================================
// AI ROADMAP GENERATION
// ============================================================================

/**
 * Generate a new AI-powered roadmap and save to Supabase
 */
export async function createAIRoadmap(
  userId: string,
  questionnaire: RoadmapQuestionnaire
): Promise<CreateRoadmapResponse> {
  try {
    // Verify authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      throw new Error('User not authenticated. Please log in again.');
    }

    const authenticatedUserId = session.user.id;
    if (userId !== authenticatedUserId) {
      userId = authenticatedUserId;
    }

    // Generate roadmap using Gemini AI
    const detailedRoadmap = await generateDetailedRoadmap(questionnaire);

    // Create roadmap entry
    const { data: roadmap, error: roadmapError } = await supabase
      .from('user_roadmaps')
      .insert({
        user_id: authenticatedUserId,
        title: detailedRoadmap.title,
        description: detailedRoadmap.userSummary
          ? `${detailedRoadmap.userSummary.skill} | ${detailedRoadmap.userSummary.timeline}`
          : null,
        goal: questionnaire.topic,
        category: 'AI Generated',
        tags: detailedRoadmap.stages.flatMap(s => s.topics).slice(0, 10),
        difficulty: questionnaire.skillLevel,
        estimated_duration: `${questionnaire.duration} ${questionnaire.durationUnit}`,
        source: 'ai' as const,
        total_milestones: detailedRoadmap.stages.length,
        completed_milestones: 0,
        progress_percentage: 0,
      })
      .select()
      .single();

    if (roadmapError) throw roadmapError;

    // Create milestones
    const milestones = detailedRoadmap.stages.map((stage, index) => ({
      roadmap_id: roadmap.id,
      title: stage.title,
      description: stage.description,
      order_index: index + 1,
      skills: stage.topics || [],
      topics: stage.topics || [],
      exercises: stage.exercises || [],
      projects: stage.projects || [],
      resources: (stage.resources || []).map(r => ({
        id: `res-${roadmap.id}-${index}-${Math.random().toString(36).substring(7)}`,
        type: r.type || 'article',
        title: r.title,
        url: r.url || '#',
        description: r.description || '',
        is_free: true,
        completed: false,
      })),
      difficulty: stage.difficulty,
      estimated_hours: stage.estimatedHours || 5,
      is_completed: false,
      time_spent_minutes: 0,
    }));

    const { data: createdMilestones, error: milestonesError } = await supabase
      .from('roadmap_milestones')
      .insert(milestones)
      .select();

    if (milestonesError) throw milestonesError;

    return {
      roadmap,
      milestones: createdMilestones,
      error: null,
    };
  } catch (error: any) {
    console.error('Error creating AI roadmap:', error);
    return {
      roadmap: null as any,
      milestones: [],
      error: error.message || 'Failed to create roadmap',
    };
  }
}

// ============================================================================
// ROADMAP CRUD OPERATIONS
// ============================================================================

/**
 * Load all user roadmaps with milestones
 */
export async function getUserRoadmaps(userId: string): Promise<RoadmapListResponse> {
  try {
    const { data: roadmaps, error: roadmapsError } = await supabase
      .from('user_roadmaps')
      .select(`
        *,
        milestones:roadmap_milestones(*)
      `)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (roadmapsError) throw roadmapsError;

    return {
      roadmaps: roadmaps as unknown as RoadmapWithMilestones[],
      error: null,
    };
  } catch (error: any) {
    console.error('Error fetching user roadmaps:', error);
    return {
      roadmaps: [],
      error: error.message || 'Failed to load roadmaps',
    };
  }
}

/**
 * Get a single roadmap with milestones
 */
export async function getRoadmap(roadmapId: string): Promise<RoadmapWithMilestones | null> {
  try {
    const { data, error } = await supabase
      .from('user_roadmaps')
      .select(`
        *,
        milestones:roadmap_milestones(*)
      `)
      .eq('id', roadmapId)
      .eq('is_deleted', false)
      .single();

    if (error) throw error;

    return data as unknown as RoadmapWithMilestones;
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return null;
  }
}

/**
 * Delete a roadmap (soft delete)
 */
export async function deleteUserRoadmap(roadmapId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('user_roadmaps')
      .update({ is_deleted: true })
      .eq('id', roadmapId);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error('Error deleting roadmap:', error);
    return { error: error.message || 'Failed to delete roadmap' };
  }
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Update milestone completion and track progress
 */
export async function completeMilestone(
  userId: string,
  roadmapId: string,
  milestoneId: string,
  notes?: string
): Promise<UpdateProgressResponse> {
  try {
    // Mark milestone as completed
    const { error: milestoneError } = await supabase
      .from('roadmap_milestones')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', milestoneId);

    if (milestoneError) throw milestoneError;

    // Update or create progress record
    const { data: progress, error: progressError } = await supabase
      .from('roadmap_progress')
      .upsert({
        user_id: userId,
        roadmap_id: roadmapId,
        milestone_id: milestoneId,
        status: 'completed' as ProgressStatus,
        completion_percentage: 100,
        completed_at: new Date().toISOString(),
        last_studied_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (progressError) throw progressError;

    // Get updated roadmap (progress auto-synced by trigger)
    const { data: roadmap, error: roadmapError } = await supabase
      .from('user_roadmaps')
      .select('*')
      .eq('id', roadmapId)
      .single();

    if (roadmapError) throw roadmapError;

    return {
      progress,
      roadmap,
      error: null,
    };
  } catch (error: any) {
    console.error('Error completing milestone:', error);
    return {
      progress: null as any,
      roadmap: null as any,
      error: error.message || 'Failed to complete milestone',
    };
  }
}

/**
 * Track time spent on a milestone
 */
export async function trackStudyTime(
  userId: string,
  roadmapId: string,
  milestoneId: string,
  durationMinutes: number,
  notes?: string
): Promise<{ error: string | null }> {
  try {
    // Update milestone time spent
    const { error: milestoneError } = await supabase.rpc('increment', {
      table_name: 'roadmap_milestones',
      row_id: milestoneId,
      column_name: 'time_spent_minutes',
      increment_by: durationMinutes,
    }).single();

    // Create time tracking entry
    const { error: trackingError } = await supabase
      .from('roadmap_time_tracking')
      .insert({
        user_id: userId,
        roadmap_id: roadmapId,
        milestone_id: milestoneId,
        session_start: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
        session_end: new Date().toISOString(),
        duration_minutes: durationMinutes,
        activity_type: 'study',
        notes,
      });

    if (trackingError) throw trackingError;

    return { error: null };
  } catch (error: any) {
    console.error('Error tracking study time:', error);
    return { error: error.message || 'Failed to track time' };
  }
}

/**
 * Update progress status for a milestone
 */
export async function updateMilestoneProgress(
  userId: string,
  roadmapId: string,
  milestoneId: string,
  status: ProgressStatus,
  completionPercentage?: number
): Promise<{ error: string | null }> {
  try {
    const updates: any = {
      user_id: userId,
      roadmap_id: roadmapId,
      milestone_id: milestoneId,
      status,
      last_studied_at: new Date().toISOString(),
    };

    if (completionPercentage !== undefined) {
      updates.completion_percentage = completionPercentage;
    }

    if (status === 'in_progress' && !updates.started_at) {
      updates.started_at = new Date().toISOString();
    }

    if (status === 'completed') {
      updates.completion_percentage = 100;
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('roadmap_progress')
      .upsert(updates);

    if (error) throw error;

    return { error: null };
  } catch (error: any) {
    console.error('Error updating progress:', error);
    return { error: error.message || 'Failed to update progress' };
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Get roadmap analytics from database function
 */
export async function getRoadmapAnalytics(roadmapId: string): Promise<RoadmapAnalytics | null> {
  try {
    const { data, error } = await supabase.rpc('get_roadmap_analytics', {
      p_roadmap_id: roadmapId,
    });

    if (error) throw error;

    // Calculate additional metrics
    const roadmap = await getRoadmap(roadmapId);
    if (!roadmap) return data;

    // Calculate velocity (milestones per week)
    const startedAt = roadmap.started_at ? new Date(roadmap.started_at) : new Date(roadmap.created_at);
    const now = new Date();
    const weeksElapsed = Math.max(1, (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const velocity = roadmap.completed_milestones / weeksElapsed;

    // Estimate completion date
    const remainingMilestones = roadmap.total_milestones - roadmap.completed_milestones;
    const estimatedWeeksRemaining = velocity > 0 ? remainingMilestones / velocity : 0;
    const estimatedCompletionDate = new Date(now.getTime() + estimatedWeeksRemaining * 7 * 24 * 60 * 60 * 1000).toISOString();

    return {
      ...data,
      velocity,
      estimated_completion_date: estimatedCompletionDate,
      completion_percentage: roadmap.progress_percentage,
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

/**
 * Get time tracking history for a roadmap
 */
export async function getRoadmapTimeHistory(
  roadmapId: string
): Promise<RoadmapTimeTracking[]> {
  try {
    const { data, error } = await supabase
      .from('roadmap_time_tracking')
      .select('*')
      .eq('roadmap_id', roadmapId)
      .order('session_start', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching time history:', error);
    return [];
  }
}
