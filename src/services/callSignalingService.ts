/**
 * Call Signaling Service
 * Handles real-time WebRTC signaling via Supabase Realtime
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { createCallSession, updateCallStatus, updateParticipantStatus } from './callingService';

export interface SignalingMessage {
    type: 'call-offer' | 'call-answer' | 'ice-candidate' | 'call-ended' | 'call-declined';
    callId: string;
    from: string;
    to?: string;
    data?: any;
}

export interface CallOffer {
    callId: string;
    callType: 'audio' | 'video' | 'group_audio' | 'group_video';
    offer: RTCSessionDescriptionInit;
    caller: {
        id: string;
        name: string;
    };
}

export interface CallAnswer {
    callId: string;
    answer: RTCSessionDescriptionInit;
}

export class CallSignalingService {
    private channels: Map<string, RealtimeChannel> = new Map();
    private messageHandlers: Map<string, (message: SignalingMessage) => void> = new Map();

    /**
     * Initialize personal signaling channel for receiving calls
     */
    async initializePersonalChannel(
        onIncomingCall: (offer: CallOffer) => void,
        onCallAnswer: (answer: CallAnswer) => void,
        onIceCandidate: (candidate: RTCIceCandidateInit) => void,
        onCallEnded: (callId: string) => void,
        onCallDeclined: (callId: string) => void
    ): Promise<RealtimeChannel> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const channelName = `call-signals:${user.id}`;

        // Remove existing channel if any
        if (this.channels.has(channelName)) {
            await supabase.removeChannel(this.channels.get(channelName)!);
        }

        const channel = supabase
            .channel(channelName)
            .on('broadcast', { event: 'call-signal' }, ({ payload }) => {
                const message = payload as SignalingMessage;

                console.log('[CallSignaling] Received message:', message.type, message);

                switch (message.type) {
                    case 'call-offer':
                        onIncomingCall(message.data as CallOffer);
                        break;
                    case 'call-answer':
                        onCallAnswer(message.data as CallAnswer);
                        break;
                    case 'ice-candidate':
                        onIceCandidate(message.data);
                        break;
                    case 'call-ended':
                        onCallEnded(message.callId);
                        break;
                    case 'call-declined':
                        onCallDeclined(message.callId);
                        break;
                }
            })
            .subscribe((status) => {
                console.log('[CallSignaling] Channel status:', status);
            });

        this.channels.set(channelName, channel);
        return channel;
    }

    /**
     * Initiate a call by creating session and sending offer
     */
    async initiateCall(
        recipientId: string,
        callType: 'audio' | 'video',
        offer: RTCSessionDescriptionInit
    ): Promise<{ callId: string; error: Error | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Get caller info
            const { data: callerProfile } = await supabase
                .from('user_profiles')
                .select('display_name, username')
                .eq('id', user.id)
                .single();

            // Create call session in database
            const { session, error: sessionError } = await createCallSession(callType, [recipientId]);
            if (sessionError || !session) {
                throw sessionError || new Error('Failed to create call session');
            }

            // Send call offer via Realtime
            const callOffer: CallOffer = {
                callId: session.id,
                callType: callType,
                offer: offer,
                caller: {
                    id: user.id,
                    name: callerProfile?.display_name || callerProfile?.username || 'Unknown'
                }
            };

            await this.sendSignal(recipientId, {
                type: 'call-offer',
                callId: session.id,
                from: user.id,
                to: recipientId,
                data: callOffer
            });

            console.log('[CallSignaling] Call offer sent:', session.id);

            return { callId: session.id, error: null };
        } catch (error: any) {
            console.error('[CallSignaling] Error initiating call:', error);
            return { callId: '', error };
        }
    }

    /**
     * Answer an incoming call
     */
    async answerCall(
        callId: string,
        callerId: string,
        answer: RTCSessionDescriptionInit
    ): Promise<{ error: Error | null }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Update participant status
            await updateParticipantStatus(callId, user.id, 'joined');

            // Update call status
            await updateCallStatus(callId, 'active');

            // Send answer via Realtime
            const callAnswer: CallAnswer = {
                callId,
                answer
            };

            await this.sendSignal(callerId, {
                type: 'call-answer',
                callId,
                from: user.id,
                to: callerId,
                data: callAnswer
            });

            console.log('[CallSignaling] Call answer sent:', callId);

            return { error: null };
        } catch (error: any) {
            console.error('[CallSignaling] Error answering call:', error);
            return { error };
        }
    }

    /**
     * Send ICE candidate to peer
     */
    async sendIceCandidate(
        recipientId: string,
        callId: string,
        candidate: RTCIceCandidateInit
    ): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await this.sendSignal(recipientId, {
            type: 'ice-candidate',
            callId,
            from: user.id,
            to: recipientId,
            data: candidate
        });
    }

    /**
     * Decline an incoming call
     */
    async declineCall(callId: string, callerId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await updateCallStatus(callId, 'declined');
        await updateParticipantStatus(callId, user.id, 'rejected');

        await this.sendSignal(callerId, {
            type: 'call-declined',
            callId,
            from: user.id,
            to: callerId,
        });
    }

    /**
     * End a call
     */
    async endCall(callId: string, recipientId?: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await updateCallStatus(callId, 'ended');

        if (recipientId) {
            await this.sendSignal(recipientId, {
                type: 'call-ended',
                callId,
                from: user.id,
                to: recipientId,
            });
        }
    }

    /**
     * Send a signaling message to a specific user
     */
    public async sendSignal(recipientId: string, message: SignalingMessage): Promise<void> {
        const channelName = `call-signals:${recipientId}`;

        // Create or reuse channel
        let channel = this.channels.get(channelName);

        if (!channel) {
            channel = supabase.channel(channelName);

            // CRITICAL: Must subscribe before we can broadcast
            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Channel subscription timeout'));
                }, 5000);

                channel!.subscribe((status) => {
                    console.log('[CallSignaling] Send channel status:', status, 'for', recipientId);

                    if (status === 'SUBSCRIBED') {
                        clearTimeout(timeout);
                        resolve();
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                        clearTimeout(timeout);
                        reject(new Error(`Channel subscription failed: ${status}`));
                    }
                });
            });

            // Store for reuse
            this.channels.set(channelName, channel);
        }

        // Now send the message
        await channel.send({
            type: 'broadcast',
            event: 'call-signal',
            payload: message
        });

        console.log('[CallSignaling] Signal sent to', recipientId, ':', message.type);
    }

    /**
     * Cleanup all channels
     */
    async cleanup(): Promise<void> {
        for (const [name, channel] of this.channels.entries()) {
            await supabase.removeChannel(channel);
            this.channels.delete(name);
        }
    }
}

// Singleton instance
export const callSignalingService = new CallSignalingService();
