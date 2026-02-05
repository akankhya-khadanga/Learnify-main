/**
 * Study Together Service (PLACEHOLDER)
 * 
 * TODO: Replace with real Supabase + Realtime integration
 * Database tables needed: study_sessions, study_session_participants, session_chat_messages
 * 
 * Features:
 * - Shared focus timer with friends
 * - Real-time synchronization (Supabase Realtime)
 * - Chat enabled only during breaks
 * - Silent mode during focus periods
 */

import { supabase } from '@/lib/supabase';

export interface StudySession {
    id: string;
    hostId: string;
    hostName: string;
    sessionName: string;
    focusDuration: number; // minutes
    breakDuration: number; // minutes
    isActive: boolean;
    isBreakTime: boolean;
    timeRemaining: number; // seconds
    currentCycle: number;
    totalCycles: number;
    startedAt: Date;
    createdAt: Date;
}

export interface SessionParticipant {
    userId: string;
    name: string;
    avatar?: string;
    joinedAt: Date;
}

export interface SessionChatMessage {
    id: string;
    sessionId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    message: string;
    isBreakTime: boolean;
    createdAt: Date;
}

// Mock active session
const MOCK_SESSION: StudySession = {
    id: 'session_1',
    hostId: 'user_123',
    hostName: 'Alex Chen',
    sessionName: 'Late Night Study Session',
    focusDuration: 25, // 25 min Pomodoro
    breakDuration: 5,  // 5 min break
    isActive: true,
    isBreakTime: false,
    timeRemaining: 1500, // 25 min in seconds
    currentCycle: 1,
    totalCycles: 4,
    startedAt: new Date(),
    createdAt: new Date(Date.now() - 300000) // created 5 min ago
};

// Mock participants
const MOCK_PARTICIPANTS: SessionParticipant[] = [
    {
        userId: 'user_123',
        name: 'Alex Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        joinedAt: new Date(Date.now() - 300000)
    },
    {
        userId: 'user_456',
        name: 'Maya Patel',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
        joinedAt: new Date(Date.now() - 240000)
    },
    {
        userId: 'user_789',
        name: 'Jordan Lee',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
        joinedAt: new Date(Date.now() - 180000)
    }
];

// Mock chat messages
const MOCK_CHAT_MESSAGES: SessionChatMessage[] = [
    {
        id: 'msg_1',
        sessionId: 'session_1',
        userId: 'user_123',
        userName: 'Alex Chen',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        message: 'Break time! Great focus session everyone! 🔥',
        isBreakTime: true,
        createdAt: new Date(Date.now() - 180000)
    },
    {
        id: 'msg_2',
        sessionId: 'session_1',
        userId: 'user_456',
        userName: 'Maya Patel',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
        message: 'That was productive! Ready for the next round.',
        isBreakTime: true,
        createdAt: new Date(Date.now() - 120000)
    }
];

class StudyTogetherService {
    private timerInterval: NodeJS.Timeout | null = null;
    private currentSession: StudySession | null = null;

    /**
     * Create a new study session (PLACEHOLDER)
     * TODO: INSERT INTO study_sessions
     */
    async createSession(
        sessionName: string,
        focusDuration: number,
        breakDuration: number,
        totalCycles: number = 4
    ): Promise<StudySession> {
        console.log('[STUDY TOGETHER PLACEHOLDER] Creating session...');
        await new Promise(resolve => setTimeout(resolve, 300));

        const newSession: StudySession = {
            id: `session_${Date.now()}`,
            hostId: 'current_user',
            hostName: 'You',
            sessionName,
            focusDuration,
            breakDuration,
            isActive: true,
            isBreakTime: false,
            timeRemaining: focusDuration * 60, // convert to seconds
            currentCycle: 1,
            totalCycles,
            startedAt: new Date(),
            createdAt: new Date()
        };

        this.currentSession = newSession;
        this.startTimer();

        return newSession;
    }

    /**
     * Join an existing session (PLACEHOLDER)
     * TODO: INSERT INTO study_session_participants + subscribe to Realtime
     */
    async joinSession(sessionId: string): Promise<StudySession> {
        console.log(`[STUDY TOGETHER PLACEHOLDER] Joining session ${sessionId}...`);
        await new Promise(resolve => setTimeout(resolve, 300));

        this.currentSession = { ...MOCK_SESSION };
        this.startTimer();

        return this.currentSession;
    }

    /**
     * Leave current session (PLACEHOLDER)
     * TODO: DELETE FROM study_session_participants + unsubscribe
     */
    async leaveSession(): Promise<void> {
        console.log('[STUDY TOGETHER PLACEHOLDER] Leaving session...');
        await new Promise(resolve => setTimeout(resolve, 200));

        this.stopTimer();
        this.currentSession = null;
    }

