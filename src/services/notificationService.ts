/**
 * Notification Service
 * Handles in-app notifications, web push, and notification management
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
    id: string;
    user_id: string;
    type: 'message' | 'friend_request' | 'call' | 'system';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    created_at: string;
}

class NotificationService {
    private channel: RealtimeChannel | null = null;
    private listeners: Set<(notification: Notification) => void> = new Set();

    /**
     * Request browser notification permission
     */
    async requestPermission(): Promise<NotificationPermission> {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications');
            return 'denied';
        }

        if (Notification.permission === 'granted') {
            return 'granted';
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission;
        }

        return Notification.permission;
    }

    /**
     * Show browser notification
     */
    async showBrowserNotification(title: string, options?: NotificationOptions) {
        const permission = await this.requestPermission();

        if (permission === 'granted') {
            const notification = new Notification(title, {
                icon: '/logo.png',
                badge: '/badge.png',
                ...options,
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        }
    }

    /**
     * Subscribe to real-time notifications
     */
    async subscribe(callback: (notification: Notification) => void) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        this.listeners.add(callback);

        // Subscribe to new messages
        const messagesChannel = supabase
            .channel('new-messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                async (payload) => {
                    const message = payload.new;
                    console.log('📨 New message received:', message);

                    // Don't notify for own messages
                    if (message.sender_id === user.id) {
                        console.log('📨 Skipping own message');
                        return;
                    }

                    // Check if message is for user
                    const { data: membership } = await supabase
                        .from('group_members')
                        .select('group_id')
                        .eq('user_id', user.id)
                        .eq('group_id', message.group_id)
                        .single();

                    if (membership) {
                        console.log('📨 User is member, creating notification');
                        // Get sender info
                        const { data: sender } = await supabase
                            .from('user_profiles')
                            .select('display_name, username')
                            .eq('id', message.sender_id)
                            .single();

                        const notification: Notification = {
                            id: message.id,
                            user_id: user.id,
                            type: 'message',
                            title: sender?.display_name || sender?.username || 'New Message',
                            message: message.content.substring(0, 100),
                            data: { message_id: message.id, group_id: message.group_id },
                            read: false,
                            created_at: message.created_at,
                        };

                        console.log('📨 Showing notification:', notification);

                        // Show browser notification
                        this.showBrowserNotification(notification.title, {
                            body: notification.message,
                            tag: message.id,
                        });

                        // Trigger in-app callbacks
                        this.listeners.forEach(listener => listener(notification));
                    } else {
                        console.log('📨 User not member of this group');
                    }
                }
            )
            .subscribe();

        // Subscribe to friend requests
        const friendRequestsChannel = supabase
            .channel('friend-requests')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'friendships',
                    filter: `friend_id=eq.${user.id}`,
                },
                async (payload) => {
                    const friendship = payload.new;

                    const { data: requester } = await supabase
                        .from('user_profiles')
                        .select('display_name, username')
                        .eq('id', friendship.user_id)
                        .single();

                    const notification: Notification = {
                        id: friendship.id,
                        user_id: user.id,
                        type: 'friend_request',
                        title: 'New Friend Request',
                        message: `${requester?.display_name || requester?.username} wants to be friends`,
                        data: { friendship_id: friendship.id },
                        read: false,
                        created_at: friendship.created_at,
                    };

                    this.showBrowserNotification(notification.title, {
                        body: notification.message,
                        tag: friendship.id,
                    });

                    this.listeners.forEach(listener => listener(notification));
                }
            )
            .subscribe();

        return () => {
            this.listeners.delete(callback);
            if (this.listeners.size === 0) {
                supabase.removeChannel(messagesChannel);
                supabase.removeChannel(friendRequestsChannel);
            }
        };
    }

    /**
     * Play notification sound
     */
    playNotificationSound() {
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log('Could not play sound:', err));
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }
}

export const notificationService = new NotificationService();
