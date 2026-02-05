/**
 * Adaptive Learning Algorithm Service
 * 
 * Intelligently adjusts:
 * - Learning speed based on performance
 * - Repetition frequency for weak gestures
 * - Visual complexity based on cognitive load
 * - Spaced repetition intervals
 * - Session difficulty
 */

import type {
  LessonProgress,
  AccuracyScore,
  AdaptiveLearningState,
  LearningSpeed,
  SignLesson,
  DifficultyLevel,
} from '../types/signLanguage';

interface PerformanceMetrics {
  overallAccuracy: number;
  recentAccuracy: number;
  averageCompletionTime: number;
  streakDays: number;
  weakGestures: string[];
  strongGestures: string[];
  cognitiveLoadIndicators: {
    mistakeFrequency: number;
    timeOnTask: number;
    needForRepetition: number;
  };
}

interface AdaptationRecommendation {
  adjustSpeed: boolean;
  newSpeed?: LearningSpeed;
  adjustDifficulty: boolean;
  newDifficulty?: DifficultyLevel;
  gesturesToRepeat: string[];
  breakSuggested: boolean;
  encouragementMessage: string;
  nextReviewDate: Date;
}

class AdaptiveLearningService {
  /**
   * Analyze student performance and generate adaptation recommendations
   */
  analyzePerformance(
    progress: LessonProgress,
    adaptiveState: AdaptiveLearningState,
    lesson: SignLesson
  ): AdaptationRecommendation {
    const metrics = this.calculateMetrics(progress);
    
    // Determine if speed adjustment is needed
    const speedAdjustment = this.evaluateSpeedAdjustment(
      metrics,
      adaptiveState.current_speed
    );

    // Determine if difficulty adjustment is needed
    const difficultyAdjustment = this.evaluateDifficultyAdjustment(
      metrics,
      lesson.difficulty
    );

    // Identify gestures needing repetition
    const gesturesToRepeat = this.identifyRepetitionNeeds(
      progress,
      adaptiveState.auto_repeat_threshold
    );

    // Check if break is needed
    const breakSuggested = this.shouldSuggestBreak(
      progress.total_time_spent_minutes,
      metrics.cognitiveLoadIndicators
    );

    // Calculate next review date using spaced repetition
    const nextReviewDate = this.calculateNextReviewDate(
      progress,
      metrics.overallAccuracy
    );

    // Generate encouragement message
    const encouragementMessage = this.generateEncouragement(metrics);

    return {
      adjustSpeed: speedAdjustment.shouldAdjust,
      newSpeed: speedAdjustment.newSpeed,
      adjustDifficulty: difficultyAdjustment.shouldAdjust,
      newDifficulty: difficultyAdjustment.newDifficulty,
      gesturesToRepeat,
      breakSuggested,
      encouragementMessage,
      nextReviewDate,
    };
  }

  /**
   * Calculate spaced repetition interval
   * Uses SM-2 algorithm variant optimized for visual/gestural learning
   */
  calculateSpacedRepetitionInterval(
    currentInterval: number,
    accuracy: number,
    repetitionCount: number
  ): number {
    // Modified SM-2 for sign language
    // Visual/gestural memory has different retention patterns
    
    let easeFactor = 1.3; // Base retention factor
    
    if (accuracy >= 90) {
      easeFactor = 2.5;
    } else if (accuracy >= 80) {
      easeFactor = 2.0;
    } else if (accuracy >= 70) {
      easeFactor = 1.5;
    } else if (accuracy >= 60) {
      easeFactor = 1.0;
    } else {
      // Reset interval for poor performance
      return 1;
    }

    // First repetition
    if (repetitionCount === 0) {
      return 1;
    }
    
    // Second repetition
    if (repetitionCount === 1) {
      return 3;
    }

    // Subsequent repetitions
    return Math.ceil(currentInterval * easeFactor);
  }

