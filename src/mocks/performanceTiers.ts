/**
 * MOCK DATA: Performance Tiers System
 * Student tiering based on academic performance
 */

export type PerformanceTier = 'BEST' | 'MEDIUM' | 'WORST';
export type StudentTier = PerformanceTier;

export interface StudentTierProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currentTier: PerformanceTier;
  previousTier?: PerformanceTier;
  tierHistory: TierChange[];
  metrics: PerformanceMetrics;
  recentActivity: ActivityEvent[];
  warnings: Warning[];
  achievements: Achievement[];
  joinDate: string;
}

export interface TierChange {
  id: string;
  fromTier: PerformanceTier;
  toTier: PerformanceTier;
  date: string;
  reason: string;
  triggered: 'automatic' | 'manual';
}
export type TierHistory = TierChange;

export interface PerformanceMetrics {
  averageScore: number;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  attendanceRate: number;
  studyHoursWeek: number;
  improvementRate: number; // percentage
  rankInTier: number;
  totalInTier: number;
}

export interface ActivityEvent {
  id: string;
  type: 'exam' | 'assignment' | 'quiz' | 'study_session' | 'attendance';
  title: string;
  date: string;
  score?: number;
  maxScore?: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  impact: 'positive' | 'neutral' | 'negative';
}

export interface Warning {
  id: string;
  type: 'performance' | 'attendance' | 'deadline' | 'behavior';
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: string;
  resolved: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TierStatistics {
  tier: PerformanceTier;
  totalStudents: number;
  averageScore: number;
  promotionRate: number;
  demotionRate: number;
  retentionRate: number;
  color: string;
}

export const TIER_COLORS = {
  BEST: '#C9B458',
  MEDIUM: '#C27BA0',
  WORST: '#6DAEDB'
};

export const MOCK_STUDENT_PROFILES: StudentTierProfile[] = [
  {
    id: 'student-001',
    name: 'Alice Johnson',
    email: 'alice.j@student.edu',
    avatar: '👩‍🎓',
    currentTier: 'BEST',
    previousTier: 'MEDIUM',
    joinDate: '2024-08-20',
    metrics: {
      averageScore: 94,
      assignmentsCompleted: 48,
      assignmentsTotal: 50,
      attendanceRate: 98,
      studyHoursWeek: 28,
      improvementRate: 15,
      rankInTier: 3,
      totalInTier: 45
    },
    tierHistory: [
      {
        id: 'th-001',
        fromTier: 'MEDIUM',
        toTier: 'BEST',
        date: '2024-11-15',
        reason: 'Consistent high scores and excellent attendance',
        triggered: 'automatic'
      }
    ],
    recentActivity: [
      {
        id: 'act-001',
        type: 'exam',
        title: 'Data Structures Final',
        date: '2024-12-05',
        score: 96,
        maxScore: 100,
        status: 'excellent',
        impact: 'positive'
      },
      {
        id: 'act-002',
        type: 'assignment',
        title: 'Algorithm Analysis Project',
        date: '2024-12-03',
        score: 92,
        maxScore: 100,
        status: 'excellent',
        impact: 'positive'
      }
    ],
    warnings: [],
    achievements: [
      {
        id: 'ach-001',
        title: 'Perfect Attendance',
        description: 'Attended all classes for 3 months',
        icon: '🎯',
        date: '2024-12-01',
        rarity: 'rare'
      }
    ]
  },
  {
    id: 'student-002',
    name: 'Bob Smith',
    email: 'bob.s@student.edu',
    avatar: '👨‍💼',
    currentTier: 'MEDIUM',
    joinDate: '2024-09-01',
    metrics: {
      averageScore: 78,
      assignmentsCompleted: 42,
      assignmentsTotal: 50,
      attendanceRate: 85,
      studyHoursWeek: 18,
      improvementRate: 5,
      rankInTier: 12,
      totalInTier: 68
    },
    tierHistory: [],
    recentActivity: [
      {
        id: 'act-003',
        type: 'quiz',
        title: 'Database Systems Quiz',
        date: '2024-12-06',
        score: 75,
        maxScore: 100,
        status: 'good',
        impact: 'neutral'
      }
    ],
    warnings: [
      {
        id: 'warn-001',
        type: 'attendance',
        severity: 'medium',
        message: 'Missed 3 classes in the last 2 weeks',
        date: '2024-12-04',
        resolved: false
      }
    ],
    achievements: []
  },
  {
    id: 'student-003',
    name: 'Carol Davis',
    email: 'carol.d@student.edu',
    avatar: '👩‍🔬',
    currentTier: 'WORST',
    previousTier: 'MEDIUM',
    joinDate: '2024-08-15',
    metrics: {
      averageScore: 62,
      assignmentsCompleted: 35,
      assignmentsTotal: 50,
      attendanceRate: 72,
      studyHoursWeek: 12,
      improvementRate: -8,
      rankInTier: 8,
      totalInTier: 32
    },
    tierHistory: [
      {
        id: 'th-002',
        fromTier: 'MEDIUM',
        toTier: 'WORST',
        date: '2024-11-20',
        reason: 'Declining grades and poor attendance',
        triggered: 'automatic'
      }
    ],
    recentActivity: [
      {
        id: 'act-004',
        type: 'exam',
        title: 'Operating Systems Midterm',
        date: '2024-12-02',
        score: 58,
        maxScore: 100,
        status: 'poor',
        impact: 'negative'
      }
    ],
    warnings: [
      {
        id: 'warn-002',
        type: 'performance',
        severity: 'high',
        message: 'At risk of failing Operating Systems course',
        date: '2024-12-03',
        resolved: false
      },
      {
        id: 'warn-003',
        type: 'deadline',
        severity: 'high',
        message: '5 overdue assignments',
        date: '2024-12-05',
        resolved: false
      }
    ],
    achievements: []
  }
];

export const MOCK_TIER_STATISTICS: TierStatistics[] = [
  {
    tier: 'BEST',
    totalStudents: 45,
    averageScore: 91,
    promotionRate: 8,
    demotionRate: 2,
    retentionRate: 90,
    color: TIER_COLORS.BEST
  },
  {
    tier: 'MEDIUM',
    totalStudents: 68,
    averageScore: 76,
    promotionRate: 12,
    demotionRate: 15,
    retentionRate: 73,
    color: TIER_COLORS.MEDIUM
  },
  {
    tier: 'WORST',
    totalStudents: 32,
    averageScore: 64,
    promotionRate: 18,
    demotionRate: 5,
    retentionRate: 77,
    color: TIER_COLORS.WORST
  }
];

export const getMockStudentsByTier = (tier: PerformanceTier): StudentTierProfile[] => {
  return MOCK_STUDENT_PROFILES.filter(student => student.currentTier === tier);
};

export const getMockTierStatistics = (tier: PerformanceTier): TierStatistics | undefined => {
  return MOCK_TIER_STATISTICS.find(stats => stats.tier === tier);
};

export const getMockStudentProfile = (studentId: string): StudentTierProfile | undefined => {
  return MOCK_STUDENT_PROFILES.find(student => student.id === studentId);
};

// Convenience exports
export const performanceTiers = {
  students: MOCK_STUDENT_PROFILES,
  statistics: MOCK_TIER_STATISTICS
};

export const getStudentsByTier = getMockStudentsByTier;
export const getTierStatistics = getMockTierStatistics;
