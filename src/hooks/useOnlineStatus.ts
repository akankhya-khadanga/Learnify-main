/**
 * useOnlineStatus Hook
 * Automatically tracks user online status
 */

import { useEffect } from 'react';
import { onlineStatusService } from '@/services/onlineStatusService';

export function useOnlineStatus() {
    useEffect(() => {
        // Start tracking when component mounts
        onlineStatusService.startTracking();

        // Stop tracking when component unmounts
        return () => {
            onlineStatusService.stopTracking();
        };
    }, []);
}
