import { useState, useEffect } from 'react';
import { friendsService, Friendship, UserProfile } from '@/services/friendsService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, UserPlus, Inbox, Search, Flame, Check, X, MessageCircle, Phone, Video } from 'lucide-react';
import { studyGroupsService } from '@/services/studyGroupsService';
import { useNavigate } from 'react-router-dom';
import { createCallSession, updateParticipantStatus, type CallSession } from '@/services/callingService';
import { CallInterface } from '@/components/calling/CallInterface';
import { IncomingCallModal } from '@/components/calling/IncomingCallModal';
import { useToast } from '@/hooks/use-toast';
import { useCallNotifications } from '@/hooks/useCallNotifications';
import { supabase } from '@/lib/supabase';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { callSignalingService } from '@/services/callSignalingService';
import { webrtcService } from '@/services/webrtcService';

export default function Friends() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [friends, setFriends] = useState<UserProfile[]>([]);
    const [onlineFriends, setOnlineFriends] = useState<UserProfile[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeCall, setActiveCall] = useState<CallSession | null>(null);
    const [isInitiatingCall, setIsInitiatingCall] = useState(false);
    const [currentRecipientId, setCurrentRecipientId] = useState<string>('');

    // Use the call notifications hook
    const { incomingCall, callerName, currentOffer, callerId, clearIncomingCall } = useCallNotifications();

    // Track online status
    useOnlineStatus();

    useEffect(() => {
        loadFriendsData();
    }, []);

    const loadFriendsData = async () => {
        try {
            const [allFriends, online, requests] = await Promise.all([
                friendsService.getFriends(),
                friendsService.getOnlineFriends(),
                friendsService.getPendingRequests()
            ]);

            setFriends(allFriends);
            setOnlineFriends(online);
            setPendingRequests(requests);
        } catch (error) {
            console.error('Error loading friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        await friendsService.acceptFriendRequest(requestId);
        await loadFriendsData();
    };

    const handleRejectRequest = async (requestId: string) => {
        await friendsService.rejectFriendRequest(requestId);
        await loadFriendsData();
    };

    const handleSendEncouragement = async (friendId: string, type: 'fire' | 'clap' | 'star' | 'thumbs_up') => {
        // await friendsService.sendEncouragement(friendId, type);
        console.log('Encouragement sent:', type);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        const results = await friendsService.searchUsers(searchQuery);
        // Show results in modal or list
        console.log('Search results:', results);
    };

    const handleStartDM = async (friendId: string) => {
        try {
            const group = await studyGroupsService.startDirectMessage(friendId);
            // Navigate to study groups with this DM selected
            navigate(`/study-groups?dm=${group.id}`);
        } catch (error) {
            console.error('Error starting DM:', error);
        }
    };

    const handleStartCall = async (friendId: string, callType: 'audio' | 'video') => {
        try {
            setIsInitiatingCall(true);
            setCurrentRecipientId(friendId);

            // Step 1: Get local media stream
            const stream = await webrtcService.getLocalStream({
                audio: true,
                video: callType === 'video',
            });

            console.log('[Friends] Local stream obtained:', {
                audioTracks: stream.getAudioTracks().length,
                videoTracks: stream.getVideoTracks().length,
            });

            // Step 2: Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Step 3: Create call session FIRST to get callId
            const { session: newCallSession, error: sessionError } = await createCallSession(
                callType,
                [friendId]
            );

            if (sessionError || !newCallSession) {
                throw sessionError || new Error('Failed to create call session');
            }

            const callId = newCallSession.id;
            console.log('[Friends] Call session created:', callId);

            // Step 4: Set active call state immediately so we have callId for ICE candidates
            setActiveCall({
                id: callId,
                call_type: callType,
                room_id: newCallSession.room_id,
                initiator_id: user.id,
                status: 'ringing',
                started_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            } as CallSession);

            // Step 5: Now initialize peer connection with the correct callId
            webrtcService.initializePeerConnection(
                // Handle ICE candidates - callId is now available
                async (candidate) => {
                    console.log('[Friends] Sending ICE candidate for call:', callId);
                    await callSignalingService.sendIceCandidate(friendId, callId, candidate);
                },
                // Handle remote stream
                (remoteStream) => {
                    console.log('[Friends] Remote stream received');

                    // DEBUG: Check audio tracks
                    const audioTracks = remoteStream.getAudioTracks();
                    const videoTracks = remoteStream.getVideoTracks();
                    console.log('[Friends] Audio tracks:', audioTracks.length, audioTracks);
                    console.log('[Friends] Video tracks:', videoTracks.length, videoTracks);

                    if (audioTracks.length > 0) {
                        audioTracks.forEach((track, i) => {
                            console.log(`[Friends] Audio track ${i} BEFORE unmute:`, {
                                enabled: track.enabled,
                                muted: track.muted,
                                readyState: track.readyState,
                                label: track.label
                            });

                            // CRITICAL FIX: Tracks often arrive muted, need to unmute them
                            // Note: track.muted is read-only, but we ensure track.enabled = true
                            track.enabled = true;

                            console.log(`[Friends] Audio track ${i} AFTER fix, enabled:`, track.enabled);
                        });
                    } else {
                        console.error('[Friends] ⚠️ NO AUDIO TRACKS in remote stream!');
                    }
                }
            );

            // Step 6: Add local stream to peer connection
            webrtcService.addLocalStream(stream);
            console.log('[Friends] Local stream added to peer connection');

            // Step 7: Create WebRTC offer
            const offer = await webrtcService.createOffer();
            console.log('[Friends] WebRTC offer created');

            // Step 8: Get caller profile for the signaling message
            const { data: callerProfile } = await supabase
                .from('user_profiles')
                .select('display_name, username')
                .eq('id', user.id)
                .single();

            // Step 9: Send call offer via signaling (manually, since we already created the session)
            await callSignalingService.sendSignal(friendId, {
                type: 'call-offer',
                callId: callId,
                from: user.id,
                to: friendId,
                data: {
                    callId: callId,
                    callType: callType,
                    offer: offer,
                    caller: {
                        id: user.id,
                        name: callerProfile?.display_name || callerProfile?.username || 'Unknown'
                    }
                }
            });

            console.log('[Friends] Call offer sent');

            toast({
                title: `${callType === 'video' ? 'Video' : 'Audio'} Call Started`,
                description: 'Calling...',
            });

            // Step 10: Listen for call answer
            await callSignalingService.initializePersonalChannel(
                () => { },
                async (answer) => {
                    console.log('[Friends] Call answered, setting remote description');
                    await webrtcService.setRemoteDescription(answer.answer);
                    setActiveCall(prev => prev ? { ...prev, status: 'active' } : null);
                },
                async (candidate) => {
                    console.log('[Friends] Remote ICE candidate received');
                    await webrtcService.addIceCandidate(candidate);
                },
                () => {
                    handleEndCall();
                },
                () => {
                    toast({
                        title: 'Call Declined',
                        description: 'The recipient declined your call',
                        variant: 'destructive',
                    });
                    handleEndCall();
                }
            );
        } catch (error: any) {
            console.error('Error starting call:', error);
            toast({
                title: 'Call Failed',
                description: error.message || 'Failed to start call',
                variant: 'destructive',
            });
            setIsInitiatingCall(false);
            setCurrentRecipientId('');
        }
    };

    const handleEndCall = async () => {
        if (activeCall) {
            await callSignalingService.endCall(activeCall.id, currentRecipientId);
        }
        webrtcService.cleanup();
        setActiveCall(null);
        setIsInitiatingCall(false);
        setCurrentRecipientId('');
        clearIncomingCall();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-12 bg-obsidian rounded"></div>
                        <div className="h-64 bg-obsidian rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-pink flex items-center gap-3">
                            <Users className="h-8 w-8" />
                            Friends
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {onlineFriends.length} of {friends.length} friends online
                        </p>
                    </div>

                    {/* Search and Notifications */}
                    <div className="flex gap-2 items-center">
                        <NotificationCenter />
                        <Input
                            placeholder="Search for users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-64 bg-obsidian border-pink/20"
                        />
                        <Button onClick={handleSearch} className="bg-pink hover:bg-pink/80 text-black">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="requests" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-obsidian">
                        <TabsTrigger value="all">
                            All Friends ({friends.length})
                        </TabsTrigger>
                        <TabsTrigger value="online">
                            Online ({onlineFriends.length})
                        </TabsTrigger>
                        <TabsTrigger value="requests">
                            Requests ({pendingRequests.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* All Friends */}
                    <TabsContent value="all">
                        <ScrollArea className="h-[600px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {friends.map((friend) => (
                                    <Card key={friend.id} className="bg-obsidian border-2 border-pink/20 p-4">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                                                alt={friend.display_name || friend.username}
                                                className="h-12 w-12 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-text">{friend.display_name || friend.username}</h3>
                                                    {friend.status === 'online' && (
                                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400">@{friend.username}</p>

                                                <div className="flex items-center gap-1 mt-2 bg-orange-500/10 px-2 py-1 rounded w-fit">
                                                    <Flame className="h-3 w-3 text-orange-500" />
                                                    <span className="text-xs font-bold text-orange-500">
                                                        {friend.streak || 0} day streak
                                                    </span>
                                                </div>

                                                <div className="flex gap-1 mt-3">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStartDM(friend.id)}
                                                        className="h-8 px-3 bg-primary hover:bg-primary/90 text-black font-semibold flex-1"
                                                    >
                                                        <MessageCircle className="h-4 w-4 mr-1" />
                                                        Message
                                                    </Button>
                                                    {friend.status === 'online' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleStartCall(friend.id, 'audio')}
                                                                className="h-8 px-2 border-green-500/20 hover:bg-green-500/10"
                                                                title="Audio Call"
                                                            >
                                                                <Phone className="h-4 w-4 text-green-500" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleStartCall(friend.id, 'video')}
                                                                className="h-8 px-2 border-blue-500/20 hover:bg-blue-500/10"
                                                                title="Video Call"
                                                            >
                                                                <Video className="h-4 w-4 text-blue-500" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleSendEncouragement(friend.id, 'fire')}
                                                        className="h-8 px-2 hover:bg-pink/20"
                                                        title="Fire"
                                                    >
                                                        🔥
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Online Friends */}
                    <TabsContent value="online">
                        <ScrollArea className="h-[600px]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {onlineFriends.map((friend) => (
                                    <Card key={friend.id} className="bg-obsidian border-2 border-green-500/20 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="relative">
                                                <img
                                                    src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.username}`}
                                                    alt={friend.display_name || friend.username}
                                                    className="h-12 w-12 rounded-full"
                                                />
                                                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-obsidian"></div>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-text">{friend.display_name || friend.username}</h3>
                                                <p className="text-xs text-green-500">Online now</p>
                                                <p className="text-xs text-gray-300 mt-1">@{friend.username} • {friend.streak || 0}🔥</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    {/* Friend Requests */}
                    <TabsContent value="requests">
                        <div className="space-y-4">
                            {pendingRequests.length === 0 ? (
                                <Card className="bg-obsidian border-2 border-pink/20 p-8">
                                    <div className="text-center">
                                        <Inbox className="h-12 w-12 text-text/20 mx-auto mb-3" />
                                        <p className="text-text/60">No pending friend requests</p>
                                    </div>
                                </Card>
                            ) : (
                                pendingRequests.map((request) => (
                                    <Card key={request.id} className="bg-obsidian border-2 border-pink/20 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={request.friend?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.friend?.username}`}
                                                    alt={request.friend?.display_name || request.friend?.username}
                                                    className="h-12 w-12 rounded-full"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-text">{request.friend?.display_name || request.friend?.username}</h3>
                                                    <p className="text-xs text-gray-400">
                                                        Sent {new Date(request.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleAcceptRequest(request.id)}
                                                    className="bg-green-500 hover:bg-green-600 text-white"
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    onClick={() => handleRejectRequest(request.id)}
                                                    variant="outline"
                                                    className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Active Call Interface */}
            {activeCall && (
                <CallInterface
                    callSession={activeCall}
                    participants={[]}
                    onEndCall={handleEndCall}
                />
            )}

            {/* Incoming Call Modal */}
            {incomingCall && currentOffer && (
                <IncomingCallModal
                    callSession={incomingCall}
                    callerName={callerName}
                    offer={currentOffer}
                    callerId={callerId}
                    onAccept={async (answer) => {
                        // Send answer back to caller
                        await callSignalingService.answerCall(incomingCall.id, callerId, answer);
                        setActiveCall(incomingCall);
                        clearIncomingCall();
                    }}
                    onDecline={async () => {
                        await callSignalingService.declineCall(incomingCall.id, callerId);
                        clearIncomingCall();
                    }}
                />
            )}
        </div>
    );
}
