import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Send,
    Paperclip,
    Smile,
    MoreVertical,
    X,
    Info,
    Phone,
    Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { StudyGroup } from '@/services/studyGroupsService';
import type { GroupMessage } from '@/services/studyGroupsService';
import { messagingService } from '@/services/messagingService';
import MessageBubble from '@/components/studyGroups/MessageBubble';
import { useToast } from '@/hooks/use-toast';
import { createCallSession, type CallSession } from '@/services/callingService';
import { CallInterface } from '@/components/calling/CallInterface';

interface GroupChatProps {
    group: StudyGroup;
    onClose: () => void;
}

export default function GroupChat({ group, onClose }: GroupChatProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [activeCall, setActiveCall] = useState<CallSession | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load messages
    useEffect(() => {
        loadMessages();

        // Subscribe to real-time messages
        const unsubscribe = messagingService.subscribeToMessages(
            group.id,
            (message) => {
                setMessages(prev => {
                    // Check if message already exists
                    if (prev.some(m => m.id === message.id)) {
                        // Update existing message
                        return prev.map(m => m.id === message.id ? message : m);
                    }
                    // Add new message
                    return [...prev, message];
                });
                scrollToBottom();
            }
        );

        // Mark messages as read
        messagingService.markAsRead(group.id);

        return () => {
            unsubscribe();
        };
    }, [group.id]);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const data = await messagingService.getMessages(group.id, { limit: 50 });
            setMessages(data);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load messages',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || isSending) return;

        try {
            setIsSending(true);
            await messagingService.sendMessage(group.id, newMessage.trim());
            setNewMessage('');
            inputRef.current?.focus();
        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: 'Error',
                description: 'Failed to send message',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };


    const handleStartGroupCall = async (callType: 'group_audio' | 'group_video') => {
        try {
            // For now, create call session without specific participants
            // In production, you would fetch group members from the database
            const { session, error } = await createCallSession(callType, []);
            if (error) throw error;

            setActiveCall(session);
            toast({
                title: `Group ${callType === 'group_video' ? 'Video' : 'Audio'} Call Started`,
                description: 'Connecting participants...',
            });
        } catch (error: any) {
            console.error('Error starting group call:', error);
            toast({
                title: 'Call Failed',
                description: error.message || 'Failed to start group call',
                variant: 'destructive',
            });
        }
    };

    const handleEndCall = () => {
        setActiveCall(null);
    };

    return (
        <div className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon to-purple flex items-center justify-center">
                            <span className="text-white font-bold text-lg">#</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white">
                                {group.max_members === 2 ? `Direct Message with ${group.name}` : group.name}
                            </h2>
                            {group.subject && group.max_members !== 2 && (
                                <p className="text-xs text-gray-400">{group.subject}</p>
                            )}
                            {group.max_members === 2 && (
                                <p className="text-xs text-pink">Private Conversation</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartGroupCall('group_audio')}
                            className="text-white hover:bg-white/10"
                            title="Start Audio Call"
                        >
                            <Phone className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartGroupCall('group_video')}
                            className="text-white hover:bg-white/10"
                            title="Start Video Call"
                        >
                            <Video className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10"
                        >
                            <Info className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/10"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-white hover:bg-white/10 lg:hidden"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-400">Loading messages...</div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Send className="w-8 h-8 text-gray-600" />
                        </div>
                        <p className="text-gray-400 mb-2">No messages yet</p>
                        <p className="text-sm text-gray-500">Be the first to send a message!</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            isConsecutive={
                                index > 0 &&
                                messages[index - 1].sender_id === message.sender_id &&
                                new Date(message.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() < 60000
                            }
                        />
                    ))
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                <div className="flex items-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>

                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 pr-10"
                            disabled={isSending}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white hover:bg-white/10"
                        >
                            <Smile className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || isSending}
                        className="bg-neon hover:bg-neon/90 text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Active Call Interface */}
            {activeCall && (
                <CallInterface
                    callSession={activeCall}
                    participants={[]}
                    onEndCall={handleEndCall}
                />
            )}
        </div>
    );
}
