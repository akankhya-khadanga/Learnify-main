import { useState, useEffect } from 'react';
import { studyTogetherService, StudySession, SessionParticipant, SessionChatMessage } from '@/services/studyTogetherService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Timer, Users, MessageCircle, Play, Pause, LogOut } from 'lucide-react';

export function StudyTogetherRoom() {
    const [session, setSession] = useState<StudySession | null>(null);
    const [participants, setParticipants] = useState<SessionParticipant[]>([]);
    const [messages, setMessages] = useState<SessionChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        // Auto-join mock session for demo
        const joinSession = async () => {
            const joinedSession = await studyTogetherService.joinSession('session_1');
            setSession(joinedSession);

            // Fetch participants
            const fetchedParticipants = await studyTogetherService.getParticipants(joinedSession.id);
            setParticipants(fetchedParticipants);

            // Fetch messages
            const fetchedMessages = await studyTogetherService.getChatMessages(joinedSession.id);
            setMessages(fetchedMessages);
        };

        joinSession();

        // Subscribe to session updates (mock)
        const unsubscribe = studyTogetherService.subscribeToSession('session_1', (updatedSession) => {
            setSession(updatedSession);
        });

        return () => {
            unsubscribe();
            studyTogetherService.cleanup();
        };
    }, []);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !session) return;

        try {
            const newMessage = await studyTogetherService.sendMessage(session.id, messageInput);
            setMessages([...messages, newMessage]);
            setMessageInput('');
        } catch (error: any) {
            alert(error.message || 'Cannot send message during focus time');
        }
    };

    const handleLeave = async () => {
        await studyTogetherService.leaveSession();
        // Navigate back or show session list
        window.history.back();
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <Card className="p-6 bg-obsidian border-2 border-gold/20">
                    <p className="text-text/60">Loading session...</p>
                </Card>
            </div>
        );
    }

    const timeRemainingMinutes = Math.floor(session.timeRemaining / 60);
    const timeRemainingSeconds = session.timeRemaining % 60;
    const totalTime = session.isBreakTime
        ? session.breakDuration * 60
        : session.focusDuration * 60;
    const progressPercentage = ((totalTime - session.timeRemaining) / totalTime) * 100;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
            <div className="max-w-5xl mx-auto space-y-4">
                {/* Header */}
                <Card className="bg-obsidian border-2 border-gold/20 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black text-gold">{session.sessionName}</h1>
                            <p className="text-sm text-text/60">
                                Cycle {session.currentCycle} of {session.totalCycles}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={handleLeave}
                            className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Leave
                        </Button>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Timer Section */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Timer Card */}
                        <Card className="bg-obsidian border-2 border-gold/20 p-6">
                            <div className="text-center space-y-4">
                                {/* Status Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10">
                                    {session.isBreakTime ? (
                                        <>
                                            <MessageCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm font-bold text-green-500">
                                                BREAK TIME - Chat Enabled
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Timer className="h-4 w-4 text-gold" />
                                            <span className="text-sm font-bold text-gold">
                                                FOCUS MODE - Silent
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Timer Display */}
                                <div className="text-7xl font-black text-text">
                                    {String(timeRemainingMinutes).padStart(2, '0')}:
                                    {String(timeRemainingSeconds).padStart(2, '0')}
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <Progress
                                        value={progressPercentage}
                                        className="h-2"
                                    />
                                    <p className="text-xs text-text/60">
                                        {session.isBreakTime ? 'Break' : 'Focus'} time remaining
                                    </p>
                                </div>

                                {/* Session Info */}
                                <div className="grid grid-cols-2 gap-4 mt-6 text-xs">
                                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                                        <p className="text-text/60">Focus Duration</p>
                                        <p className="font-bold text-text">{session.focusDuration} min</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded">
                                        <p className="text-text/60">Break Duration</p>
                                        <p className="font-bold text-text">{session.breakDuration} min</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Chat Card */}
                        <Card className="bg-obsidian border-2 border-gold/20 flex flex-col h-[400px]">
                            <div className="p-4 border-b border-gold/10">
                                <h3 className="text-sm font-black uppercase text-gold flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Break Chat
                                    {!session.isBreakTime && (
                                        <span className="text-xs text-text/40 font-normal ml-2">
                                            (Available during breaks)
                                        </span>
                                    )}
                                </h3>
                            </div>

                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-3">
                                    {messages.length === 0 ? (
                                        <p className="text-xs text-text/40 text-center py-4">
                                            Chat during breaks to encourage each other!
                                        </p>
                                    ) : (
                                        messages.map((message) => (
                                            <div key={message.id} className="flex gap-2">
                                                <img
                                                    src={message.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.userName}`}
                                                    alt={message.userName}
                                                    className="h-8 w-8 rounded-full flex-shrink-0"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-xs font-bold text-text">
                                                            {message.userName}
                                                        </span>
                                                        <span className="text-[10px] text-text/40">
                                                            {new Date(message.createdAt).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-text/80 mt-0.5">
                                                        {message.message}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>

                            <div className="p-4 border-t border-gold/10">
                                <div className="flex gap-2">
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder={session.isBreakTime ? "Send a message..." : "Chat available during breaks..."}
                                        disabled={!session.isBreakTime}
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border-gold/20"
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim() || !session.isBreakTime}
                                        className="bg-gold hover:bg-gold/80 text-black"
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Participants Sidebar */}
                    <div>
                        <Card className="bg-obsidian border-2 border-gold/20 p-4">
                            <h3 className="text-sm font-black uppercase text-gold flex items-center gap-2 mb-4">
                                <Users className="h-4 w-4" />
                                Participants ({participants.length})
                            </h3>

                            <div className="space-y-2">
                                {participants.map((participant) => (
                                    <div
                                        key={participant.userId}
                                        className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded"
                                    >
                                        <img
                                            src={participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`}
                                            alt={participant.name}
                                            className="h-8 w-8 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs font-bold text-text">{participant.name}</p>
                                            <p className="text-[10px] text-text/40">
                                                Joined {new Date(participant.joinedAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Info */}
                            <div className="mt-4 pt-4 border-t border-gold/10">
                                <p className="text-[10px] text-text/40">
                                    🔕 Silent during focus • 💬 Chat during breaks
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Placeholder Notice */}
                <Card className="bg-obsidian/50 border border-gold/10 p-3">
                    <p className="text-xs text-text/40 text-center">
                        Mock session • Real-time sync requires Supabase Realtime configuration
                    </p>
                </Card>
            </div>
        </div>
    );
}
