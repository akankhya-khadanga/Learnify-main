/**
 * MOCK DATA: Study Planner & Tasks
 * Tasks, schedules, and Google Classroom assignments mockup
 */

export interface MockTask {
  id: string;
  name: string;
  description?: string;
  deadline: string;
  estimatedHours: number;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  category: string;
  tags: string[];
  source?: 'manual' | 'google-classroom' | 'calendar';
  sourceAssignmentId?: string;
  courseName?: string;
}

export interface MockScheduleBlock {
  id: string;
  taskId: string;
  taskName: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  type: 'study' | 'break' | 'buffer';
  isCompleted: boolean;
}

export interface MockClassroomAssignment {
  id: string;
  title: string;
  courseName: string;
  courseId: string;
  description: string;
  dueDateTime: string;
  maxPoints: number;
  submissionStatus: 'not-submitted' | 'submitted' | 'graded';
  grade?: number;
  link: string;
}

export const MOCK_TASKS: MockTask[] = [
  {
    id: 'task-001',
    name: 'Complete React Hooks Module',
    description: 'Finish watching videos and complete the practice exercises for React Hooks section',
    deadline: '2024-12-10T18:00:00Z',
    estimatedHours: 3,
    priority: 'high',
    status: 'in-progress',
    category: 'Course',
    tags: ['React', 'Web Development'],
    source: 'manual',
  },
  {
    id: 'task-002',
    name: 'Python Data Analysis Assignment',
    description: 'Analyze the NYC taxi dataset using Pandas and create visualizations',
    deadline: '2024-12-12T23:59:00Z',
    estimatedHours: 4,
    priority: 'high',
    status: 'pending',
    category: 'Assignment',
    tags: ['Python', 'Data Science'],
    source: 'google-classroom',
    sourceAssignmentId: 'gc-001',
    courseName: 'Python for Data Science',
  },
  {
    id: 'task-003',
    name: 'Review ML Algorithms',
    description: 'Go through notes on Decision Trees, Random Forests, and SVM',
    deadline: '2024-12-09T20:00:00Z',
    estimatedHours: 2,
    priority: 'medium',
    status: 'pending',
    category: 'Study',
    tags: ['ML', 'Theory'],
    source: 'manual',
  },
  {
    id: 'task-004',
    name: 'Build Portfolio Project',
    description: 'Create a full-stack MERN app showcasing React and Node.js skills',
    deadline: '2024-12-20T23:59:00Z',
    estimatedHours: 12,
    priority: 'medium',
    status: 'pending',
    category: 'Project',
    tags: ['React', 'Node.js', 'Portfolio'],
    source: 'manual',
  },
  {
    id: 'task-005',
    name: 'CSS Grid Practice',
    description: 'Complete 10 CSS Grid layout challenges',
    deadline: '2024-12-08T18:00:00Z',
    estimatedHours: 1.5,
    priority: 'low',
    status: 'completed',
    category: 'Practice',
    tags: ['CSS', 'Frontend'],
    source: 'manual',
  },
  {
    id: 'task-006',
    name: 'Database Design Quiz',
    description: 'Complete the SQL and NoSQL quiz on Google Classroom',
    deadline: '2024-12-11T23:59:00Z',
    estimatedHours: 1,
    priority: 'high',
    status: 'pending',
    category: 'Quiz',
    tags: ['Database', 'SQL'],
    source: 'google-classroom',
    sourceAssignmentId: 'gc-002',
    courseName: 'Database Systems',
  },
];

export const MOCK_SCHEDULE_BLOCKS: MockScheduleBlock[] = [
  {
    id: 'block-001',
    taskId: 'task-001',
    taskName: 'Complete React Hooks Module',
    startTime: '2024-12-08T09:00:00Z',
    endTime: '2024-12-08T10:30:00Z',
    duration: 90,
    type: 'study',
    isCompleted: false,
  },
  {
    id: 'block-002',
    taskId: 'task-001',
    taskName: 'Break',
    startTime: '2024-12-08T10:30:00Z',
    endTime: '2024-12-08T10:45:00Z',
    duration: 15,
    type: 'break',
    isCompleted: false,
  },
  {
    id: 'block-003',
    taskId: 'task-003',
    taskName: 'Review ML Algorithms',
    startTime: '2024-12-08T10:45:00Z',
    endTime: '2024-12-08T12:45:00Z',
    duration: 120,
    type: 'study',
    isCompleted: false,
  },
  {
    id: 'block-004',
    taskId: 'task-003',
    taskName: 'Lunch Break',
    startTime: '2024-12-08T12:45:00Z',
    endTime: '2024-12-08T13:45:00Z',
    duration: 60,
    type: 'break',
    isCompleted: false,
  },
  {
    id: 'block-005',
    taskId: 'task-002',
    taskName: 'Python Data Analysis Assignment',
    startTime: '2024-12-08T13:45:00Z',
    endTime: '2024-12-08T16:45:00Z',
    duration: 180,
    type: 'study',
    isCompleted: false,
  },
];

