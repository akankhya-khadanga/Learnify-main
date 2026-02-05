// Mock data for Smart Deadline Radar + Auto-Pace Engine
export interface DeadlineTask {
  id: string;
  title: string;
  courseName: string;
  dueDate: Date;
  estimatedHours: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  urgencyScore: number; // 0-100
  category: 'Assignment' | 'Exam' | 'Project' | 'Quiz' | 'Reading';
  completed: boolean;
}

export interface WeeklyLoad {
  day: string;
  date: string;
  hours: number;
  stressLevel: number; // 0-100
  taskCount: number;
}

export interface PaceSuggestion {
  id: string;
  taskId: string;
  taskTitle: string;
  suggestion: string;
  idealStartDate: Date;
  dailyHours: number;
  confidence: number; // 0-100
  reasoning: string;
}

export interface PacingMode {
  id: 'balanced' | 'aggressive' | 'relaxed';
  label: string;
  description: string;
  dailyHoursRange: string;
  icon: string;
}

// Mock deadline tasks
export const MOCK_DEADLINES: DeadlineTask[] = [
  {
    id: 'dl-1',
    title: 'Machine Learning Final Project',
    courseName: 'CS 4100',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    estimatedHours: 15,
    difficulty: 'Hard',
    urgencyScore: 95,
    category: 'Project',
    completed: false,
  },
  {
    id: 'dl-2',
    title: 'Calculus Problem Set 8',
    courseName: 'MATH 2210',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    estimatedHours: 4,
    difficulty: 'Medium',
    urgencyScore: 85,
    category: 'Assignment',
    completed: false,
  },
  {
    id: 'dl-3',
    title: 'Data Structures Midterm',
    courseName: 'CS 3200',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    estimatedHours: 12,
    difficulty: 'Hard',
    urgencyScore: 80,
    category: 'Exam',
    completed: false,
  },
  {
    id: 'dl-4',
    title: 'Physics Lab Report',
    courseName: 'PHYS 1210',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    estimatedHours: 6,
    difficulty: 'Medium',
    urgencyScore: 65,
    category: 'Assignment',
    completed: false,
  },
  {
    id: 'dl-5',
    title: 'English Essay Draft',
    courseName: 'ENG 2100',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
    estimatedHours: 8,
    difficulty: 'Medium',
    urgencyScore: 50,
    category: 'Assignment',
    completed: false,
  },
  {
    id: 'dl-6',
    title: 'History Reading Quiz',
    courseName: 'HIST 1500',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    estimatedHours: 2,
    difficulty: 'Easy',
    urgencyScore: 35,
    category: 'Quiz',
    completed: false,
  },
  {
    id: 'dl-7',
    title: 'Database Design Project',
    courseName: 'CS 3500',
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
    estimatedHours: 20,
    difficulty: 'Hard',
    urgencyScore: 25,
    category: 'Project',
    completed: false,
  },
];

// Mock weekly load forecast
export const MOCK_WEEKLY_LOAD: WeeklyLoad[] = [
  {
    day: 'Mon',
    date: new Date(Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: 6,
    stressLevel: 65,
    taskCount: 3,
  },
  {
    day: 'Tue',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: 8,
    stressLevel: 80,
    taskCount: 4,
  },
  {
    day: 'Wed',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: 10,
    stressLevel: 95,
    taskCount: 5,
  },
  {
    day: 'Thu',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: 7,
    stressLevel: 70,
    taskCount: 3,
  },
  {
    day: 'Fri',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: 5,
    stressLevel: 55,
    taskCount: 2,
  },
  {
    day: 'Sat',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: 4,
    stressLevel: 40,
    taskCount: 2,
  },
  {
    day: 'Sun',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: 3,
    stressLevel: 30,
    taskCount: 1,
  },
];

// Mock pace suggestions
export const MOCK_PACE_SUGGESTIONS: PaceSuggestion[] = [
  {
    id: 'ps-1',
    taskId: 'dl-1',
    taskTitle: 'Machine Learning Final Project',
    suggestion: 'Start TODAY - 7.5 hours/day required',
    idealStartDate: new Date(),
    dailyHours: 7.5,
    confidence: 92,
    reasoning: 'Only 2 days remaining. High difficulty project requires intensive focus.',
  },
  {
    id: 'ps-2',
    taskId: 'dl-2',
    taskTitle: 'Calculus Problem Set 8',
    suggestion: 'Start tomorrow - 2 hours/day recommended',
    idealStartDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    dailyHours: 2,
    confidence: 88,
    reasoning: 'Moderate difficulty. Spreading over 2 days prevents cramming.',
  },
  {
    id: 'ps-3',
    taskId: 'dl-3',
    taskTitle: 'Data Structures Midterm',
    suggestion: 'Begin review sessions - 3 hours/day for 4 days',
    idealStartDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    dailyHours: 3,
    confidence: 85,
    reasoning: 'Exam preparation benefits from spaced repetition. Start early.',
  },
  {
    id: 'ps-4',
    taskId: 'dl-4',
    taskTitle: 'Physics Lab Report',
    suggestion: 'Start in 3 days - 3 hours/day for 2 days',
    idealStartDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    dailyHours: 3,
    confidence: 90,
    reasoning: 'Optimal timing avoids conflicts with urgent tasks.',
  },
];

// Pacing modes
export const PACING_MODES: PacingMode[] = [
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Steady pace with breaks',
    dailyHoursRange: '4-6 hours/day',
    icon: '⚖️',
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    description: 'Intensive study sessions',
    dailyHoursRange: '6-10 hours/day',
    icon: '🔥',
  },
  {
    id: 'relaxed',
    label: 'Relaxed',
    description: 'Light, flexible schedule',
    dailyHoursRange: '2-4 hours/day',
    icon: '🌙',
  },
];
