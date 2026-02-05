/**
 * Unified OS - Data Models & Types
 * 
 * Core type definitions for the educational operating system.
 * Each Space is an isolated learning environment with subject-specific helpers.
 */

// ============================================================================
// SPACE MODELS
// ============================================================================

export type SpaceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Space {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  learning_goal: string;
  level: SpaceLevel;
  duration_weeks: number;
  instructor_id?: string;
  instructor_type?: 'ai' | 'human';
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  progress_percentage: number;
  is_archived: boolean;
  metadata?: Record<string, unknown>;
}

export interface SpaceCreateInput {
  name: string;
  subject: string;
  learning_goal: string;
  level: SpaceLevel;
  duration_weeks: number;
  instructor_id?: string;
  instructor_type?: 'ai' | 'human';
}

// ============================================================================
// HELPER MODELS
// ============================================================================

export type HelperType =
  | 'chatgpt'
  | 'youtube'
  | 'notebookllm'
  | 'classroom'
  | 'instructor'
  | 'notes';

export interface Helper {
  id: string;
  space_id: string;
  type: HelperType;
  name: string;
  is_active: boolean;
  config: HelperConfig;
  state: HelperState;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface HelperConfig {
  // ChatGPT
  temperature?: number;
  persona?: string;
  
  // YouTube
  max_results?: number;
  quality_filter?: 'high' | 'medium' | 'any';
  
  // NotebookLLM
  slide_style?: 'minimal' | 'professional' | 'academic';
  
  // Classroom
  note_style?: 'detailed' | 'bullet' | 'visual';
  
  // Instructor
  instructor_name?: string;
  expertise_areas?: string[];
  
  // Notes
  auto_index?: boolean;
  allowed_types?: string[];
}

export interface HelperState {
  last_used_at?: string;
  usage_count?: number;
  [key: string]: unknown;
}

// ============================================================================
// CHAT MODELS
// ============================================================================

export interface ChatMessage {
  id: string;
  space_id: string;
  helper_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    thinking?: string;
    sources?: string[];
    confidence?: number;
  };
}

export interface ChatThread {
  id: string;
  space_id: string;
  helper_id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// NOTES MODELS
// ============================================================================

export type NoteType = 'pdf' | 'text' | 'markdown' | 'image' | 'link';

export interface Note {
  id: string;
  space_id: string;
  helper_id: string;
  type: NoteType;
  title: string;
  content?: string;
  file_url?: string;
  file_size?: number;
  tags: string[];
  is_indexed: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteSearchResult {
  note: Note;
  relevance_score: number;
  matched_content: string;
}

// ============================================================================
// INSTRUCTOR MODELS
// ============================================================================

export interface Instructor {
  id: string;
  type: 'ai' | 'human';
  name: string;
  avatar_url?: string;
  bio?: string;
  expertise_areas: string[];
  subjects: string[];
  rating?: number;
  total_students?: number;
  is_available: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// YOUTUBE MODELS
// ============================================================================

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  thumbnail_url: string;
  duration: string;
  view_count: number;
  published_at: string;
  relevance_score: number;
}

export interface YouTubePlaylist {
  id: string;
  space_id: string;
  title: string;
  videos: YouTubeVideo[];
  created_at: string;
}

export interface YouTubeTimestamp {
  video_id: string;
  seconds: number;
  note: string;
  created_at: string;
}

// ============================================================================
// NOTEBOOKLLM MODELS
// ============================================================================

export interface Slide {
  id: string;
  order: number;
  title: string;
  content: string[];
  speaker_notes?: string;
  layout: 'title' | 'content' | 'two-column' | 'image' | 'quote';
}

export interface Presentation {
  id: string;
  space_id: string;
  title: string;
  theme: string;
  slides: Slide[];
  created_at: string;
  updated_at: string;
  exported_urls?: {
    pptx?: string;
    pdf?: string;
  };
}

// ============================================================================
// CLASSROOM MODELS
// ============================================================================

export interface ClassroomNote {
  id: string;
  space_id: string;
  topic: string;
  content: string;
  examples: string[];
  key_concepts: string[];
  practice_questions: string[];
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  space_id: string;
  title: string;
  description: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  feedback?: string;
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// WORKSPACE STATE
// ============================================================================

export interface WorkspaceState {
  active_space?: Space;
  active_helpers: Helper[];
  sidebar_collapsed: boolean;
  focus_mode: boolean;
  active_helper_id?: string;
  layout: 'default' | 'split' | 'fullscreen';
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}
