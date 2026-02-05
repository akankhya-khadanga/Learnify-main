import { supabase } from '@/lib/supabase';
import { analyticsService } from './analyticsService';
import { habitService } from './habitService';

export interface ProgressReport {
    userId: string;
    userName: string;
    userEmail: string;
    period: 'weekly' | 'monthly';
    startDate: Date;
    endDate: Date;
    stats: {
        totalStudyMinutes: number;
        sessionCount: number;
        avgSessionDuration: number;
        xpGained: number;
        habitsCompleted: number;
        currentStreak: number;
        mostProductiveDay: string;
        mostProductiveHour: string;
    };
    activities: Array<{
        type: string;
        duration: number;
    }>;
    achievements: string[];
}

class ReportService {
    /**
     * Generate a progress report for a user
     */
    async generateReport(
        userId: string,
        period: 'weekly' | 'monthly' = 'weekly'
    ): Promise<ProgressReport> {
        const endDate = new Date();
        const startDate = new Date();

        if (period === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
        } else {
            startDate.setMonth(startDate.getMonth() - 1);
        }

        // Get user info
        const { data: userData } = await supabase
            .from('user_profiles')
            .select('full_name, email')
            .eq('id', userId)
            .single();

        // Get study analytics
        const [weeklySummary, studyTimeByActivity] = await Promise.all([
            analyticsService.getWeeklySummary(userId),
            analyticsService.getStudyTimeByActivity(userId, startDate, endDate)
        ]);

        // Get habit stats
        const habitStats = await habitService.getHabitStats(userId);
        const totalHabitsCompleted = habitStats.reduce(
            (sum, h) => sum + (period === 'weekly' ? h.completions_this_week : h.completions_this_month),
            0
        );
        const maxStreak = Math.max(...habitStats.map(h => h.current_streak), 0);

        // Get XP gained (from user_profiles)
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select('xp')
            .eq('id', userId)
            .single();

        // Format activities
        const activities = Object.entries(studyTimeByActivity).map(([type, duration]) => ({
            type: this.formatActivityType(type),
            duration: Math.round(duration)
        }));

        // Generate achievements
        const achievements = this.generateAchievements(weeklySummary, totalHabitsCompleted, maxStreak);

        // Format day and hour
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const formatHour = (hour: number) => {
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:00 ${period}`;
        };

        return {
            userId,
            userName: userData?.full_name || 'Student',
            userEmail: userData?.email || '',
            period,
            startDate,
            endDate,
            stats: {
                totalStudyMinutes: weeklySummary.totalMinutes,
                sessionCount: weeklySummary.sessionCount,
                avgSessionDuration: Math.round(weeklySummary.avgSessionDuration),
                xpGained: profileData?.xp || 0,
                habitsCompleted: totalHabitsCompleted,
                currentStreak: maxStreak,
                mostProductiveDay: days[weeklySummary.mostProductiveDay],
                mostProductiveHour: formatHour(weeklySummary.mostProductiveHour)
            },
            activities,
            achievements
        };
    }

    /**
     * Send progress report via email
     */
    async sendReport(report: ProgressReport): Promise<void> {
        // This would integrate with Resend API
        // For now, we'll create a Supabase Edge Function to handle this
        const { error } = await supabase.functions.invoke('send-progress-report', {
            body: { report }
        });

        if (error) {
            console.error('Error sending report:', error);
            throw new Error(`Failed to send report: ${error.message}`);
        }
    }

    /**
     * Schedule weekly reports for a user
     */
    async scheduleWeeklyReports(userId: string, enabled: boolean): Promise<void> {
        const { error } = await supabase
            .from('user_profiles')
            .update({ weekly_reports_enabled: enabled })
            .eq('id', userId);

        if (error) {
            console.error('Error updating report preferences:', error);
            throw new Error(`Failed to update preferences: ${error.message}`);
        }
    }

    /**
     * Get report preferences
     */
    async getReportPreferences(userId: string): Promise<{
        weeklyEnabled: boolean;
        monthlyEnabled: boolean;
    }> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('weekly_reports_enabled, monthly_reports_enabled')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching preferences:', error);
            return { weeklyEnabled: false, monthlyEnabled: false };
        }

        return {
            weeklyEnabled: data?.weekly_reports_enabled || false,
            monthlyEnabled: data?.monthly_reports_enabled || false
        };
    }

    private formatActivityType(type: string): string {
        const typeMap: Record<string, string> = {
            notes: 'Smart Notes',
            ai_tutor: 'AI Tutor',
            vr: 'VR Study',
            courses: 'Courses',
            workspace: 'Workspaces',
            unknown: 'Other'
        };
        return typeMap[type] || type;
    }

    private generateAchievements(
        summary: any,
        habitsCompleted: number,
        maxStreak: number
    ): string[] {
        const achievements: string[] = [];

        if (summary.totalMinutes >= 300) {
            achievements.push('🏆 Study Champion - 5+ hours this week!');
        }

        if (summary.sessionCount >= 10) {
            achievements.push('🔥 Consistency King - 10+ study sessions!');
        }

        if (maxStreak >= 7) {
            achievements.push('⚡ Week Warrior - 7-day habit streak!');
        }

        if (habitsCompleted >= 20) {
            achievements.push('✨ Habit Master - 20+ habits completed!');
        }

        if (summary.avgSessionDuration >= 45) {
            achievements.push('🎯 Deep Focus - 45+ min average sessions!');
        }

        return achievements;
    }
}

export const reportService = new ReportService();
