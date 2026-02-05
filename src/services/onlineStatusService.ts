/**
 * Online Status Service
 * Tracks user online/offline status in real-time
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

class OnlineStatusService {
    private presenceChannel: RealtimeChannel | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    /**
     * Start tracking user's online status
     */
    async startTracking() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create presence channel
        this.presenceChannel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        // Subscribe and track presence
        this.presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = this.presenceChannel?.presenceState();
                console.log('Online users:', state);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track this user as online
                    await this.presenceChannel?.track({
                        user_id: user.id,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        // Update user status in database
        await supabase
            .from('user_profiles')
            .update({ status: 'online' })
            .eq('id', user.id);

        // Heartbeat to keep status fresh
        this.heartbeatInterval = setInterval(async () => {
            await supabase
                .from('user_profiles')
                .update({ last_seen: new Date().toISOString() })
                .eq('id', user.id);
        }, 60000); // Every minute

        // Handle page unload
        window.addEventListener('beforeunload', () => this.stopTracking());
    }

    /**
     * Stop tracking (user going offline)
     */
    async stopTracking() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Update status to offline
        await supabase
            .from('user_profiles')
            .update({
                status: 'offline',
                last_seen: new Date().toISOString(),
            })
            .eq('id', user.id);

        // Untrack from presence
        await this.presenceChannel?.untrack();

        if (this.presenceChannel) {
            await supabase.removeChannel(this.presenceChannel);
        }
    }

    /**
     * Get online users
     */
    getOnlineUsers(): string[] {
        if (!this.presenceChannel) return [];

        const state = this.presenceChannel.presenceState();
        return Object.keys(state);
    }
}

export const onlineStatusService = new OnlineStatusService();
