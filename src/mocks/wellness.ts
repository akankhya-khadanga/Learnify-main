/**
 * MOCK DATA: Emotional Wellness & Motivation System
 * Mood tracking, compassion AI, crisis support, and motivation engine
 */

export type MoodType = 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'LOW' | 'STRUGGLING';
export type StressLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type EmotionalTag = 'OVERWHELMED' | 'DEMOTIVATED' | 'BURNOUT_RISK' | 'CONFUSED' | 'ANXIOUS' | 'LONELY' | 'PRODUCTIVE' | 'ENERGIZED';

export interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  gradient: string;
}

export interface EmotionalCheckIn {
  id: string;
  date: string;
  mood: MoodType;
  stressLevel: StressLevel;
  tags: EmotionalTag[];
  note?: string;
}

export interface CompassionMessage {
  id: string;
  type: 'AI' | 'USER';
  content: string;
  timestamp: string;
  sentiment?: 'supportive' | 'motivational' | 'calming';
}

export interface DailyAffirmation {
  id: string;
  text: string;
  category: 'strength' | 'progress' | 'resilience' | 'self-care';
  icon: string;
}

export interface MotivationMemory {
  id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
}

export interface BreathingExercise {
  id: string;
  name: string;
  duration: number; // seconds
  pattern: {
    inhale: number;
    hold: number;
    exhale: number;
    pause: number;
  };
  description: string;
}

export interface CrisisResource {
  id: string;
  name: string;
  type: 'hotline' | 'chat' | 'website';
  contact: string;
  description: string;
  available: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    type: 'EXCELLENT',
    emoji: '🌟',
    label: 'Excellent',
    color: '#FFD700',
    gradient: 'from-yellow-400 to-orange-400'
  },
  {
    type: 'GOOD',
    emoji: '😊',
    label: 'Good',
    color: '#10B981',
    gradient: 'from-green-400 to-emerald-500'
  },
  {
    type: 'NEUTRAL',
    emoji: '😐',
    label: 'Neutral',
    color: '#6DAEDB',
    gradient: 'from-blue-400 to-cyan-500'
  },
  {
    type: 'LOW',
    emoji: '😔',
    label: 'Low',
    color: '#C27BA0',
    gradient: 'from-purple-400 to-pink-500'
  },
  {
    type: 'STRUGGLING',
    emoji: '😢',
    label: 'Struggling',
    color: '#EF4444',
    gradient: 'from-red-400 to-rose-500'
  }
];

export const EMOTIONAL_TAGS: { type: EmotionalTag; label: string; icon: string }[] = [
  { type: 'OVERWHELMED', label: 'Overwhelmed', icon: '😰' },
  { type: 'DEMOTIVATED', label: 'Demotivated', icon: '😞' },
  { type: 'BURNOUT_RISK', label: 'Burnout Risk', icon: '🔥' },
  { type: 'CONFUSED', label: 'Confused', icon: '😕' },
  { type: 'ANXIOUS', label: 'Anxious', icon: '😟' },
  { type: 'LONELY', label: 'Lonely', icon: '😢' },
  { type: 'PRODUCTIVE', label: 'Productive', icon: '💪' },
  { type: 'ENERGIZED', label: 'Energized', icon: '⚡' }
];

export const MOCK_CHECK_IN_HISTORY: EmotionalCheckIn[] = [
  {
    id: 'checkin-001',
    date: '2025-12-09T10:30:00',
    mood: 'GOOD',
    stressLevel: 4,
    tags: ['PRODUCTIVE', 'ENERGIZED'],
    note: 'Feeling good about completing my assignments'
  },
  {
    id: 'checkin-002',
    date: '2025-12-08T15:45:00',
    mood: 'NEUTRAL',
    stressLevel: 6,
    tags: ['OVERWHELMED'],
    note: 'Lots of deadlines coming up'
  },
  {
    id: 'checkin-003',
    date: '2025-12-07T09:00:00',
    mood: 'LOW',
    stressLevel: 7,
    tags: ['DEMOTIVATED', 'ANXIOUS'],
    note: 'Struggling with motivation today'
  }
];

export const MOCK_COMPASSION_CONVERSATION: CompassionMessage[] = [
  {
    id: 'msg-001',
    type: 'AI',
    content: "Hi there! I'm here to support you. How are you feeling today?",
    timestamp: '2025-12-09T10:00:00',
    sentiment: 'supportive'
  },
  {
    id: 'msg-002',
    type: 'USER',
    content: "I'm feeling a bit overwhelmed with all my upcoming exams.",
    timestamp: '2025-12-09T10:01:00'
  },
  {
    id: 'msg-003',
    type: 'AI',
    content: "It's completely normal to feel that way when facing multiple challenges. Remember, you've successfully navigated difficult periods before. Let's break this down together - what's the most pressing exam?",
    timestamp: '2025-12-09T10:02:00',
    sentiment: 'calming'
  },
  {
    id: 'msg-004',
    type: 'USER',
    content: "My Computer Science final in 3 days.",
    timestamp: '2025-12-09T10:03:00'
  },
  {
    id: 'msg-005',
    type: 'AI',
    content: "Great! You have a clear priority. Three days is enough time to prepare effectively if we organize your approach. Would you like me to help you create a study plan, or would you prefer to talk about managing your stress first?",
    timestamp: '2025-12-09T10:04:00',
    sentiment: 'motivational'
  }
];

