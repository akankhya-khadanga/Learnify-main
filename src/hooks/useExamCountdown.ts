/**
 * USE EXAM COUNTDOWN HOOK
 * Single source of truth for exam countdown logic
 * Automatically calculates days left, formats messages, handles multiple exams
 * 
 * Usage:
 * const { nearestExam, allExams, isLoading, refetch } = useExamCountdown();
 */

import { useState, useEffect, useCallback } from 'react';
import { examNotificationService } from '@/services/examNotificationService';
import type { ExamSchedule, ExamCountdown } from '@/types/examNotifications';

export function useExamCountdown() {
  const [allExams, setAllExams] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate days left until exam
   */
  const calculateDaysLeft = useCallback((examDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate day calculation
    
    const exam = new Date(examDate);
    exam.setHours(0, 0, 0, 0);
    
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, []);

  /**
   * Format countdown message based on days left
   */
  const formatMessage = useCallback((exam: ExamSchedule, daysLeft: number): string => {
    const examName = exam.exam_name;
    
    if (daysLeft < 0) {
      return `${examName} exam has passed`;
    } else if (daysLeft === 0) {
      return `Your ${examName} exam is today. All the best! 🎯`;
    } else if (daysLeft === 1) {
      return `Your ${examName} exam is tomorrow! 📚`;
    } else if (daysLeft <= 3) {
      return `Only ${daysLeft} days left for your ${examName} exam ⚡`;
    } else if (daysLeft <= 7) {
      return `${daysLeft} days left for your ${examName} exam`;
    } else if (daysLeft <= 14) {
      return `${daysLeft} days until ${examName} exam`;
    } else {
      return `${daysLeft} days until ${examName} exam`;
    }
  }, []);

  /**
   * Determine urgency level based on days left
   */
  const getUrgencyLevel = useCallback((daysLeft: number): ExamCountdown['urgencyLevel'] => {
    if (daysLeft < 0) return 'calm';
    if (daysLeft === 0) return 'critical';
    if (daysLeft === 1) return 'critical';
    if (daysLeft <= 3) return 'urgent';
    if (daysLeft <= 7) return 'moderate';
    return 'calm';
  }, []);

  /**
   * Convert ExamSchedule to ExamCountdown with calculated fields
   */
  const enrichExamData = useCallback((exam: ExamSchedule): ExamCountdown => {
    const daysLeft = calculateDaysLeft(exam.exam_date);
    const message = formatMessage(exam, daysLeft);
    const urgencyLevel = getUrgencyLevel(daysLeft);

    return {
      exam,
      daysLeft,
      message,
      isToday: daysLeft === 0,
      isTomorrow: daysLeft === 1,
      isPast: daysLeft < 0,
      urgencyLevel,
    };
  }, [calculateDaysLeft, formatMessage, getUrgencyLevel]);

  /**
   * Fetch all exams from database
   */
  const fetchExams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const exams = await examNotificationService.getUserExams(false); // Only upcoming exams
      setAllExams(exams);
    } catch (err) {
      console.error('[useExamCountdown] Error fetching exams:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch exams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  /**
   * Subscribe to real-time exam updates
   */
  useEffect(() => {
    const unsubscribe = examNotificationService.subscribeToExams((updatedExams) => {
      setAllExams(updatedExams);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Auto-refresh countdown daily at midnight (handles day changes)
   */
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Set timeout to refresh at midnight
    const midnightTimeout = setTimeout(() => {
      console.log('[useExamCountdown] 🕛 Midnight refresh - recalculating countdowns');
      fetchExams();

      // Set interval for subsequent midnights
      const dailyInterval = setInterval(() => {
        console.log('[useExamCountdown] 🕛 Daily refresh - recalculating countdowns');
        fetchExams();
      }, 24 * 60 * 60 * 1000); // Every 24 hours

      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [fetchExams]);

  /**
   * Get enriched countdown data for all exams
   */
  const allCountdowns: ExamCountdown[] = allExams.map(enrichExamData);

  /**
   * Get nearest exam (highest priority for notification)
   */
  const nearestExam: ExamCountdown | null = allCountdowns.length > 0 
    ? allCountdowns[0] // Already sorted by date from service
    : null;

  /**
   * Get upcoming exams (within next 7 days)
   */
  const upcomingExams: ExamCountdown[] = allCountdowns.filter(
    countdown => countdown.daysLeft >= 0 && countdown.daysLeft <= 7
  );

  /**
   * Get urgent exams (within next 3 days)
   */
  const urgentExams: ExamCountdown[] = allCountdowns.filter(
    countdown => countdown.daysLeft >= 0 && countdown.daysLeft <= 3
  );

  /**
   * Check if any exam is today
   */
  const hasExamToday = allCountdowns.some(countdown => countdown.isToday);

  /**
   * Check if any exam is tomorrow
   */
  const hasExamTomorrow = allCountdowns.some(countdown => countdown.isTomorrow);

  /**
   * Get total count of upcoming exams
   */
  const upcomingCount = allCountdowns.filter(countdown => countdown.daysLeft >= 0).length;

  return {
    // Core data
    allExams,
    allCountdowns,
    nearestExam,
    
    // Filtered lists
    upcomingExams,
    urgentExams,
    
    // Utility flags
    hasExamToday,
    hasExamTomorrow,
    upcomingCount,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch: fetchExams,
  };
}
