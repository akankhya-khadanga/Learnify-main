import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Reply, Smile, MoreVertical } from 'lucide-react';
import type { GroupMessage } from '@/services/studyGroupsService';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

interface MessageBubbleProps {
    message: GroupMessage;
    isConsecutive?: boolean;
}

export default function MessageBubble({ message, isConsecutive = false }: MessageBubbleProps) {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setCurrentUserId(data.user?.id || null);
        });
    }, []);

    const isOwnMessage = message.sender_id === currentUserId;
    const showAvatar = !isConsecutive;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${isConsecutive ? 'mt-1' : 'mt-4'
                }`}
        >
            {/* Avatar */}
            {showAvatar ? (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${isOwnMessage ? 'from-neon to-purple' : 'from-purple to-neon'
                    } flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">
                        {message.sender?.display_name?.[0] || message.sender?.username?.[0] || '?'}
                    </span>
                </div>
            ) : (
                <div className="w-8 flex-shrink-0" />
            )}

            {/* Message Content */}
            <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender Name & Time */}
                {showAvatar && !isOwnMessage && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-semibold text-white">
                            {message.sender?.display_name || message.sender?.username || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                    </div>
                )}

                {/* Message Bubble */}
                <div
                    className={`group relative rounded-2xl px-4 py-2 ${isOwnMessage
                        ? 'bg-neon text-black rounded-tr-sm'
                        : 'bg-white/10 text-white rounded-tl-sm'
                        }`}
                >
                    {/* Reply indicator */}
                    {message.reply_to && message.reply_message && (
                        <div className="mb-2 pb-2 border-b border-current/20">
                            <div className="flex items-center gap-1 text-xs opacity-70">
                                <Reply className="w-3 h-3" />
                                <span className="font-semibold">
                                    {message.reply_message.sender?.display_name || 'Someone'}
                                </span>
                            </div>
                            <p className="text-xs opacity-70 truncate mt-0.5">
                                {message.reply_message.content}
                            </p>
                        </div>
                    )}

                    {/* Message Text */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                    </p>

                    {/* Edited indicator */}
                    {message.edited && (
                        <span className="text-xs opacity-50 ml-2">(edited)</span>
                    )}

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {Object.entries(
                                message.reactions.reduce((acc, r) => {
                                    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>)
                            ).map(([emoji, count]) => (
                                <div
                                    key={emoji}
                                    className="px-2 py-0.5 rounded-full bg-black/20 text-xs flex items-center gap-1"
                                >
                                    <span>{emoji}</span>
                                    <span className="font-semibold">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hover Actions */}
                    <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 px-2`}>
                        <button className="p-1 rounded hover:bg-white/10 transition-colors">
                            <Smile className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 rounded hover:bg-white/10 transition-colors">
                            <Reply className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="p-1 rounded hover:bg-white/10 transition-colors">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Time for own messages */}
                {showAvatar && isOwnMessage && (
                    <span className="text-xs text-gray-500 mt-1 px-1">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                )}
            </div>
        </motion.div>
    );
}