export const DAILY_AFFIRMATIONS: DailyAffirmation[] = [
  {
    id: 'aff-001',
    text: "Every small step forward is progress worth celebrating",
    category: 'progress',
    icon: '🌱'
  },
  {
    id: 'aff-002',
    text: "You are stronger than you think and capable of more than you know",
    category: 'strength',
    icon: '💪'
  },
  {
    id: 'aff-003',
    text: "It's okay to take breaks. Rest is productive too",
    category: 'self-care',
    icon: '🌸'
  },
  {
    id: 'aff-004',
    text: "Challenges are temporary, but the skills you gain last forever",
    category: 'resilience',
    icon: '🛡️'
  },
  {
    id: 'aff-005',
    text: "Your worth is not measured by your productivity",
    category: 'self-care',
    icon: '💝'
  },
  {
    id: 'aff-006',
    text: "You've overcome 100% of your bad days so far",
    category: 'resilience',
    icon: '🌈'
  },
  {
    id: 'aff-007',
    text: "Learning is a journey, not a race",
    category: 'progress',
    icon: '🚶'
  },
  {
    id: 'aff-008',
    text: "You deserve compassion, especially from yourself",
    category: 'self-care',
    icon: '🤗'
  }
];

export const MOTIVATION_MEMORIES: MotivationMemory[] = [
  {
    id: 'mem-001',
    title: 'Why You Started',
    description: 'Remember: You chose this path because you wanted to build a better future for yourself and make a positive impact on the world.',
    date: '2024-08-15'
  },
  {
    id: 'mem-002',
    title: 'First Success',
    description: 'Your first A+ in Introduction to Programming - proof that hard work and persistence pay off.',
    date: '2024-09-20'
  },
  {
    id: 'mem-003',
    title: 'Breakthrough Moment',
    description: 'The day everything clicked when learning data structures. You stayed up until 2 AM, and it finally made sense.',
    date: '2024-10-12'
  }
];

export const BREATHING_EXERCISES: BreathingExercise[] = [
  {
    id: 'breath-001',
    name: '4-7-8 Relaxation',
    duration: 60,
    pattern: {
      inhale: 4,
      hold: 7,
      exhale: 8,
      pause: 0
    },
    description: 'A calming technique that helps reduce anxiety and promotes relaxation'
  },
  {
    id: 'breath-002',
    name: 'Box Breathing',
    duration: 60,
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      pause: 4
    },
    description: 'Used by athletes and military personnel to stay calm and focused'
  },
  {
    id: 'breath-003',
    name: 'Quick Calm',
    duration: 30,
    pattern: {
      inhale: 3,
      hold: 3,
      exhale: 6,
      pause: 0
    },
    description: 'A quick exercise for immediate stress relief'
  }
];

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: 'crisis-001',
    name: 'National Crisis Hotline',
    type: 'hotline',
    contact: '988',
    description: 'Free, confidential support 24/7 for people in distress',
    available: '24/7'
  },
  {
    id: 'crisis-002',
    name: 'Crisis Text Line',
    type: 'chat',
    contact: 'Text HOME to 741741',
    description: 'Free, confidential crisis support via text message',
    available: '24/7'
  },
  {
    id: 'crisis-003',
    name: 'Student Support Services',
    type: 'website',
    contact: 'support.INTELLI-LEARN.com',
    description: 'Connect with campus counselors and peer support groups',
    available: 'Mon-Fri 8AM-8PM'
  },
  {
    id: 'crisis-004',
    name: 'Anonymous Chat',
    type: 'chat',
    contact: 'chat.INTELLI-LEARN.com/anonymous',
    description: 'Talk to trained peer supporters anonymously',
    available: '24/7'
  }
];

// Helper functions
export const getTodayAffirmation = (): DailyAffirmation => {
  const today = new Date().getDate();
  return DAILY_AFFIRMATIONS[today % DAILY_AFFIRMATIONS.length];
};

export const getBreathingExercise = (intensity: 'calm' | 'moderate' | 'intense'): BreathingExercise => {
  if (intensity === 'calm') return BREATHING_EXERCISES[2];
  if (intensity === 'moderate') return BREATHING_EXERCISES[0];
  return BREATHING_EXERCISES[1];
};

export const shouldShowCrisisMode = (mood: MoodType, stress: StressLevel, tags: EmotionalTag[]): boolean => {
  if (mood === 'STRUGGLING' && stress >= 8) return true;
  if (tags.includes('BURNOUT_RISK') && stress >= 7) return true;
  return false;
};
