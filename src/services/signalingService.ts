/**
 * WebRTC Signaling Service
 * Handles peer-to-peer connection signaling using Supabase Realtime
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SignalingMessage {
    type: 'offer' | 'answer' | 'ice-candidate';
    from: string;
    to: string;
    data: any;
    roomId: string;
}

class SignalingService {
    private channels: Map<string, RealtimeChannel> = new Map();

    /**
     * Join a signaling channel for a specific call room
     */
    async joinRoom(
        roomId: string,
        userId: string,
        onMessage: (message: SignalingMessage) => void
    ): Promise<void> {
        // Remove existing channel if present
        if (this.channels.has(roomId)) {
            await this.leaveRoom(roomId);
        }

        // Create a new channel for this room
        const channel = supabase.channel(`call:${roomId}`, {
            config: {
                broadcast: { self: true },
            },
        });

        // Listen for signaling messages
        channel.on('broadcast', { event: 'signaling' }, (payload) => {
            const message = payload.payload as SignalingMessage;

            // Only process messages intended for this user
            if (message.to === userId || message.to === 'all') {
                onMessage(message);
            }
        });

        // Subscribe to the channel
        await channel.subscribe();

        // Store the channel
        this.channels.set(roomId, channel);
    }

    /**
     * Send a signaling message to a peer
     */
    async sendMessage(message: SignalingMessage): Promise<void> {
        const channel = this.channels.get(message.roomId);

        if (!channel) {
            console.error('No channel found for room:', message.roomId);
            return;
        }

        await channel.send({
            type: 'broadcast',
            event: 'signaling',
            payload: message,
        });
    }

    /**
     * Send WebRTC offer
     */
    async sendOffer(
        roomId: string,
        from: string,
        to: string,
        offer: RTCSessionDescriptionInit
    ): Promise<void> {
        await this.sendMessage({
            type: 'offer',
            from,
            to,
            data: offer,
            roomId,
        });
    }

    /**
     * Send WebRTC answer
     */
    async sendAnswer(
        roomId: string,
        from: string,
        to: string,
        answer: RTCSessionDescriptionInit
    ): Promise<void> {
        await this.sendMessage({
            type: 'answer',
            from,
            to,
            data: answer,
            roomId,
        });
    }

    /**
     * Send ICE candidate
     */
    async sendIceCandidate(
        roomId: string,
        from: string,
        to: string,
        candidate: RTCIceCandidateInit
    ): Promise<void> {
        await this.sendMessage({
            type: 'ice-candidate',
            from,
            to,
            data: candidate,
            roomId,
        });
    }

    /**
     * Leave a signaling room
     */
    async leaveRoom(roomId: string): Promise<void> {
        const channel = this.channels.get(roomId);

        if (channel) {
            await supabase.removeChannel(channel);
            this.channels.delete(roomId);
        }
    }

    /**
     * Clean up all channels
     */
    async cleanup(): Promise<void> {
        for (const [roomId] of this.channels) {
            await this.leaveRoom(roomId);
        }
    }
}

export const signalingService = new SignalingService();
