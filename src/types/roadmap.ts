/**
 * TypeScript types for AI-powered Roadmap System
 * Aligned with Supabase schema
 */

// ============================================================================
// DATABASE TYPES (matching Supabase schema)
// ============================================================================

export type RoadmapDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MilestoneDifficulty = 'easy' | 'medium' | 'hard';
export type RoadmapSource = 'ai' | 'template' | 'custom';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type ActivityType = 'study' | 'practice' | 'quiz' | 'project';

export interface UserRoadmap {
    id: string;
    user_id: string;

    // Core info
    title: string;
    description: string | null;
    goal: string;
    category: string;
    tags: string[];

    // Metadata
    difficulty: RoadmapDifficulty;
    estimated_duration: string | null;
    source: RoadmapSource;

    // Progress
    progress_percentage: number;
    total_milestones: number;
    completed_milestones: number;

    // Timestamps
    created_at: string;
    updated_at: string;
    started_at: string | null;
    completed_at: string | null;

    // Soft delete
    is_deleted: boolean;
}

export interface RoadmapResource {
    id: string;
    type: 'video' | 'article' | 'course' | 'book' | 'practice' | 'documentation' | 'tutorial';
    title: string;
    url: string;
    description?: string;
    is_free: boolean;
    duration?: string;
    completed?: boolean;
}

export interface RoadmapMilestone {
    id: string;
    roadmap_id: string;

    // Milestone info
    title: string;
    description: string | null;
    order_index: number;

    // Learning content
    skills: string[];
    topics: string[];
    exercises: string[];
    projects: string[];

    // Resources
    resources: RoadmapResource[];

    // Difficulty & time
    difficulty: MilestoneDifficulty;
    estimated_hours: number;

    // Progress
    is_completed: boolean;
    completed_at: string | null;
    time_spent_minutes: number;

    // Notes
    user_notes: string | null;

    created_at: string;
    updated_at: string;
}

export interface RoadmapProgress {
    id: string;
    user_id: string;
    roadmap_id: string;
    milestone_id: string;

    // Progress details
    status: ProgressStatus;
    completion_percentage: number;

    // Resources
    completed_resource_ids: string[];

    // Timestamps
    started_at: string | null;
    completed_at: string | null;
    last_studied_at: string | null;

    created_at: string;
    updated_at: string;
}

export interface RoadmapTimeTracking {
    id: string;
    user_id: string;
    roadmap_id: string;
    milestone_id: string | null;

    // Time tracking
    session_start: string;
    session_end: string | null;
    duration_minutes: number | null;

    // Context
    activity_type: ActivityType;
    notes: string | null;

    created_at: string;
}

// ============================================================================
// UI TYPES (for components)
// ============================================================================

export interface RoadmapWithMilestones extends UserRoadmap {
    milestones: RoadmapMilestone[];
}

export interface MilestoneWithProgress extends RoadmapMilestone {
    progress?: RoadmapProgress;
}

export interface RoadmapAnalytics {
    total_milestones: number;
    completed_milestones: number;
    in_progress_milestones: number;
    not_started_milestones: number;
    total_time_minutes: number;
    avg_time_per_milestone: number;
    estimated_remaining_hours: number;
    completion_percentage: number;
    velocity?: number; // milestones per week
    estimated_completion_date?: string;
}

export interface RoadmapQuestionnaire {
    topic: string;
    skillLevel: RoadmapDifficulty;
    duration: number;
    durationUnit: 'days' | 'weeks' | 'months';
    hoursPerDay?: number;
    hoursPerWeek?: number;
    includeQuizzes?: boolean;
    preferredResourceTypes?: string[];
}

export interface StudySession {
    milestoneId: string;
    startTime: Date;
    notes: string;
    completedResources: string[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface CreateRoadmapResponse {
    roadmap: UserRoadmap;
    milestones: RoadmapMilestone[];
    error: string | null;
}

export interface UpdateProgressResponse {
    progress: RoadmapProgress;
    roadmap: UserRoadmap; // Updated with new progress percentage
    error: string | null;
}

export interface RoadmapListResponse {
    roadmaps: RoadmapWithMilestones[];
    error: string | null;
}
