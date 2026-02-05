/**
 * MOCK DATA: Analytics & Progress Tracking
 * Used for charts and progress visualization
 */

export interface MockAnalytics {
  userId: string;
  summary: {
    studyHours: number;
    studyHoursChange: number; // percentage change from last week
    focusScore: number; // 0-100
    focusChange: number;
    streak: number;
    completedModules: number;
  };
  weeklyTrend: Array<{
    label: string;
    hours: number;
    focus: number;
  }>;
  focusByDay: Array<{
    label: string;
    score: number;
  }>;
  subjects: Array<{
    name: string;
    hours: number;
    color: string;
  }>;
  timeBlocks: Array<{
    label: string;
    hours: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    xp: number;
    hours: number;
    completed: number;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  goals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    unit: string;
    deadline: string;
    category: string;
  }>;
}

export const MOCK_ANALYTICS: MockAnalytics = {
  userId: 'user-001',
  summary: {
    studyHours: 23.5,
    studyHoursChange: 15,
    focusScore: 87,
    focusChange: 8,
    streak: 7,
    completedModules: 12,
  },
  weeklyTrend: [
    { label: 'Mon', hours: 2.5, focus: 85 },
    { label: 'Tue', hours: 3.2, focus: 90 },
    { label: 'Wed', hours: 4.1, focus: 88 },
    { label: 'Thu', hours: 3.8, focus: 82 },
    { label: 'Fri', hours: 5.2, focus: 95 },
    { label: 'Sat', hours: 2.7, focus: 80 },
    { label: 'Sun', hours: 2.0, focus: 78 },
  ],
  focusByDay: [
    { label: 'Mon', score: 85 },
    { label: 'Tue', score: 90 },
    { label: 'Wed', score: 88 },
    { label: 'Thu', score: 82 },
    { label: 'Fri', score: 95 },
  ],
  subjects: [
    { name: 'React', hours: 8.5, color: '#61DAFB' },
    { name: 'Python', hours: 6.2, color: '#3776AB' },
    { name: 'UI/UX', hours: 4.8, color: '#FF6B6B' },
    { name: 'DevOps', hours: 3.0, color: '#326CE5' },
    { name: 'Algorithms', hours: 1.0, color: '#FFD700' },
  ],
  timeBlocks: [
    { label: 'Morning (6-12)', hours: 8.5 },
    { label: 'Afternoon (12-18)', hours: 10.2 },
    { label: 'Evening (18-24)', hours: 4.8 },
  ],
  monthlyProgress: [
    { month: 'Jul', xp: 450, hours: 28, completed: 3 },
    { month: 'Aug', xp: 680, hours: 42, completed: 5 },
    { month: 'Sep', xp: 720, hours: 51, completed: 7 },
    { month: 'Oct', xp: 520, hours: 39, completed: 4 },
    { month: 'Nov', xp: 890, hours: 58, completed: 9 },
    { month: 'Dec', xp: 320, hours: 23, completed: 2 },
  ],
  achievements: [
    {
      id: 'ach-001',
      title: 'Early Adopter',
      description: 'Joined INTELLI-LEARN in its first month',
      icon: '🌟',
      unlockedAt: '2024-09-15',
      rarity: 'rare',
    },
    {
      id: 'ach-002',
      title: '7-Day Streak',
      description: 'Studied for 7 consecutive days',
      icon: '🔥',
      unlockedAt: '2024-12-07',
      rarity: 'common',
    },
    {
      id: 'ach-003',
      title: 'Code Master',
      description: 'Completed 50 coding challenges',
      icon: '💻',
      unlockedAt: '2024-11-20',
      rarity: 'epic',
    },
    {
      id: 'ach-004',
      title: 'Community Helper',
      description: 'Helped 10 students in forums',
      icon: '🤝',
      unlockedAt: '2024-11-28',
      rarity: 'rare',
    },
  ],
  goals: [
    {
      id: 'goal-001',
      title: 'Complete React Course',
      target: 100,
      current: 45,
      unit: '%',
      deadline: '2024-12-31',
      category: 'Course',
    },
    {
      id: 'goal-002',
      title: 'Study 100 Hours',
      target: 100,
      current: 67,
      unit: 'hours',
      deadline: '2024-12-31',
      category: 'Time',
    },
    {
      id: 'goal-003',
      title: '30-Day Streak',
      target: 30,
      current: 7,
      unit: 'days',
      deadline: '2025-01-15',
      category: 'Streak',
    },
  ],
};

export const MOCK_STUDY_SESSIONS = [
  {
    id: 'session-001',
    date: '2024-12-07',
    duration: 120, // minutes
    subject: 'React',
    focusScore: 92,
    pomodoroCount: 4,
    breaks: 3,
  },
  {
    id: 'session-002',
    date: '2024-12-06',
    duration: 90,
    subject: 'Python',
    focusScore: 88,
    pomodoroCount: 3,
    breaks: 2,
  },
  {
    id: 'session-003',
    date: '2024-12-05',
    duration: 150,
    subject: 'UI/UX',
    focusScore: 95,
    pomodoroCount: 5,
    breaks: 4,
  },
];

export const MOCK_ACTIVITY_LOG = [
  {
    id: 'act-001',
    type: 'course_completed',
    title: 'Completed "React Hooks Deep Dive"',
    timestamp: '2024-12-07T10:30:00Z',
    icon: '✅',
    color: 'success',
  },
  {
    id: 'act-002',
    type: 'streak',
    title: 'Achieved 7-day streak!',
    timestamp: '2024-12-07T08:00:00Z',
    icon: '🔥',
    color: 'warning',
  },
  {
    id: 'act-003',
    type: 'quiz_passed',
    title: 'Passed "Python Basics Quiz" with 95%',
    timestamp: '2024-12-06T16:20:00Z',
    icon: '🎯',
    color: 'info',
  },
  {
    id: 'act-004',
    type: 'level_up',
    title: 'Level up! Now Level 12',
    timestamp: '2024-12-05T14:15:00Z',
    icon: '⬆️',
    color: 'primary',
  },
  {
    id: 'act-005',
    type: 'forum_reply',
    title: 'Received 5 likes on forum post',
    timestamp: '2024-12-04T11:45:00Z',
    icon: '👍',
    color: 'secondary',
  },
];

export const getMockAnalytics = (): MockAnalytics => {
  return MOCK_ANALYTICS;
};
