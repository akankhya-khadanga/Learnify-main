/**
 * MOCK DATA: User Profiles
 * Used for UI development before backend integration
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  joinedDate: string;
  bio?: string;
  badges: string[];
  courses: number;
  completedCourses: number;
  studyHours: number;
  rank: number;
}

export const MOCK_CURRENT_USER: MockUser = {
  id: 'user-001',
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  xp: 2450,
  level: 12,
  streak: 7,
  joinedDate: '2024-09-15',
  bio: 'Full-stack developer learning AI and machine learning. Passionate about building scalable systems.',
  badges: ['Early Adopter', '7-Day Streak', 'Code Master', 'Community Helper'],
  courses: 8,
  completedCourses: 3,
  studyHours: 147,
  rank: 42,
};

export const MOCK_USERS: MockUser[] = [
  MOCK_CURRENT_USER,
  {
    id: 'user-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    xp: 3200,
    level: 15,
    streak: 14,
    joinedDate: '2024-08-01',
    bio: 'Data scientist exploring deep learning and NLP',
    badges: ['Top Learner', '14-Day Streak', 'AI Pioneer', 'Mentor'],
    courses: 12,
    completedCourses: 7,
    studyHours: 203,
    rank: 15,
  },
  {
    id: 'user-003',
    name: 'Marcus Johnson',
    email: 'marcus.j@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    xp: 1800,
    level: 9,
    streak: 3,
    joinedDate: '2024-10-20',
    bio: 'Cybersecurity enthusiast learning ethical hacking',
    badges: ['Security Expert', 'Fast Learner'],
    courses: 5,
    completedCourses: 2,
    studyHours: 89,
    rank: 78,
  },
  {
    id: 'user-004',
    name: 'Sofia Rodriguez',
    email: 'sofia.r@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    xp: 4500,
    level: 20,
    streak: 28,
    joinedDate: '2024-06-10',
    bio: 'UX Designer mastering web development and React',
    badges: ['Design Guru', '30-Day Streak', 'Community Leader', 'Top Contributor'],
    courses: 15,
    completedCourses: 11,
    studyHours: 312,
    rank: 8,
  },
  {
    id: 'user-005',
    name: 'Yuki Tanaka',
    email: 'yuki.t@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki',
    xp: 2900,
    level: 14,
    streak: 10,
    joinedDate: '2024-07-22',
    bio: 'Game developer learning Unity and C#',
    badges: ['Game Dev', '10-Day Streak', 'Creative Mind'],
    courses: 9,
    completedCourses: 5,
    studyHours: 178,
    rank: 25,
  },
];

export const getMockUser = (id: string): MockUser | undefined => {
  return MOCK_USERS.find(user => user.id === id);
};

export const getMockCurrentUser = (): MockUser => {
  return MOCK_CURRENT_USER;
};
