/**
 * Call Notifications Hook
 * Listens for incoming calls via signaling service and manages call state
 */

import { useState, useEffect } from 'react';
import { type CallSession } from '@/services/callingService';
import { callSignalingService, type CallOffer } from '@/services/callSignalingService';

export function useCallNotifications() {
    const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
    const [callerName, setCallerName] = useState<string>('Unknown');
    const [currentOffer, setCurrentOffer] = useState<RTCSessionDescriptionInit | null>(null);
    const [callerId, setCallerId] = useState<string>('');

    useEffect(() => {
        const setupSignaling = async () => {
            try {
                await callSignalingService.initializePersonalChannel(
                    // Handle incoming call offer
                    (offer: CallOffer) => {
                        console.log('[useCallNotifications] Incoming call:', offer);

                        // Store the offer for later use when accepting
                        setCurrentOffer(offer.offer);
                        setCallerId(offer.caller.id);
                        setCallerName(offer.caller.name);

                        // Create a minimal call session object for UI
                        setIncomingCall({
                            id: offer.callId,
                            call_type: offer.callType,
                            room_id: '',
                            initiator_id: offer.caller.id,
                            status: 'ringing',
                            started_at: new Date().toISOString(),
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        } as CallSession);
                    },
                    // Handle call answer (not used in this hook, but required)
                    (answer) => {
                        console.log('[useCallNotifications] Call answered:', answer);
                    },
                    // Handle ICE candidate (not used in this hook, but required)
                    (candidate) => {
                        console.log('[useCallNotifications] ICE candidate received:', candidate);
                    },
                    // Handle call ended
                    (callId) => {
                        console.log('[useCallNotifications] Call ended:', callId);
                        if (incomingCall?.id === callId) {
                            clearIncomingCall();
                        }
                    },
                    // Handle call declined
                    (callId) => {
                        console.log('[useCallNotifications] Call declined:', callId);
                        if (incomingCall?.id === callId) {
                            clearIncomingCall();
                        }
                    }
                );
            } catch (error) {
                console.error('[useCallNotifications] Error setting up signaling:', error);
            }
        };

        setupSignaling();

        return () => {
            callSignalingService.cleanup();
        };
    }, []);

    const clearIncomingCall = () => {
        setIncomingCall(null);
        setCallerName('Unknown');
        setCurrentOffer(null);
        setCallerId('');
    };

    return {
        incomingCall,
        callerName,
        currentOffer,
        callerId,
        clearIncomingCall,
    };
}