  /**
   * Determine optimal session length based on performance
   */
  calculateOptimalSessionLength(
    adaptiveState: AdaptiveLearningState,
    recentPerformance: PerformanceMetrics
  ): number {
    let baseLength = adaptiveState.preferred_session_length_minutes;

    // Adjust based on cognitive load
    const cognitiveLoad = this.calculateCognitiveLoad(recentPerformance);

    if (cognitiveLoad > 75) {
      // High cognitive load - shorten sessions
      baseLength = Math.max(10, baseLength * 0.7);
    } else if (cognitiveLoad < 40) {
      // Low cognitive load - can extend sessions
      baseLength = Math.min(45, baseLength * 1.3);
    }

    return Math.round(baseLength);
  }

  /**
   * Prioritize gestures for review using retention prediction
   */
  prioritizeGesturesForReview(
    progress: LessonProgress,
    currentDate: Date = new Date()
  ): Array<{ gesture: string; priority: number; reason: string }> {
    const priorities: Array<{ gesture: string; priority: number; reason: string }> = [];

    // Analyze each learned gesture
    progress.gestures_learned.forEach(gesture => {
      const isMastered = progress.gestures_mastered.includes(gesture);
      const isWeak = progress.weak_gestures.includes(gesture);
      
      // Get recent scores for this gesture
      const recentScores = progress.accuracy_scores
        .filter(score => score.gesture_id === gesture)
        .slice(-5);

      let priority = 50; // Base priority
      let reason = 'Regular review';

      if (isWeak) {
        priority += 30;
        reason = 'Needs reinforcement';
      }

      if (isMastered) {
        priority -= 20;
        reason = 'Maintenance review';
      }

      // Analyze trend
      if (recentScores.length >= 3) {
        const trend = this.calculatePerformanceTrend(recentScores);
        if (trend < -0.1) {
          priority += 25;
          reason = 'Declining performance';
        } else if (trend > 0.2) {
          priority -= 15;
          reason = 'Improving well';
        }
      }

      // Time since last practice
      const lastPracticed = new Date(progress.last_practiced);
      const daysSince = Math.floor(
        (currentDate.getTime() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSince > progress.spaced_repetition_interval_days) {
        priority += 20;
        reason = 'Due for review';
      }

      priorities.push({ gesture, priority, reason });
    });

    // Sort by priority (descending)
    return priorities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Detect learning plateaus and suggest interventions
   */
  detectPlateau(progressHistory: LessonProgress[]): {
    isPlateauing: boolean;
    intervention?: string;
  } {
    if (progressHistory.length < 5) {
      return { isPlateauing: false };
    }

    // Get recent accuracy trends
    const recentAccuracies = progressHistory.slice(-5).map(p => {
      const scores = p.accuracy_scores.slice(-10);
      return scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    });

    // Check for stagnation
    const variance = this.calculateVariance(recentAccuracies);
    const trend = this.calculatePerformanceTrend(
      recentAccuracies.map((score, i) => ({
        gesture_id: 'avg',
        attempt_number: i,
        score,
        timestamp: '',
        feedback: [],
      }))
    );

    const isPlateauing = variance < 25 && Math.abs(trend) < 0.05;

    if (isPlateauing) {
      const avgAccuracy = recentAccuracies.reduce((a, b) => a + b, 0) / recentAccuracies.length;
      
      let intervention = '';
      if (avgAccuracy < 70) {
        intervention = 'Consider reviewing fundamentals or reducing difficulty';
      } else if (avgAccuracy < 85) {
        intervention = 'Try practicing with different contexts or real-world scenarios';
      } else {
        intervention = 'Ready for more advanced concepts - consider increasing difficulty';
      }

      return { isPlateauing: true, intervention };
    }

    return { isPlateauing: false };
  }

  /**
   * Generate personalized practice schedule
   */
  generatePracticeSchedule(
    adaptiveState: AdaptiveLearningState,
    lessonsInProgress: SignLesson[],
    availableTimePerWeek: number
  ): Array<{
    day: string;
    lessons: string[];
    duration: number;
    focus: string;
  }> {
    const daysPerWeek = 5; // Optimal for retention
    const minutesPerDay = Math.floor(availableTimePerWeek * 60 / daysPerWeek);
    
    const schedule: Array<{
      day: string;
      lessons: string[];
      duration: number;
      focus: string;
    }> = [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const focusAreas = [
      'New concepts',
      'Practice and repetition',
      'Review weak areas',
      'Mixed practice',
      'Assessment and progress check',
    ];

    days.forEach((day, index) => {
      schedule.push({
        day,
        lessons: lessonsInProgress.slice(0, 2).map(l => l.topic),
        duration: minutesPerDay,
        focus: focusAreas[index],
      });
    });

    return schedule;
  }

  /**
   * Adjust cognitive load based on student state
   */
  adjustCognitiveLoad(
    currentLoad: number,
    performanceMetrics: PerformanceMetrics
  ): {
    newLoad: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let newLoad = currentLoad;

    // Increase load if performing well
    if (performanceMetrics.recentAccuracy > 85 && performanceMetrics.overallAccuracy > 80) {
      newLoad = Math.min(100, currentLoad + 10);
      recommendations.push('Increase lesson complexity');
      recommendations.push('Introduce more challenging gestures');
    }
    // Decrease load if struggling
    else if (performanceMetrics.recentAccuracy < 65) {
      newLoad = Math.max(0, currentLoad - 15);
      recommendations.push('Simplify visual complexity');
      recommendations.push('Reduce number of new gestures per session');
      recommendations.push('Add more repetition opportunities');
    }
    // Maintain if in optimal zone
    else {
      recommendations.push('Current difficulty is appropriate');
    }

    return { newLoad, recommendations };
  }

  // Private helper methods

  private calculateMetrics(progress: LessonProgress): PerformanceMetrics {
    const allScores = progress.accuracy_scores;
    const recentScores = allScores.slice(-10);

    const overallAccuracy = allScores.length > 0
      ? allScores.reduce((sum, s) => sum + s.score, 0) / allScores.length
      : 0;

    const recentAccuracy = recentScores.length > 0
      ? recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length
      : 0;

    // Calculate weak and strong gestures
    const gestureScores = new Map<string, number[]>();
    allScores.forEach(score => {
      const scores = gestureScores.get(score.gesture_id) || [];
      scores.push(score.score);
      gestureScores.set(score.gesture_id, scores);
    });

    const weakGestures: string[] = [];
    const strongGestures: string[] = [];

    gestureScores.forEach((scores, gesture) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 70) {
        weakGestures.push(gesture);
      } else if (avg > 90) {
        strongGestures.push(gesture);
      }
    });

    return {
      overallAccuracy,
      recentAccuracy,
      averageCompletionTime: progress.total_time_spent_minutes / (progress.repetition_count || 1),
      streakDays: 0, // Would calculate from timestamps
      weakGestures,
      strongGestures,
      cognitiveLoadIndicators: {
        mistakeFrequency: 100 - recentAccuracy,
        timeOnTask: progress.total_time_spent_minutes,
        needForRepetition: progress.repetition_count,
      },
    };
  }

  private evaluateSpeedAdjustment(
    metrics: PerformanceMetrics,
    currentSpeed: LearningSpeed
  ): { shouldAdjust: boolean; newSpeed?: LearningSpeed } {
    // Speed up if consistently high accuracy
    if (metrics.recentAccuracy > 90 && metrics.overallAccuracy > 85) {
      if (currentSpeed === 'slow') {
        return { shouldAdjust: true, newSpeed: 'medium' };
      } else if (currentSpeed === 'medium') {
        return { shouldAdjust: true, newSpeed: 'fast' };
      }
    }

    // Slow down if struggling
    if (metrics.recentAccuracy < 65) {
      if (currentSpeed === 'fast') {
        return { shouldAdjust: true, newSpeed: 'medium' };
      } else if (currentSpeed === 'medium') {
        return { shouldAdjust: true, newSpeed: 'slow' };
      }
    }

    return { shouldAdjust: false };
  }

  private evaluateDifficultyAdjustment(
    metrics: PerformanceMetrics,
    currentDifficulty: DifficultyLevel
  ): { shouldAdjust: boolean; newDifficulty?: DifficultyLevel } {
    const difficultyLevels: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
    const currentIndex = difficultyLevels.indexOf(currentDifficulty);

    // Increase difficulty
    if (metrics.overallAccuracy > 90 && metrics.recentAccuracy > 85) {
      if (currentIndex < difficultyLevels.length - 1) {
        return {
          shouldAdjust: true,
          newDifficulty: difficultyLevels[currentIndex + 1],
        };
      }
    }

    // Decrease difficulty
    if (metrics.overallAccuracy < 60 && metrics.recentAccuracy < 65) {
      if (currentIndex > 0) {
        return {
          shouldAdjust: true,
          newDifficulty: difficultyLevels[currentIndex - 1],
        };
      }
    }

    return { shouldAdjust: false };
  }

  private identifyRepetitionNeeds(
    progress: LessonProgress,
    threshold: number
  ): string[] {
    const needsRepetition: string[] = [];

    // Check weak gestures
    progress.weak_gestures.forEach(gesture => {
      needsRepetition.push(gesture);
    });

    // Check recently struggled gestures
    const recentScores = progress.accuracy_scores.slice(-20);
    const gestureAvgs = new Map<string, number>();

    recentScores.forEach(score => {
      const avg = gestureAvgs.get(score.gesture_id) || 0;
      gestureAvgs.set(score.gesture_id, avg + score.score);
    });

    gestureAvgs.forEach((total, gesture) => {
      const count = recentScores.filter(s => s.gesture_id === gesture).length;
      const avg = total / count;
      
      if (avg < threshold && !needsRepetition.includes(gesture)) {
        needsRepetition.push(gesture);
      }
    });

    return needsRepetition;
  }

  private shouldSuggestBreak(
    totalTime: number,
    cognitiveLoad: { mistakeFrequency: number; timeOnTask: number; needForRepetition: number }
  ): boolean {
    // Suggest break after 30+ minutes
    if (totalTime > 30) return true;

    // Suggest break if high cognitive load indicators
    if (cognitiveLoad.mistakeFrequency > 40 && totalTime > 15) {
      return true;
    }

    return false;
  }

  private calculateNextReviewDate(
    progress: LessonProgress,
    accuracy: number
  ): Date {
    const interval = this.calculateSpacedRepetitionInterval(
      progress.spaced_repetition_interval_days,
      accuracy,
      progress.repetition_count
    );

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate;
  }

  private generateEncouragement(metrics: PerformanceMetrics): string {
    if (metrics.recentAccuracy > 90) {
      return '🌟 Outstanding work! You\'re mastering these signs beautifully!';
    } else if (metrics.recentAccuracy > 80) {
      return '💪 Great progress! Keep practicing and you\'ll be fluent soon!';
    } else if (metrics.recentAccuracy > 70) {
      return '👍 Good effort! Practice makes perfect - you\'re on the right track!';
    } else if (metrics.recentAccuracy > 60) {
      return '🎯 Keep going! Every practice session improves your signing!';
    } else {
      return '💙 Learning takes time. Focus on one gesture at a time - you\'ve got this!';
    }
  }

  private calculateCognitiveLoad(metrics: PerformanceMetrics): number {
    // Cognitive load composite score (0-100)
    const mistakeWeight = metrics.cognitiveLoadIndicators.mistakeFrequency * 0.5;
    const timeWeight = Math.min(100, metrics.cognitiveLoadIndicators.timeOnTask / 60 * 100) * 0.3;
    const repetitionWeight = Math.min(100, metrics.cognitiveLoadIndicators.needForRepetition * 10) * 0.2;

    return mistakeWeight + timeWeight + repetitionWeight;
  }

  private calculatePerformanceTrend(scores: AccuracyScore[]): number {
    if (scores.length < 2) return 0;

    // Simple linear regression slope
    const n = scores.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    scores.forEach((score, i) => {
      sumX += i;
      sumY += score.score;
      sumXY += i * score.score;
      sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope / 100; // Normalize
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();
