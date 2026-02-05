// Sign Language Learning System - Type Definitions

export type SignLanguageType = 'ASL' | 'ISL' | 'BSL' | 'CSL' | 'JSL' | 'LSF' | 'DGS';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type LearningSpeed = 'slow' | 'medium' | 'fast';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';

export type GestureComplexity = 'simple' | 'moderate' | 'complex';

export interface SignLanguageProfile {
  id: string;
  user_id: string;
  preferred_language: SignLanguageType;
  skill_level: DifficultyLevel;
  learning_speed: LearningSpeed;
  hand_dominance: 'left' | 'right' | 'ambidextrous';
  accessibility_needs: {
    high_contrast: boolean;
    larger_subtitles: boolean;
    haptic_feedback: boolean;
    color_blind_mode: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface SignLesson {
  id: string;
  user_id: string;
  topic: string;
  subject_category: string;
  difficulty: DifficultyLevel;
  sign_language: SignLanguageType;
  lesson_script: LessonScript;
  estimated_duration_minutes: number;
  gesture_count: number;
  status: LessonStatus;
  completion_percentage: number;
  cached_locally: boolean;
  created_at: string;
  last_accessed: string;
}

export interface LessonScript {
  title: string;
  introduction: string;
  sections: LessonSection[];
  summary: string;
  key_gestures: string[];
}

export interface LessonSection {
  id: string;
  order: number;
  content: string;
  sign_sequence: SignGesture[];
  visual_aids: VisualAid[];
  emphasis_points: string[];
}

export interface SignGesture {
  id: string;
  word_or_phrase: string;
  sign_language: SignLanguageType;
  gesture_data: GestureData;
  duration_ms: number;
  complexity: GestureComplexity;
  requires_both_hands: boolean;
  facial_expression?: string;
  body_orientation?: string;
}

export interface GestureData {
  // CCMA Model output format
  pose_keypoints: PoseKeypoint[];
  hand_landmarks_left?: HandLandmark[];
  hand_landmarks_right?: HandLandmark[];
  motion_path: MotionFrame[];
  timing_curves: TimingCurve[];
}

export interface PoseKeypoint {
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface HandLandmark {
  id: number;
  x: number;
  y: number;
  z: number;
  confidence: number;
}

export interface MotionFrame {
  timestamp_ms: number;
  keypoints: PoseKeypoint[];
  hand_left?: HandLandmark[];
  hand_right?: HandLandmark[];
}

export interface TimingCurve {
  start_ms: number;
  end_ms: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface VisualAid {
  type: 'diagram' | 'image' | 'text_highlight' | 'arrow';
  content: string;
  position: { x: number; y: number };
  duration_ms: number;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  current_section: number;
  gestures_learned: string[];
  gestures_mastered: string[];
  weak_gestures: string[];
  accuracy_scores: AccuracyScore[];
  repetition_count: number;
  total_time_spent_minutes: number;
  last_practiced: string;
  next_review_date: string;
  spaced_repetition_interval_days: number;
}

export interface AccuracyScore {
  gesture_id: string;
  attempt_number: number;
  score: number; // 0-100
  timestamp: string;
  feedback: string[];
}

export interface PracticeSession {
  id: string;
  user_id: string;
  lesson_id: string;
  gesture_id: string;
  student_recording: MotionFrame[];
  reference_recording: MotionFrame[];
  comparison_result: ComparisonResult;
  created_at: string;
}

export interface ComparisonResult {
  overall_accuracy: number; // 0-100
  hand_accuracy_left: number;
  hand_accuracy_right: number;
  body_pose_accuracy: number;
  timing_accuracy: number;
  feedback: FeedbackPoint[];
  suggestions: string[];
}

export interface FeedbackPoint {
  type: 'error' | 'warning' | 'success';
  body_part: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  correction_tip: string;
}

export interface SignQuiz {
  id: string;
  lesson_id: string;
  questions: QuizQuestion[];
  passing_score: number;
}

export interface QuizQuestion {
  id: string;
  gesture_to_show: SignGesture;
  correct_answer: string;
  options: string[];
  explanation: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  answers: QuizAnswer[];
  completed_at: string;
}

export interface QuizAnswer {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken_seconds: number;
}

export interface OfflineLesson {
  lesson_id: string;
  lesson_data: SignLesson;
  video_cache_url?: string;
  frame_sequence?: MotionFrame[];
  size_mb: number;
  downloaded_at: string;
  expires_at: string;
}

export interface LearningAnalytics {
  user_id: string;
  total_lessons_completed: number;
  total_gestures_learned: number;
  average_accuracy: number;
  learning_streak_days: number;
  weekly_minutes: number;
  strong_gesture_types: GestureComplexity[];
  weak_areas: string[];
  retention_rate: number;
  practice_frequency: 'daily' | 'frequent' | 'occasional' | 'rare';
}

export interface AdaptiveLearningState {
  user_id: string;
  current_speed: LearningSpeed;
  auto_repeat_threshold: number; // accuracy below this triggers repeat
  visual_complexity_level: 'minimal' | 'standard' | 'detailed';
  preferred_session_length_minutes: number;
  break_reminders_enabled: boolean;
  cognitive_load_score: number; // 0-100, higher = needs easier content
  last_adjusted: string;
}

export interface TeacherCustomLesson {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  topic: string;
  target_difficulty: DifficultyLevel;
  custom_gestures: SignGesture[];
  sharing_enabled: boolean;
  classroom_ids: string[];
  created_at: string;
}

export interface ClassroomSignSession {
  id: string;
  classroom_id: string;
  teacher_id: string;
  lesson_id: string;
  active_students: string[];
  session_mode: 'live_teaching' | 'practice' | 'quiz';
  started_at: string;
  ended_at?: string;
}
