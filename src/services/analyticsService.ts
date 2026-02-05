import { supabase } from '@/lib/supabase';

export interface StudySession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  activity_type?: string;
  activity_id?: string;
  productivity_score?: number;
  created_at: string;
}

export interface StudyPatternStats {
  day_of_week: number; // 0=Sunday, 6=Saturday
  hour_of_day: number; // 0-23
  activity_type?: string;
  session_count: number;
  avg_duration: number;
  total_duration: number;
  avg_productivity: number;
}

export interface HeatMapData {
  day: number;
  hour: number;
  value: number;
}

class AnalyticsService {
  private activeSession: string | null = null;

  /**
   * Start a new study session
   */
  async startSession(
    userId: string,
    activityType?: string,
    activityId?: string
  ): Promise<StudySession> {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        started_at: new Date().toISOString(),
        activity_type: activityType,
        activity_id: activityId
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting session:', error);
      throw new Error(`Failed to start session: ${error.message}`);
    }

    this.activeSession = data.id;
    return data;
  }

  /**
   * End the current study session
   */
  async endSession(sessionId: string, productivityScore?: number): Promise<StudySession> {
    const updateData: any = {
      ended_at: new Date().toISOString()
    };

    if (productivityScore) {
      updateData.productivity_score = productivityScore;
    }

    const { data, error } = await supabase
      .from('study_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Error ending session:', error);
      throw new Error(`Failed to end session: ${error.message}`);
    }

    if (this.activeSession === sessionId) {
      this.activeSession = null;
    }

    return data;
  }

  /**
   * Get all study sessions for a user
   */
  async getUserSessions(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<StudySession[]> {
    let query = supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (startDate) {
      query = query.gte('started_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('started_at', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get study pattern statistics for heat map
   */
  async getStudyPatternStats(userId: string): Promise<StudyPatternStats[]> {
    const { data, error } = await supabase
      .from('study_pattern_stats')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching pattern stats:', error);
      throw new Error(`Failed to fetch pattern stats: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Generate heat map data for visualization
   */
  async getHeatMapData(userId: string): Promise<HeatMapData[]> {
    const stats = await this.getStudyPatternStats(userId);

    // Aggregate by day and hour
    const heatMap: Map<string, number> = new Map();

    stats.forEach(stat => {
      const key = `${stat.day_of_week}-${stat.hour_of_day}`;
      const current = heatMap.get(key) || 0;
      heatMap.set(key, current + stat.total_duration);
    });

    // Convert to array format
    const result: HeatMapData[] = [];
    heatMap.forEach((value, key) => {
      const [day, hour] = key.split('-').map(Number);
      result.push({ day, hour, value });
    });

    return result;
  }

  /**
   * Get best study times based on productivity and duration
   */
  async getBestStudyTimes(userId: string, limit: number = 5): Promise<StudyPatternStats[]> {
    const stats = await this.getStudyPatternStats(userId);

    // Sort by productivity and duration
    const sorted = stats.sort((a, b) => {
      const scoreA = (a.avg_productivity || 0) * a.avg_duration;
      const scoreB = (b.avg_productivity || 0) * b.avg_duration;
      return scoreB - scoreA;
    });

    return sorted.slice(0, limit);
  }

  /**
   * Get total study time for a period
   */
  async getTotalStudyTime(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const sessions = await this.getUserSessions(userId, startDate, endDate);
    return sessions.reduce((total, session) => total + (session.duration_minutes || 0), 0);
  }

  /**
   * Get study time by activity type
   */
  async getStudyTimeByActivity(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Record<string, number>> {
    const sessions = await this.getUserSessions(userId, startDate, endDate);

    const byActivity: Record<string, number> = {};
    sessions.forEach(session => {
      const type = session.activity_type || 'unknown';
      byActivity[type] = (byActivity[type] || 0) + (session.duration_minutes || 0);
    });

    return byActivity;
  }

  /**
   * Get weekly study summary
   */
  async getWeeklySummary(userId: string): Promise<{
    totalMinutes: number;
    sessionCount: number;
    avgSessionDuration: number;
    mostProductiveDay: number;
    mostProductiveHour: number;
  }> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const sessions = await this.getUserSessions(userId, oneWeekAgo);
    const stats = await this.getStudyPatternStats(userId);

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const sessionCount = sessions.length;
    const avgSessionDuration = sessionCount > 0 ? totalMinutes / sessionCount : 0;

    // Find most productive day and hour
    const dayStats = stats.reduce((acc, stat) => {
      acc[stat.day_of_week] = (acc[stat.day_of_week] || 0) + stat.total_duration;
      return acc;
    }, {} as Record<number, number>);

    const hourStats = stats.reduce((acc, stat) => {
      acc[stat.hour_of_day] = (acc[stat.hour_of_day] || 0) + stat.total_duration;
      return acc;
    }, {} as Record<number, number>);

    const mostProductiveDay = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    const mostProductiveHour = Object.entries(hourStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    return {
      totalMinutes,
      sessionCount,
      avgSessionDuration,
      mostProductiveDay: Number(mostProductiveDay),
      mostProductiveHour: Number(mostProductiveHour)
    };
  }

  /**
   * Refresh the materialized view (call periodically)
   */
  async refreshStats(): Promise<void> {
    const { error } = await supabase.rpc('refresh_study_pattern_stats');

    if (error) {
      console.error('Error refreshing stats:', error);
    }
  }
}

export const analyticsService = new AnalyticsService();
