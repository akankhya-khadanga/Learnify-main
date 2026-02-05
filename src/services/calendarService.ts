// Google Calendar Integration Service
// Note: Requires Google Calendar API credentials in .env.local

interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
    location?: string;
}

interface CalendarImportResult {
    imported: number;
    skipped: number;
    errors: string[];
}

export class CalendarService {
    private accessToken: string | null = null;
    private readonly CLIENT_ID = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID;
    private readonly API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY;
    private readonly SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

    /**
     * Initialize Google OAuth flow
     */
    async initializeGoogleAuth(): Promise<void> {
        if (!this.CLIENT_ID) {
            throw new Error('Google Calendar Client ID not configured. Please add VITE_GOOGLE_CALENDAR_CLIENT_ID to .env.local');
        }

        return new Promise((resolve, reject) => {
            // Load Google API client
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                (window as any).gapi.load('client:auth2', async () => {
                    try {
                        await (window as any).gapi.client.init({
                            apiKey: this.API_KEY,
                            clientId: this.CLIENT_ID,
                            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                            scope: this.SCOPES,
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    /**
     * Sign in to Google account
     */
    async signIn(): Promise<boolean> {
        try {
            await this.initializeGoogleAuth();
            const auth = (window as any).gapi.auth2.getAuthInstance();
            const user = await auth.signIn();
            this.accessToken = user.getAuthResponse().access_token;
            return true;
        } catch (error) {
            console.error('Google sign-in error:', error);
            return false;
        }
    }

    /**
     * Check if user is signed in
     */
    isSignedIn(): boolean {
        const auth = (window as any).gapi?.auth2?.getAuthInstance();
        return auth?.isSignedIn?.get() || false;
    }

    /**
     * Sign out from Google account
     */
    async signOut(): Promise<void> {
        const auth = (window as any).gapi?.auth2?.getAuthInstance();
        if (auth) {
            await auth.signOut();
            this.accessToken = null;
        }
    }

    /**
     * Get list of user's calendars
     */
    async getCalendarList(): Promise<Array<{ id: string; summary: string; primary?: boolean }>> {
        if (!this.isSignedIn()) {
            throw new Error('Not signed in to Google');
        }

        try {
            const response = await (window as any).gapi.client.calendar.calendarList.list();
            return response.result.items || [];
        } catch (error) {
            console.error('Error fetching calendar list:', error);
            throw error;
        }
    }

    /**
     * Get events from a specific calendar
     */
    async getCalendarEvents(
        calendarId: string = 'primary',
        timeMin?: string,
        timeMax?: string
    ): Promise<GoogleCalendarEvent[]> {
        if (!this.isSignedIn()) {
            throw new Error('Not signed in to Google');
        }

        try {
            const params: any = {
                calendarId,
                timeMin: timeMin || new Date().toISOString(),
                timeMax: timeMax || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
                singleEvents: true,
                orderBy: 'startTime',
            };

            const response = await (window as any).gapi.client.calendar.events.list(params);
            return response.result.items || [];
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }

    /**
     * Import exams from Google Calendar
     */
    async importExamsFromCalendar(
        calendarId: string = 'primary',
        examKeywords: string[] = ['exam', 'test', 'quiz', 'midterm', 'final']
    ): Promise<CalendarImportResult> {
        const result: CalendarImportResult = {
            imported: 0,
            skipped: 0,
            errors: [],
        };

        try {
            const events = await this.getCalendarEvents(calendarId);
            const { examService } = await import('./studyPlannerService');

            for (const event of events) {
                // Check if event title contains exam keywords
                const isExam = examKeywords.some(keyword =>
                    event.summary?.toLowerCase().includes(keyword.toLowerCase())
                );

                if (!isExam) {
                    result.skipped++;
                    continue;
                }

                try {
                    // Extract exam details
                    const examDate = event.start.dateTime || event.start.date;
                    if (!examDate) {
                        result.errors.push(`Event "${event.summary}" has no date`);
                        continue;
                    }

                    // Determine subject from event title
                    const subject = this.extractSubject(event.summary);

                    // Create exam entry
                    await examService.create({
                        subject: subject || 'General',
                        title: event.summary,
                        exam_date: examDate,
                        location: event.location,
                        notes: event.description,
                        importance: 'high',
                        preparation_status: 'not_started',
                    });

                    result.imported++;
                } catch (error) {
                    result.errors.push(`Failed to import "${event.summary}": ${error}`);
                }
            }

            return result;
        } catch (error) {
            result.errors.push(`Calendar import failed: ${error}`);
            return result;
        }
    }

    /**
     * Extract subject from event title
     */
    private extractSubject(title: string): string | null {
        // Common subject patterns
        const subjects = [
            'math', 'mathematics', 'calculus', 'algebra', 'geometry',
            'physics', 'chemistry', 'biology', 'science',
            'english', 'literature', 'writing',
            'history', 'geography', 'social studies',
            'computer science', 'programming', 'cs',
            'economics', 'business', 'accounting',
        ];

        const lowerTitle = title.toLowerCase();
        for (const subject of subjects) {
            if (lowerTitle.includes(subject)) {
                return subject.charAt(0).toUpperCase() + subject.slice(1);
            }
        }

        return null;
    }

    /**
     * Export study schedule to Google Calendar
     */
    async exportScheduleToCalendar(
        calendarId: string = 'primary',
        startDate: string,
        endDate: string
    ): Promise<{ created: number; errors: string[] }> {
        if (!this.isSignedIn()) {
            throw new Error('Not signed in to Google');
        }

        const result = { created: 0, errors: [] as string[] };

        try {
            const { dailyScheduleService, studyTaskService } = await import('./studyPlannerService');
            const schedules = await dailyScheduleService.getRange(startDate, endDate);

            for (const schedule of schedules) {
                for (const taskAlloc of schedule.tasks) {
                    try {
                        const task = await studyTaskService.getById(taskAlloc.task_id);
                        if (!task) continue;

                        // Create calendar event
                        const event = {
                            summary: `Study: ${task.title}`,
                            description: task.description || `Allocated ${taskAlloc.allocated_hours} hours`,
                            start: {
                                date: schedule.date,
                            },
                            end: {
                                date: schedule.date,
                            },
                            colorId: '9', // Blue color for study events
                        };

                        await (window as any).gapi.client.calendar.events.insert({
                            calendarId,
                            resource: event,
                        });

                        result.created++;
                    } catch (error) {
                        result.errors.push(`Failed to export task: ${error}`);
                    }
                }
            }

            return result;
        } catch (error) {
            result.errors.push(`Export failed: ${error}`);
            return result;
        }
    }
}

// Export singleton instance
export const calendarService = new CalendarService();
