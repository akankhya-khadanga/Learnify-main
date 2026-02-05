/**
 * Notification Center Component
 * Displays in-app notifications in a dropdown panel
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, MessageCircle, UserPlus, Phone, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { type Notification } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'message':
                return <MessageCircle className="w-5 h-5 text-primary" />;
            case 'friend_request':
                return <UserPlus className="w-5 h-5 text-accent" />;
            case 'call':
                return <Phone className="w-5 h-5 text-green-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-white hover:bg-white/10"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-primary text-black text-xs font-black rounded-full w-5 h-5 flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </Button>

            {/* Notification Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-12 w-96 bg-gradient-to-br from-gray-900 to-black border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-black/50">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-white">Notifications</h3>
                                    {notifications.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={markAllAsRead}
                                            className="text-xs text-primary hover:bg-white/10"
                                        >
                                            <Check className="w-3 h-3 mr-1" />
                                            Mark all read
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Notifications List */}
                            <ScrollArea className="h-96">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                        <Bell className="w-12 h-12 text-gray-600 mb-3" />
                                        <p className="text-gray-400">No notifications yet</p>
                                        <p className="text-sm text-gray-500 mt-1">We'll notify you when something happens</p>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className={`p-3 rounded-lg mb-2 transition-colors cursor-pointer ${notification.read
                                                        ? 'bg-white/5 hover:bg-white/10'
                                                        : 'bg-primary/10 border border-neon/30 hover:bg-primary/20'
                                                    }`}
                                                onClick={() => !notification.read && markAsRead(notification.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {getIcon(notification.type)}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="font-bold text-white text-sm">
                                                                {notification.title}
                                                            </h4>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    clearNotification(notification.id);
                                                                }}
                                                                className="text-gray-400 hover:text-white transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                                                            {notification.message}
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
