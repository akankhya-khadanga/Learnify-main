import { useState, useEffect } from 'react';
import { discordService, DiscordChannel, DiscordMessage, DiscordUser } from '@/services/discordService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Users, Volume2, VolumeX, Hash, Mic } from 'lucide-react';

export function DiscordStudyRoom() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [channels, setChannels] = useState<DiscordChannel[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [messages, setMessages] = useState<DiscordMessage[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<DiscordUser[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isVoiceConnected, setIsVoiceConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                // Authenticate
                const authenticated = await discordService.authenticate();
                setIsAuthenticated(authenticated);

                if (authenticated) {
                    // Fetch study channels
                    const fetchedChannels = await discordService.getStudyChannels();
                    setChannels(fetchedChannels);

                    if (fetchedChannels.length > 0) {
                        // Select first text channel by default
                        const firstTextChannel = fetchedChannels.find(c => c.type === 'text');
                        if (firstTextChannel) {
                            setSelectedChannel(firstTextChannel.id);
                            await loadChannelData(firstTextChannel.id);
                        }
                    }
                }
            } catch (error) {
                console.error('Error initializing Discord:', error);
            } finally {
                setLoading(false);
            }
        };

        init();

        return () => {
            // Cleanup
            if (isVoiceConnected) {
                discordService.leaveVoiceChannel();
            }
        };
    }, []);

    const loadChannelData = async (channelId: string) => {
        try {
            const [channelMessages, users] = await Promise.all([
                discordService.getChannelMessages(channelId),
                discordService.getOnlineUsers(channelId)
            ]);

            setMessages(channelMessages);
            setOnlineUsers(users);
        } catch (error) {
            console.error('Error loading channel data:', error);
        }
    };

    const handleChannelChange = async (channelId: string) => {
        setSelectedChannel(channelId);
        await loadChannelData(channelId);
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedChannel) return;

        try {
            const newMessage = await discordService.sendMessage(selectedChannel, messageInput);
            setMessages([...messages, newMessage]);
            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleToggleVoice = async () => {
        const channel = channels.find(c => c.id === selectedChannel);
        if (!channel) return;

        try {
            if (isVoiceConnected) {
                await discordService.leaveVoiceChannel();
                setIsVoiceConnected(false);
            } else {
                // Find voice channel in same server
                const voiceChannel = channels.find(
                    c => c.serverId === channel.serverId && c.type === 'voice'
                );
                if (voiceChannel) {
                    await discordService.joinVoiceChannel(voiceChannel.id);
                    setIsVoiceConnected(true);
                }
            }
        } catch (error) {
            console.error('Error toggling voice:', error);
        }
    };

    if (loading) {
        return (
            <Card className="p-4 bg-obsidian border-2 border-blue/20">
                <div className="text-center">
                    <p className="text-text/60">Loading Discord...</p>
                </div>
            </Card>
        );
    }

    if (!isAuthenticated) {
        return (
            <Card className="p-4 bg-obsidian border-2 border-blue/20">
                <div className="text-center space-y-2">
                    <p className="text-sm text-text/60">Discord not connected</p>
                    <p className="text-xs text-text/40">(Placeholder - Add API keys to connect)</p>
                </div>
            </Card>
        );
    }

    const selectedChannelData = channels.find(c => c.id === selectedChannel);

    return (
        <Card className="bg-obsidian border-2 border-blue/20 flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-blue/10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-black uppercase text-blue">Study Room</h3>
                    <div className="text-xs text-text/60 bg-blue/10 px-2 py-1 rounded">
                        Discord
                    </div>
                </div>

                {/* Channel Selector */}
                <div className="flex gap-2">
                    <Select value={selectedChannel} onValueChange={handleChannelChange}>
                        <SelectTrigger className="flex-1 bg-slate-50 dark:bg-slate-900 border-blue/20">
                            <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                            {channels.filter(c => c.type === 'text').map((channel) => (
                                <SelectItem key={channel.id} value={channel.id}>
                                    <div className="flex items-center gap-1">
                                        <Hash className="h-3 w-3" />
                                        {channel.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        variant={isVoiceConnected ? 'default' : 'outline'}
                        className={isVoiceConnected ? 'bg-blue text-black' : 'border-blue/20'}
                        onClick={handleToggleVoice}
                    >
                        {isVoiceConnected ? (
                            <Volume2 className="h-4 w-4" />
                        ) : (
                            <VolumeX className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Online Users */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-blue/10">
                <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-text/60" />
                    <span className="text-xs text-text/60">
                        {onlineUsers.length} online
                    </span>
                    <div className="flex -space-x-2 ml-2">
                        {onlineUsers.slice(0, 5).map((user) => (
                            <img
                                key={user.id}
                                src={user.avatar}
                                alt={user.username}
                                className="h-6 w-6 rounded-full border-2 border-obsidian"
                                title={user.username}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <p className="text-xs text-text/40 text-center py-4">
                            No messages yet. Start the conversation!
                        </p>
                    ) : (
                        messages.map((message) => (
                            <div key={message.id} className="flex gap-2">
                                <img
                                    src={message.author.avatar}
                                    alt={message.author.username}
                                    className="h-8 w-8 rounded-full flex-shrink-0"
                                />
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xs font-bold text-text">
                                            {message.author.username}
                                        </span>
                                        <span className="text-[10px] text-text/40">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text/80 mt-0.5">
                                        {message.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-blue/10">
                <div className="flex gap-2">
                    <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Message the study group..."
                        className="flex-1 bg-slate-50 dark:bg-slate-900 border-blue/20"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="bg-blue hover:bg-blue/80 text-black"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>

                {isVoiceConnected && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-500">
                        <Mic className="h-3 w-3" />
                        Connected to voice • Push-to-talk enabled
                    </div>
                )}

                <p className="text-[10px] text-text/40 text-center mt-2">
                    Study groups only • DMs disabled
                </p>
            </div>
        </Card>
    );
}
