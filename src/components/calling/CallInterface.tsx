import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Phone,
    PhoneOff,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Monitor,
    MonitorOff,
    Settings,
    Users,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import { webrtcService } from '@/services/webrtcService';
import {
    updateParticipantStatus,
    updateParticipantMedia,
    endCallSession,
    type CallSession,
    type CallParticipant,
} from '@/services/callingService';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CallInterfaceProps {
    callSession: CallSession;
    participants: CallParticipant[];
    onEndCall: () => void;
}

export function CallInterface({ callSession, participants, onEndCall }: CallInterfaceProps) {
    const { toast } = useToast();
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(callSession.call_type.includes('video'));
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const callTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        attachMediaStreams();
        startCallTimer();

        return () => {
            cleanup();
        };
    }, []);

    const attachMediaStreams = () => {
        try {
            // Get existing local stream from webrtcService
            const localStream = webrtcService.getLocalStreamInstance();
            if (localStream && localVideoRef.current) {
                localVideoRef.current.srcObject = localStream;
                console.log('[CallInterface] Local stream attached');
            }

            // Get existing remote stream from webrtcService
            const remoteStream = webrtcService.getRemoteStreamInstance();
            if (remoteStream && remoteVideoRef.current) {
                console.log('[CallInterface] Attaching remote stream:', {
                    audioTracks: remoteStream.getAudioTracks().length,
                    videoTracks: remoteStream.getVideoTracks().length
                });

                remoteVideoRef.current.srcObject = remoteStream;

                // CRITICAL: Ensure audio is unmuted and volume is set
                remoteVideoRef.current.muted = false;
                remoteVideoRef.current.volume = 1.0;

                // CRITICAL: Auto-play remote audio for calls to work
                remoteVideoRef.current.play().then(() => {
                    console.log('[CallInterface] ✅ Remote stream playing successfully');
                }).catch(err => {
                    console.error('[CallInterface] ❌ Error playing remote stream:', err);
                });
            }

            // Also listen for future remote stream
            // (in case it arrives after component mounts)
            const checkRemoteStream = setInterval(() => {
                const stream = webrtcService.getRemoteStreamInstance();
                if (stream && remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
                    console.log('[CallInterface] Remote stream arrived late, attaching now');
                    remoteVideoRef.current.srcObject = stream;

                    // Ensure audio is unmuted
                    remoteVideoRef.current.muted = false;
                    remoteVideoRef.current.volume = 1.0;

                    // Auto-play the remote stream
                    remoteVideoRef.current.play().then(() => {
                        console.log('[CallInterface] ✅ Late remote stream playing');
                    }).catch(err => {
                        console.error('[CallInterface] ❌ Error playing late remote stream:', err)
                    });
                    clearInterval(checkRemoteStream);
                }
            }, 500);

            // Cleanup interval after 30 seconds
            setTimeout(() => clearInterval(checkRemoteStream), 30000);
        } catch (error: any) {
            console.error('Error attaching media streams:', error);
            toast({
                title: 'Connection Error',
                description: error.message || 'Failed to display media',
                variant: 'destructive',
            });
        }
    };

    const startCallTimer = () => {
        callTimerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
    };

    const cleanup = () => {
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
        }
        webrtcService.cleanup();
    };

    const handleToggleAudio = async () => {
        const newState = webrtcService.toggleAudio();
        setIsAudioEnabled(newState);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await updateParticipantMedia(callSession.id, user.id, {
                is_audio_enabled: newState,
            });
        }
    };

    const handleToggleVideo = async () => {
        const newState = webrtcService.toggleVideo();
        setIsVideoEnabled(newState);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await updateParticipantMedia(callSession.id, user.id, {
                is_video_enabled: newState,
            });
        }
    };

    const handleToggleScreenShare = async () => {
        try {
            if (isScreenSharing) {
                await webrtcService.stopScreenShare();
                setIsScreenSharing(false);

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await updateParticipantMedia(callSession.id, user.id, {
                        is_screen_sharing: false,
                    });
                }
            } else {
                await webrtcService.startScreenShare();
                setIsScreenSharing(true);

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await updateParticipantMedia(callSession.id, user.id, {
                        is_screen_sharing: true,
                    });
                }
            }
        } catch (error: any) {
            toast({
                title: 'Screen Share Error',
                description: error.message || 'Failed to share screen',
                variant: 'destructive',
            });
        }
    };

    const handleEndCall = async () => {
        await endCallSession(callSession.id);
        cleanup();
        onEndCall();
    };

    const formatDuration = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isGroupCall = callSession.call_type.includes('group');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed inset-0 z-50 bg-black ${isFullscreen ? '' : 'p-4'}`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${connectionQuality === 'excellent' ? 'bg-green-500' : connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="text-sm text-white/80">{connectionQuality}</span>
                        </div>
                        <div className="text-white font-medium">{formatDuration(callDuration)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                        </Button>
                        {isGroupCall && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white">
                                <Users className="h-4 w-4" />
                                <span className="text-sm">{participants.length}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Grid */}
                <div className="flex-1 relative overflow-hidden">
                    {/* Remote Video */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Local Video (Picture-in-Picture) */}
                    <motion.div
                        drag
                        dragConstraints={{ left: 0, right: 300, top: 0, bottom: 300 }}
                        className="absolute top-4 right-4 w-48 h-36 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl cursor-move"
                    >
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-[#C9B458] text-white text-2xl">
                                        You
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Controls */}
                <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-4">
                        {/* Audio Toggle */}
                        <Button
                            size="lg"
                            variant={isAudioEnabled ? 'secondary' : 'destructive'}
                            className="rounded-full h-14 w-14"
                            onClick={handleToggleAudio}
                        >
                            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                        </Button>

                        {/* Video Toggle */}
                        {callSession.call_type.includes('video') && (
                            <Button
                                size="lg"
                                variant={isVideoEnabled ? 'secondary' : 'destructive'}
                                className="rounded-full h-14 w-14"
                                onClick={handleToggleVideo}
                            >
                                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                            </Button>
                        )}

                        {/* Screen Share */}
                        <Button
                            size="lg"
                            variant={isScreenSharing ? 'default' : 'secondary'}
                            className="rounded-full h-14 w-14"
                            onClick={handleToggleScreenShare}
                        >
                            {isScreenSharing ? <MonitorOff className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                        </Button>

                        {/* End Call */}
                        <Button
                            size="lg"
                            variant="destructive"
                            className="rounded-full h-14 w-14 bg-red-500 hover:bg-red-600"
                            onClick={handleEndCall}
                        >
                            <PhoneOff className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
