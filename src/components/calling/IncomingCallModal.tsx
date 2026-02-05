import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { type CallSession } from '@/services/callingService';
import { webrtcService } from '@/services/webrtcService';

interface IncomingCallModalProps {
    callSession: CallSession;
    callerName: string;
    offer: RTCSessionDescriptionInit;
    callerId: string;
    onAccept: (answer: RTCSessionDescriptionInit) => void;
    onDecline: () => void;
}

export function IncomingCallModal({
    callSession,
    callerName,
    offer,
    callerId,
    onAccept,
    onDecline,
}: IncomingCallModalProps) {
    const [isRinging, setIsRinging] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);

    const handleAccept = async () => {
        try {
            setIsAccepting(true);

            // Get local media stream
            const isVideoCall = callSession.call_type.includes('video');
            const stream = await webrtcService.getLocalStream({
                audio: true,
                video: isVideoCall,
            });

            console.log('[IncomingCallModal] Local stream obtained:', {
                audioTracks: stream.getAudioTracks().length,
                videoTracks: stream.getVideoTracks().length,
            });

            // Initialize peer connection
            webrtcService.initializePeerConnection(
                async (candidate) => {
                    // Send ICE candidates back to caller
                    console.log('[IncomingCallModal] Sending ICE candidate to caller:', callerId);
                    const { callSignalingService } = await import('@/services/callSignalingService');
                    await callSignalingService.sendIceCandidate(callerId, callSession.id, candidate);
                },
                (remoteStream) => {
                    console.log('[IncomingCallModal] Remote stream received');

                    // DEBUG: Check audio tracks
                    const audioTracks = remoteStream.getAudioTracks();
                    const videoTracks = remoteStream.getVideoTracks();
                    console.log('[IncomingCallModal] Audio tracks:', audioTracks.length, audioTracks);
                    console.log('[IncomingCallModal] Video tracks:', videoTracks.length, videoTracks);

                    if (audioTracks.length > 0) {
                        audioTracks.forEach((track, i) => {
                            console.log(`[IncomingCallModal] Audio track ${i} BEFORE unmute:`, {
                                enabled: track.enabled,
                                muted: track.muted,
                                readyState: track.readyState,
                                label: track.label
                            });

                            // CRITICAL FIX: Tracks often arrive muted, need to ensure they're enabled
                            // Note: track.muted is read-only, but we ensure track.enabled = true
                            track.enabled = true;

                            console.log(`[IncomingCallModal] Audio track ${i} AFTER fix, enabled:`, track.enabled);
                        });
                    } else {
                        console.error('[IncomingCallModal] ⚠️ NO AUDIO TRACKS in remote stream!');
                    }
                }
            );

            // Add local stream
            webrtcService.addLocalStream(stream);
            console.log('[IncomingCallModal] Local stream added to peer connection');

            // Set remote description (the offer)
            await webrtcService.setRemoteDescription(offer);
            console.log('[IncomingCallModal] Remote description (offer) set');

            // Create answer
            const answer = await webrtcService.createAnswer();
            console.log('[IncomingCallModal] Answer created');

            setIsRinging(false);
            onAccept(answer);
        } catch (error) {
            console.error('[IncomingCallModal] Error accepting call:', error);
            setIsAccepting(false);
        }
    };

    const handleDecline = () => {
        setIsRinging(false);
        onDecline();
    };

    const isVideoCall = callSession.call_type.includes('video');

    return (
        <AnimatePresence>
            {isRinging && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                    >
                        <Card className="w-[400px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br from-white to-gray-50">
                            <CardContent className="p-8 text-center space-y-6">
                                {/* Caller Avatar with ripple effect */}
                                <div className="relative inline-block">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="absolute inset-0 rounded-full bg-[#C9B458]/30"
                                        style={{ transform: 'scale(1.2)' }}
                                    />
                                    <Avatar className="h-24 w-24 border-4 border-white shadow-xl relative z-10">
                                        <AvatarFallback className="bg-gradient-to-br from-[#C9B458] to-[#C27BA0] text-white text-3xl font-bold">
                                            {callerName.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>

                                {/* Caller Info */}
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">{callerName}</h3>
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        {isVideoCall ? (
                                            <>
                                                <Video className="h-4 w-4" />
                                                <span>Incoming Video Call</span>
                                            </>
                                        ) : (
                                            <>
                                                <Phone className="h-4 w-4" />
                                                <span>Incoming Audio Call</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Call Type Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9B458]/10 text-[#C9B458] border-2 border-[#C9B458]/20">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="h-2 w-2 rounded-full bg-[#C9B458]"
                                    />
                                    <span className="text-sm font-medium">Ringing...</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-center gap-4 pt-4">
                                    {/* Decline Button */}
                                    <Button
                                        size="lg"
                                        variant="destructive"
                                        className="rounded-full h-16 w-16 bg-red-500 hover:bg-red-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        onClick={handleDecline}
                                    >
                                        <PhoneOff className="h-6 w-6" />
                                    </Button>

                                    {/* Accept Button */}
                                    <Button
                                        size="lg"
                                        className="rounded-full h-16 w-16 bg-green-500 hover:bg-green-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        onClick={handleAccept}
                                        disabled={isAccepting}
                                    >
                                        {isAccepting ? (
                                            <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Phone className="h-6 w-6 text-white" />
                                        )}
                                    </Button>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                    {isVideoCall ? 'Your camera will be enabled' : 'Audio only call'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