export const MOCK_CLASSROOM_ASSIGNMENTS: MockClassroomAssignment[] = [
  {
    id: 'gc-001',
    title: 'Python Data Analysis Assignment',
    courseName: 'Python for Data Science',
    courseId: 'course-ds-101',
    description: 'Analyze the NYC taxi dataset using Pandas. Create at least 5 meaningful visualizations and write a summary of your findings. Submit Jupyter notebook.',
    dueDateTime: '2024-12-12T23:59:00Z',
    maxPoints: 100,
    submissionStatus: 'not-submitted',
    link: 'https://classroom.google.com/c/fake-course-id/a/fake-assignment-1',
  },
  {
    id: 'gc-002',
    title: 'Database Design Quiz',
    courseName: 'Database Systems',
    courseId: 'course-db-201',
    description: 'Multiple choice quiz covering SQL joins, normalization, NoSQL databases, and ACID properties. 30 questions, 45 minutes time limit.',
    dueDateTime: '2024-12-11T23:59:00Z',
    maxPoints: 30,
    submissionStatus: 'not-submitted',
    link: 'https://classroom.google.com/c/fake-course-id/a/fake-quiz-1',
  },
  {
    id: 'gc-003',
    title: 'React Component Library',
    courseName: 'Advanced React',
    courseId: 'course-react-301',
    description: 'Build a reusable component library with at least 10 components. Include documentation, TypeScript types, and Storybook demos.',
    dueDateTime: '2024-12-15T23:59:00Z',
    maxPoints: 150,
    submissionStatus: 'submitted',
    grade: 142,
    link: 'https://classroom.google.com/c/fake-course-id/a/fake-assignment-2',
  },
  {
    id: 'gc-004',
    title: 'Algorithm Analysis Essay',
    courseName: 'Data Structures & Algorithms',
    courseId: 'course-algo-202',
    description: 'Write a 5-page essay comparing time and space complexity of various sorting algorithms. Include Big O analysis and practical examples.',
    dueDateTime: '2024-12-09T23:59:00Z',
    maxPoints: 50,
    submissionStatus: 'submitted',
    grade: 48,
    link: 'https://classroom.google.com/c/fake-course-id/a/fake-essay-1',
  },
];

export const MOCK_STUDY_GOALS = [
  {
    id: 'goal-001',
    title: 'Complete 5 Courses',
    current: 3,
    target: 5,
    deadline: '2024-12-31',
    category: 'courses',
  },
  {
    id: 'goal-002',
    title: '100 Hours of Study',
    current: 67,
    target: 100,
    deadline: '2024-12-31',
    category: 'time',
  },
  {
    id: 'goal-003',
    title: '30-Day Streak',
    current: 7,
    target: 30,
    deadline: '2025-01-15',
    category: 'streak',
  },
];

export const getMockTasks = (): MockTask[] => {
  return MOCK_TASKS;
};

export const getMockSchedule = (): MockScheduleBlock[] => {
  return MOCK_SCHEDULE_BLOCKS;
};

export const getMockClassroomAssignments = (): MockClassroomAssignment[] => {
  return MOCK_CLASSROOM_ASSIGNMENTS;
};

export const getMockTasksByStatus = (status: MockTask['status']): MockTask[] => {
  return MOCK_TASKS.filter(task => task.status === status);
};

export const getMockTasksByPriority = (priority: MockTask['priority']): MockTask[] => {
  return MOCK_TASKS.filter(task => task.priority === priority);
};

// Phase 22: Smart Calendar + Study Plan Data

export interface ExamEntry {
  id: string;
  subject: string;
  date: string;
  time: string;
  duration: number; // minutes
  location?: string;
  topics: string[];
  importance: 'high' | 'medium' | 'low';
  color: string;
}

export interface StudyTopic {
  id: string;
  name: string;
  estimatedHours: number;
  completed: boolean;
  subTasks: string[];
}

export interface StudyChapter {
  id: string;
  name: string;
  topics: StudyTopic[];
  totalHours: number;
}

export interface DailyStudyPlan {
  date: string;
  subjects: {
    subject: string;
    chapters: StudyChapter[];
    totalHours: number;
    color: string;
  }[];
  totalWorkload: number; // hours
}

