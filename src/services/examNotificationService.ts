/**
 * EXAM NOTIFICATION SERVICE
 * Production-ready API service for managing exam schedules and notifications
 * Single source of truth for all exam CRUD operations
 */

import { supabase } from '@/lib/supabase';
import type { 
  ExamSchedule, 
  CreateExamPayload, 
  UpdateExamPayload 
} from '@/types/examNotifications';

class ExamNotificationService {
  private tableName = 'exam_schedules';

  /**
   * Get all exam schedules for the current user
   * @param includeAll - If true, includes past exams; if false, only upcoming exams
   */
  async getUserExams(includeAll: boolean = false): Promise<ExamSchedule[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: true });

      // Filter out past exams if requested
      if (!includeAll) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('exam_date', today);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[ExamService] Error fetching exams:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('[ExamService] getUserExams failed:', error);
      return [];
    }
  }

  /**
   * Get the nearest upcoming exam (for priority notification)
   */
  async getNearestExam(): Promise<ExamSchedule | null> {
    try {
      const exams = await this.getUserExams(false);
      return exams.length > 0 ? exams[0] : null;
    } catch (error) {
      console.error('[ExamService] getNearestExam failed:', error);
      return null;
    }
  }

  /**
   * Create a new exam schedule
   */
  async createExam(payload: CreateExamPayload): Promise<ExamSchedule | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const examData = {
        user_id: user.id,
        exam_name: payload.exam_name,
        exam_date: payload.exam_date,
        exam_time: payload.exam_time || null,
        subject: payload.subject || null,
        location: payload.location || null,
        duration_minutes: payload.duration_minutes || 180,
        topics: payload.topics || [],
        importance: payload.importance || 'medium',
        color: payload.color || '#C9B458',
        notes: payload.notes || null,
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(examData)
        .select()
        .single();

      if (error) {
        console.error('[ExamService] Error creating exam:', error);
        throw error;
      }

      console.log('[ExamService] ✅ Exam created:', data);
      return data;
    } catch (error) {
      console.error('[ExamService] createExam failed:', error);
      return null;
    }
  }

  /**
   * Create multiple exams at once (bulk import)
   */
  async createExamsBulk(payloads: CreateExamPayload[]): Promise<ExamSchedule[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const examsData = payloads.map(payload => ({
        user_id: user.id,
        exam_name: payload.exam_name,
        exam_date: payload.exam_date,
        exam_time: payload.exam_time || null,
        subject: payload.subject || null,
        location: payload.location || null,
        duration_minutes: payload.duration_minutes || 180,
        topics: payload.topics || [],
        importance: payload.importance || 'medium',
        color: payload.color || '#C9B458',
        notes: payload.notes || null,
      }));

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(examsData)
        .select();

      if (error) {
        console.error('[ExamService] Error bulk creating exams:', error);
        throw error;
      }

      console.log('[ExamService] ✅ Bulk exams created:', data?.length);
      return data || [];
    } catch (error) {
      console.error('[ExamService] createExamsBulk failed:', error);
      return [];
    }
  }

  /**
   * Update an existing exam schedule
   */
  async updateExam(payload: UpdateExamPayload): Promise<ExamSchedule | null> {
    try {
      const { id, ...updates } = payload;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[ExamService] Error updating exam:', error);
        throw error;
      }

      console.log('[ExamService] ✅ Exam updated:', data);
      return data;
    } catch (error) {
      console.error('[ExamService] updateExam failed:', error);
      return null;
    }
  }

  /**
   * Delete an exam schedule
   */
  async deleteExam(examId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', examId);

      if (error) {
        console.error('[ExamService] Error deleting exam:', error);
        throw error;
      }

      console.log('[ExamService] ✅ Exam deleted:', examId);
      return true;
    } catch (error) {
      console.error('[ExamService] deleteExam failed:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time exam updates
   */
  subscribeToExams(callback: (exams: ExamSchedule[]) => void) {
    const channel = supabase
      .channel('exam_schedules_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
        },
        async () => {
          // Refetch all exams when any change occurs
          const exams = await this.getUserExams();
          callback(exams);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Archive past exams (move them out of active view)
   */
  async archivePastExams(daysOld: number = 30): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', user.id)
        .lt('exam_date', cutoffDateStr)
        .select();

      if (error) {
        console.error('[ExamService] Error archiving past exams:', error);
        throw error;
      }

      console.log('[ExamService] ✅ Archived exams:', data?.length || 0);
      return data?.length || 0;
    } catch (error) {
      console.error('[ExamService] archivePastExams failed:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const examNotificationService = new ExamNotificationService();
