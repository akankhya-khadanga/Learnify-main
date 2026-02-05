/**
 * useNotifications Hook
 * Manages in-app notifications and unread counts
 */

import { useState, useEffect } from 'react';
import { notificationService, type Notification } from '@/services/notificationService';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let cleanup: (() => void) | undefined;

        // Subscribe to notifications
        const setupSubscription = async () => {
            console.log('🔔 Setting up notification subscription...');
            cleanup = await notificationService.subscribe((notification) => {
                console.log('🔔 Received notification in hook:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Play notification sound
                notificationService.playNotificationSound();
            });
            console.log('🔔 Notification subscription setup complete');
        };

        setupSubscription();

        return () => {
            console.log('🔔 Cleaning up notification subscription');
            cleanup?.();
        };
    }, []);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearNotification = (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => {
            const notification = notifications.find(n => n.id === notificationId);
            return notification && !notification.read ? Math.max(0, prev - 1) : prev;
        });
    };

    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
    };
}