export interface WorkloadDay {
  date: string;
  hours: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
}

export const MOCK_EXAM_TIMETABLE: ExamEntry[] = [
  {
    id: 'exam-001',
    subject: 'Data Structures & Algorithms',
    date: '2024-12-20',
    time: '09:00',
    duration: 180,
    location: 'Hall A',
    topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming'],
    importance: 'high',
    color: '#C9B458'
  },
  {
    id: 'exam-002',
    subject: 'Database Systems',
    date: '2024-12-22',
    time: '14:00',
    duration: 120,
    location: 'Hall B',
    topics: ['SQL', 'Normalization', 'Transactions', 'NoSQL', 'Indexing'],
    importance: 'high',
    color: '#C27BA0'
  },
  {
    id: 'exam-003',
    subject: 'Operating Systems',
    date: '2024-12-24',
    time: '09:00',
    duration: 180,
    location: 'Hall A',
    topics: ['Process Management', 'Memory Management', 'File Systems', 'Scheduling'],
    importance: 'medium',
    color: '#6DAEDB'
  },
  {
    id: 'exam-004',
    subject: 'Computer Networks',
    date: '2024-12-27',
    time: '14:00',
    duration: 120,
    location: 'Hall C',
    topics: ['OSI Model', 'TCP/IP', 'Routing', 'Network Security'],
    importance: 'medium',
    color: '#C9B458'
  },
  {
    id: 'exam-005',
    subject: 'Machine Learning',
    date: '2024-12-30',
    time: '09:00',
    duration: 180,
    location: 'Hall B',
    topics: ['Supervised Learning', 'Unsupervised Learning', 'Neural Networks', 'Model Evaluation'],
    importance: 'high',
    color: '#C27BA0'
  }
];

export const MOCK_DAILY_STUDY_PLANS: DailyStudyPlan[] = [
  {
    date: '2024-12-09',
    subjects: [
      {
        subject: 'Data Structures & Algorithms',
        color: '#C9B458',
        totalHours: 4,
        chapters: [
          {
            id: 'dsa-ch1',
            name: 'Arrays & Strings',
            totalHours: 2,
            topics: [
              {
                id: 'dsa-t1',
                name: 'Two Pointer Technique',
                estimatedHours: 1,
                completed: false,
                subTasks: ['Watch lecture', 'Solve 5 problems', 'Review notes']
              },
              {
                id: 'dsa-t2',
                name: 'Sliding Window',
                estimatedHours: 1,
                completed: false,
                subTasks: ['Read chapter', 'Practice examples', 'Do exercises']
              }
            ]
          },
          {
            id: 'dsa-ch2',
            name: 'Linked Lists',
            totalHours: 2,
            topics: [
              {
                id: 'dsa-t3',
                name: 'Singly Linked Lists',
                estimatedHours: 1,
                completed: false,
                subTasks: ['Implement from scratch', 'Common operations', 'Edge cases']
              },
              {
                id: 'dsa-t4',
                name: 'Doubly Linked Lists',
                estimatedHours: 1,
                completed: false,
                subTasks: ['Compare with singly', 'Implementation', 'Use cases']
              }
            ]
          }
        ]
      },
      {
        subject: 'Database Systems',
        color: '#C27BA0',
        totalHours: 3,
        chapters: [
          {
            id: 'db-ch1',
            name: 'SQL Fundamentals',
            totalHours: 3,
            topics: [
              {
                id: 'db-t1',
                name: 'Complex Joins',
                estimatedHours: 1.5,
                completed: false,
                subTasks: ['INNER JOIN examples', 'OUTER JOIN practice', 'Self joins']
              },
              {
                id: 'db-t2',
                name: 'Subqueries',
                estimatedHours: 1.5,
                completed: false,
                subTasks: ['Correlated subqueries', 'Nested SELECT', 'Performance considerations']
              }
            ]
          }
        ]
      }
    ],
    totalWorkload: 7
  },
  {
    date: '2024-12-10',
    subjects: [
      {
        subject: 'Operating Systems',
        color: '#6DAEDB',
        totalHours: 5,
        chapters: [
          {
            id: 'os-ch1',
            name: 'Process Management',
            totalHours: 3,
            topics: [
              {
                id: 'os-t1',
                name: 'Process States',
                estimatedHours: 1,
                completed: false,
                subTasks: ['State diagrams', 'Transitions', 'Examples']
              },
              {
                id: 'os-t2',
                name: 'Context Switching',
                estimatedHours: 1,
                completed: false,
                subTasks: ['Mechanism', 'Overhead', 'Optimization']
              },
              {
                id: 'os-t3',
                name: 'IPC Mechanisms',
                estimatedHours: 1,
                completed: false,
                subTasks: ['Pipes', 'Message queues', 'Shared memory']
              }
            ]
          },
          {
            id: 'os-ch2',
            name: 'CPU Scheduling',
            totalHours: 2,
            topics: [
              {
                id: 'os-t4',
                name: 'Scheduling Algorithms',
                estimatedHours: 2,
                completed: false,
                subTasks: ['FCFS, SJF, RR', 'Priority scheduling', 'Comparison']
              }
            ]
          }
        ]
      }
    ],
    totalWorkload: 5
  },
  {
    date: '2024-12-11',
    subjects: [
      {
        subject: 'Computer Networks',
        color: '#C9B458',
        totalHours: 4,
        chapters: [
          {
            id: 'cn-ch1',
            name: 'Network Layer',
            totalHours: 4,
            topics: [
              {
                id: 'cn-t1',
                name: 'IP Addressing',
                estimatedHours: 2,
                completed: false,
                subTasks: ['IPv4 vs IPv6', 'Subnetting', 'CIDR notation']
              },
              {
                id: 'cn-t2',
                name: 'Routing Protocols',
                estimatedHours: 2,
                completed: false,
                subTasks: ['RIP, OSPF, BGP', 'Distance vector', 'Link state']
              }
            ]
          }
        ]
      },
      {
        subject: 'Machine Learning',
        color: '#C27BA0',
        totalHours: 2,
        chapters: [
          {
            id: 'ml-ch1',
            name: 'Supervised Learning Basics',
            totalHours: 2,
            topics: [
              {
                id: 'ml-t1',
                name: 'Linear Regression',
                estimatedHours: 2,
                completed: false,
                subTasks: ['Theory', 'Implementation', 'Evaluation metrics']
              }
            ]
          }
        ]
      }
    ],
    totalWorkload: 6
  }
];

