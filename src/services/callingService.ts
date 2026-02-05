/**
 * Calling Service
 * Handles call session management and database operations
 */

import { supabase } from '@/lib/supabase';

export interface CallSession {
    id: string;
    call_type: 'audio' | 'video' | 'group_audio' | 'group_video';
    room_id: string;
    initiator_id: string;
    status: 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
    started_at: string;
    ended_at?: string;
    duration_seconds?: number;
    created_at: string;
    updated_at: string;
}

export interface CallParticipant {
    id: string;
    call_id: string;
    user_id: string;
    status: 'invited' | 'joined' | 'left' | 'rejected';
    is_video_enabled: boolean;
    is_audio_enabled: boolean;
    is_screen_sharing: boolean;
    invited_at: string;
    joined_at?: string;
    left_at?: string;
    connection_quality: 'excellent' | 'good' | 'fair' | 'poor';
    created_at: string;
    updated_at: string;
}

/**
 * Create a new call session
 */
export async function createCallSession(
    callType: CallSession['call_type'],
    participantIds: string[]
): Promise<{ session: CallSession; error: Error | null }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Generate unique room ID
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create call session
        const { data: session, error: sessionError } = await supabase
            .from('call_sessions')
            .insert({
                call_type: callType,
                room_id: roomId,
                initiator_id: user.id,
                status: 'ringing',
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        // Add participants
        const participants = participantIds.map((userId) => ({
            call_id: session.id,
            user_id: userId,
            status: 'invited',
            is_video_enabled: callType.includes('video'),
            is_audio_enabled: true,
        }));

        const { error: participantsError } = await supabase
            .from('call_participants')
            .insert(participants);

        if (participantsError) throw participantsError;

        return { session, error: null };
    } catch (error: any) {
        console.error('Error creating call session:', error);
        return { session: null as any, error };
    }
}

/**
 * Get call session by ID
 */
export async function getCallSession(callId: string): Promise<{ session: CallSession | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('call_sessions')
            .select('*')
            .eq('id', callId)
            .single();

        if (error) throw error;
        return { session: data, error: null };
    } catch (error: any) {
        console.error('Error fetching call session:', error);
        return { session: null, error };
    }
}

/**
 * Get call session by room ID
 */
export async function getCallSessionByRoomId(roomId: string): Promise<{ session: CallSession | null; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('call_sessions')
            .select('*')
            .eq('room_id', roomId)
            .single();

        if (error) throw error;
        return { session: data, error: null };
    } catch (error: any) {
        console.error('Error fetching call session:', error);
        return { session: null, error };
    }
}

/**
 * Update call session status
 */
export async function updateCallStatus(
    callId: string,
    status: CallSession['status']
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('call_sessions')
            .update({ status })
            .eq('id', callId);

        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error('Error updating call status:', error);
        return { error };
    }
}

/**
 * End call session
 */
export async function endCallSession(callId: string): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('call_sessions')
            .update({ status: 'ended' })
            .eq('id', callId);

        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error('Error ending call:', error);
        return { error };
    }
}

/**
 * Get call participants
 */
export async function getCallParticipants(callId: string): Promise<{ participants: CallParticipant[]; error: Error | null }> {
    try {
        const { data, error } = await supabase
            .from('call_participants')
            .select('*')
            .eq('call_id', callId);

        if (error) throw error;
        return { participants: data || [], error: null };
    } catch (error: any) {
        console.error('Error fetching participants:', error);
        return { participants: [], error };
    }
}

/**
 * Update participant status
 */
export async function updateParticipantStatus(
    callId: string,
    userId: string,
    status: CallParticipant['status']
): Promise<{ error: Error | null }> {
    try {
        const updateData: any = { status };

        if (status === 'joined') {
            updateData.joined_at = new Date().toISOString();
        } else if (status === 'left') {
            updateData.left_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('call_participants')
            .update(updateData)
            .eq('call_id', callId)
            .eq('user_id', userId);

        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error('Error updating participant status:', error);
        return { error };
    }
}

/**
 * Update participant media settings
 */
export async function updateParticipantMedia(
    callId: string,
    userId: string,
    settings: {
        is_video_enabled?: boolean;
        is_audio_enabled?: boolean;
        is_screen_sharing?: boolean;
    }
): Promise<{ error: Error | null }> {
    try {
        const { error } = await supabase
            .from('call_participants')
            .update(settings)
            .eq('call_id', callId)
            .eq('user_id', userId);

        if (error) throw error;
        return { error: null };
    } catch (error: any) {
        console.error('Error updating participant media:', error);
        return { error };
    }
}

/**
 * Get user's call history
 */
export async function getUserCallHistory(limit: number = 20): Promise<{ calls: CallSession[]; error: Error | null }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('call_sessions')
            .select(`
        *,
        call_participants!inner(user_id)
      `)
            .or(`initiator_id.eq.${user.id},call_participants.user_id.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return { calls: data || [], error: null };
    } catch (error: any) {
        console.error('Error fetching call history:', error);
        return { calls: [], error };
    }
}

/**
 * Subscribe to call session changes
 */
export function subscribeToCallSession(
    callId: string,
    callback: (payload: any) => void
) {
    const channel = supabase
        .channel(`call_session_${callId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'call_sessions',
                filter: `id=eq.${callId}`,
            },
            callback
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

/**
 * Subscribe to call participants changes
 */
export function subscribeToCallParticipants(
    callId: string,
    callback: (payload: any) => void
) {
    const channel = supabase
        .channel(`call_participants_${callId}`)
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'call_participants',
                filter: `call_id=eq.${callId}`,
            },
            callback
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}