    /**
     * Get current session
     */
    getCurrentSession(): StudySession | null {
        return this.currentSession;
    }

    /**
     * Get active participants in session (PLACEHOLDER)
     * TODO: SELECT FROM study_session_participants + Realtime subscription
     */
    async getParticipants(sessionId: string): Promise<SessionParticipant[]> {
        console.log(`[STUDY TOGETHER PLACEHOLDER] Fetching participants for ${sessionId}...`);
        await new Promise(resolve => setTimeout(resolve, 200));

        return [...MOCK_PARTICIPANTS];
    }

    /**
     * Send chat message (only during breaks) (PLACEHOLDER)
     * TODO: INSERT INTO session_chat_messages + Realtime broadcast
     */
    async sendMessage(sessionId: string, message: string): Promise<SessionChatMessage> {
        console.log(`[STUDY TOGETHER PLACEHOLDER] Sending message: ${message}`);
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!this.currentSession?.isBreakTime) {
            throw new Error('Chat is only available during break time');
        }

        const newMessage: SessionChatMessage = {
            id: `msg_${Date.now()}`,
            sessionId,
            userId: 'current_user',
            userName: 'You',
            message,
            isBreakTime: true,
            createdAt: new Date()
        };

        return newMessage;
    }

    /**
     * Get chat messages (PLACEHOLDER)
     * TODO: SELECT FROM session_chat_messages WHERE session_id = sessionId
     */
    async getChatMessages(sessionId: string): Promise<SessionChatMessage[]> {
        console.log(`[STUDY TOGETHER PLACEHOLDER] Fetching chat messages for ${sessionId}...`);
        await new Promise(resolve => setTimeout(resolve, 200));

        return [...MOCK_CHAT_MESSAGES];
    }

    /**
     * Start timer (local simulation)
     * TODO: Replace with Supabase Realtime sync for real-time timer
     */
    private startTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(() => {
            if (!this.currentSession) return;

            if (this.currentSession.timeRemaining > 0) {
                this.currentSession.timeRemaining--;
            } else {
                // Switch between focus and break
                if (this.currentSession.isBreakTime) {
                    // Break ended, start new focus period
                    this.currentSession.isBreakTime = false;
                    this.currentSession.timeRemaining = this.currentSession.focusDuration * 60;
                    this.currentSession.currentCycle++;

                    if (this.currentSession.currentCycle > this.currentSession.totalCycles) {
                        // Session complete
                        this.currentSession.isActive = false;
                        this.stopTimer();
                    }
                } else {
                    // Focus ended, start break
                    this.currentSession.isBreakTime = true;
                    this.currentSession.timeRemaining = this.currentSession.breakDuration * 60;
                }
            }
        }, 1000);
    }

    /**
     * Stop timer
     */
    private stopTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Sync timer with server (PLACEHOLDER)
     * TODO: Use Supabase Realtime to sync timer state across all participants
     */
    async syncTimer(sessionId: string): Promise<StudySession> {
        console.log(`[STUDY TOGETHER PLACEHOLDER] Syncing timer for ${sessionId}...`);
        await new Promise(resolve => setTimeout(resolve, 100));

        // In real implementation, fetch latest timer state from Realtime channel
        return this.currentSession!;
    }

    /**
     * Subscribe to session updates (PLACEHOLDER)
     * TODO: Implement Supabase Realtime channel subscription
     * Example: supabase.channel('study_session:123').on('postgres_changes', ...)
     */
    subscribeToSession(sessionId: string, callback: (session: StudySession) => void): () => void {
        console.log(`[STUDY TOGETHER PLACEHOLDER] Subscribing to session ${sessionId}...`);

        // Mock subscription - in reality, this would be Supabase Realtime
        const interval = setInterval(() => {
            if (this.currentSession) {
                callback(this.currentSession);
            }
        }, 1000);

        // Return unsubscribe function
        return () => clearInterval(interval);
    }

    /**
     * Get available sessions to join (PLACEHOLDER)
     * TODO: SELECT FROM study_sessions WHERE is_active = true
     */
    async getActiveSessions(): Promise<StudySession[]> {
        console.log('[STUDY TOGETHER PLACEHOLDER] Fetching active sessions...');
        await new Promise(resolve => setTimeout(resolve, 300));

        return [{ ...MOCK_SESSION }];
    }

    /**
     * Clean up on unmount
     */
    cleanup(): void {
        this.stopTimer();
        this.currentSession = null;
    }
}

// Singleton instance
export const studyTogetherService = new StudyTogetherService();
