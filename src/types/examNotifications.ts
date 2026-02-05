/**
 * EXAM NOTIFICATION TYPES
 * TypeScript interfaces for global countdown notification system
 */

export interface ExamSchedule {
  id: string;
  user_id: string;
  exam_name: string;
  exam_date: string; // ISO date string (YYYY-MM-DD)
  exam_time?: string; // HH:MM format
  subject?: string;
  location?: string;
  duration_minutes?: number;
  topics?: string[];
  importance: 'low' | 'medium' | 'high';
  color?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamCountdown {
  exam: ExamSchedule;
  daysLeft: number;
  message: string;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
  urgencyLevel: 'calm' | 'moderate' | 'urgent' | 'critical';
}

export interface CreateExamPayload {
  exam_name: string;
  exam_date: string;
  exam_time?: string;
  subject?: string;
  location?: string;
  duration_minutes?: number;
  topics?: string[];
  importance?: 'low' | 'medium' | 'high';
  color?: string;
  notes?: string;
}

export interface UpdateExamPayload extends Partial<CreateExamPayload> {
  id: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  showBadge: boolean;
  soundEnabled: boolean;
  criticalDaysThreshold: number; // Show critical alert when days <= this value
  moderateDaysThreshold: number;
}
