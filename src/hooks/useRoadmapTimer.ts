import { useState, useEffect, useRef, useCallback } from 'react';
import { trackStudyTime } from '@/services/roadmapService';
import { useUserStore } from '@/store/userStore';

interface UseRoadmapTimerOptions {
    roadmapId: string;
    milestoneId: string;
    autoSaveInterval?: number; // milliseconds, default 30000 (30s)
}

export function useRoadmapTimer({
    roadmapId,
    milestoneId,
    autoSaveInterval = 30000,
}: UseRoadmapTimerOptions) {
    const userId = useUserStore(state => state.user?.id);

    const [isRunning, setIsRunning] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [lastSavedMinutes, setLastSavedMinutes] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

    // Start timer
    const start = useCallback(() => {
        if (isRunning) return;

        startTimeRef.current = Date.now() - elapsedSeconds * 1000;
        setIsRunning(true);

        // Update elapsed time every second
        intervalRef.current = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        // Auto-save time every interval
        autoSaveRef.current = setInterval(async () => {
            await saveTime();
        }, autoSaveInterval);
    }, [isRunning, elapsedSeconds, autoSaveInterval]);

    // Pause timer
    const pause = useCallback(() => {
        if (!isRunning) return;

        setIsRunning(false);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (autoSaveRef.current) {
            clearInterval(autoSaveRef.current);
            autoSaveRef.current = null;
        }
    }, [isRunning]);

    // Save time to database
    const saveTime = useCallback(async (notes?: string) => {
        if (!userId || elapsedSeconds === 0) return;

        const currentMinutes = Math.floor(elapsedSeconds / 60);
        const minutesToSave = currentMinutes - lastSavedMinutes;

        if (minutesToSave === 0) return;

        try {
            await trackStudyTime(userId, roadmapId, milestoneId, minutesToSave, notes);
            setLastSavedMinutes(currentMinutes);
        } catch (error) {
            console.error('Failed to save study time:', error);
        }
    }, [userId, roadmapId, milestoneId, elapsedSeconds, lastSavedMinutes]);

    // Stop and save
    const stop = useCallback(async (notes?: string) => {
        pause();
        await saveTime(notes);
        setElapsedSeconds(0);
        setLastSavedMinutes(0);
    }, [pause, saveTime]);

    // Reset timer
    const reset = useCallback(() => {
        pause();
        setElapsedSeconds(0);
        setLastSavedMinutes(0);
    }, [pause]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (autoSaveRef.current) clearInterval(autoSaveRef.current);
        };
    }, []);

    // Format time as HH:MM:SS
    const formattedTime = useCallback(() => {
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;

        return {
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: seconds.toString().padStart(2, '0'),
            display: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
        };
    }, [elapsedSeconds]);

    return {
        isRunning,
        elapsedSeconds,
        formattedTime: formattedTime(),
        start,
        pause,
        stop,
        reset,
        saveTime,
    };
}