export const MOCK_WORKLOAD_CALENDAR: WorkloadDay[] = [
  { date: '2024-12-01', hours: 3, intensity: 'low' },
  { date: '2024-12-02', hours: 5, intensity: 'medium' },
  { date: '2024-12-03', hours: 4, intensity: 'medium' },
  { date: '2024-12-04', hours: 2, intensity: 'low' },
  { date: '2024-12-05', hours: 6, intensity: 'high' },
  { date: '2024-12-06', hours: 7, intensity: 'high' },
  { date: '2024-12-07', hours: 4, intensity: 'medium' },
  { date: '2024-12-08', hours: 3, intensity: 'low' },
  { date: '2024-12-09', hours: 7, intensity: 'high' },
  { date: '2024-12-10', hours: 5, intensity: 'medium' },
  { date: '2024-12-11', hours: 6, intensity: 'high' },
  { date: '2024-12-12', hours: 8, intensity: 'extreme' },
  { date: '2024-12-13', hours: 9, intensity: 'extreme' },
  { date: '2024-12-14', hours: 7, intensity: 'high' },
  { date: '2024-12-15', hours: 6, intensity: 'high' },
  { date: '2024-12-16', hours: 8, intensity: 'extreme' },
  { date: '2024-12-17', hours: 9, intensity: 'extreme' },
  { date: '2024-12-18', hours: 10, intensity: 'extreme' },
  { date: '2024-12-19', hours: 8, intensity: 'extreme' },
  { date: '2024-12-20', hours: 2, intensity: 'low' }, // Exam day
  { date: '2024-12-21', hours: 7, intensity: 'high' },
  { date: '2024-12-22', hours: 2, intensity: 'low' }, // Exam day
  { date: '2024-12-23', hours: 6, intensity: 'high' },
  { date: '2024-12-24', hours: 1, intensity: 'low' }, // Exam day
  { date: '2024-12-25', hours: 5, intensity: 'medium' },
  { date: '2024-12-26', hours: 8, intensity: 'extreme' },
  { date: '2024-12-27', hours: 2, intensity: 'low' }, // Exam day
  { date: '2024-12-28', hours: 9, intensity: 'extreme' },
  { date: '2024-12-29', hours: 10, intensity: 'extreme' },
  { date: '2024-12-30', hours: 1, intensity: 'low' }, // Exam day
  { date: '2024-12-31', hours: 0, intensity: 'low' }
];

export const getMockExamTimetable = (): ExamEntry[] => MOCK_EXAM_TIMETABLE;
export const getMockDailyStudyPlans = (): DailyStudyPlan[] => MOCK_DAILY_STUDY_PLANS;
export const getMockWorkloadCalendar = (): WorkloadDay[] => MOCK_WORKLOAD_CALENDAR;
