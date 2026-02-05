import { useState, useEffect, useCallback } from 'react';
import { type WhiteboardStroke } from '@/mocks/vrCollaborators';

interface WhiteboardSession {
  roomId: string;
  strokes: WhiteboardStroke[];
  timestamp: number;
}

const MAX_STROKES_PER_SESSION = 100;
const SESSION_KEY_PREFIX = 'INTELLI-LEARN_whiteboard_';

/**
 * Custom hook for managing whiteboard session state
 * Persists strokes to sessionStorage per room
 */
export function useWhiteboardSession(roomId: string) {
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const sessionKey = `${SESSION_KEY_PREFIX}${roomId}`;

  // Load session on mount or room change
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(sessionKey);
      if (savedData) {
        const session: WhiteboardSession = JSON.parse(savedData);
        if (session.roomId === roomId && Array.isArray(session.strokes)) {
          setStrokes(session.strokes);
        }
      }
    } catch (error) {
      console.error('Failed to load whiteboard session:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [roomId, sessionKey]);

  // Save session whenever strokes change
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const session: WhiteboardSession = {
        roomId,
        strokes: strokes.slice(-MAX_STROKES_PER_SESSION), // Keep only last 100 strokes
        timestamp: Date.now(),
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save whiteboard session:', error);
    }
  }, [strokes, roomId, sessionKey, isLoaded]);

  const addStroke = useCallback((stroke: WhiteboardStroke) => {
    setStrokes((prev) => [...prev, stroke]);
  }, []);

  const clearStrokes = useCallback(() => {
    setStrokes([]);
    try {
      sessionStorage.removeItem(sessionKey);
    } catch (error) {
      console.error('Failed to clear whiteboard session:', error);
    }
  }, [sessionKey]);

  const undoLastStroke = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  const replaceStrokes = useCallback((newStrokes: WhiteboardStroke[]) => {
    setStrokes(newStrokes);
  }, []);

  return {
    strokes,
    isLoaded,
    addStroke,
    clearStrokes,
    undoLastStroke,
    replaceStrokes,
  };
}

/**
 * Clear all whiteboard sessions from storage
 */
export function clearAllWhiteboardSessions(): void {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(SESSION_KEY_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all whiteboard sessions:', error);
  }
}

/**
 * Get all saved whiteboard sessions
 */
export function getAllWhiteboardSessions(): WhiteboardSession[] {
  const sessions: WhiteboardSession[] = [];
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(SESSION_KEY_PREFIX)) {
        const data = sessionStorage.getItem(key);
        if (data) {
          sessions.push(JSON.parse(data));
        }
      }
    });
  } catch (error) {
    console.error('Failed to get whiteboard sessions:', error);
  }
  return sessions;
}
