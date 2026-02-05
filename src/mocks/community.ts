/**
 * MOCK DATA: Community - Forums, Study Groups, Mentors, Leaderboard
 * Realistic social/community data for UI development
 */

export interface MockForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isPinned?: boolean;
  isSolved?: boolean;
}

export interface MockForumReply {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    level: number;
  };
  likes: number;
  createdAt: string;
  isLiked?: boolean;
  isBestAnswer?: boolean;
}

export interface MockStudyGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  members: number;
  maxMembers: number;
  isPublic: boolean;
  coverImage: string;
  createdBy: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  schedule?: string;
  nextMeeting?: string;
  isJoined?: boolean;
}

export interface MockMentor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  expertise: string[];
  rating: number;
  reviewCount: number;
  sessionsCompleted: number;
  bio: string;
  availability: 'available' | 'busy' | 'offline';
  hourlyRate?: number;
  languages: string[];
  isConnected?: boolean;
}

export interface MockLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  badges: number;
  isCurrentUser?: boolean;
}

// FORUM POSTS
export const MOCK_FORUM_POSTS: MockForumPost[] = [
  {
    id: 'post-001',
    title: 'How to optimize React re-renders?',
    content: 'I\'m building a large React app and noticing performance issues with unnecessary re-renders. What are the best practices for optimizing this? I\'ve tried useMemo and useCallback but still seeing issues.',
    author: {
      id: 'user-006',
      name: 'David Park',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      level: 10,
    },
    category: 'Web Development',
    tags: ['React', 'Performance', 'Optimization'],
    likes: 24,
    replies: 8,
    views: 342,
    createdAt: '2024-12-06T09:30:00Z',
    updatedAt: '2024-12-07T11:20:00Z',
    isLiked: false,
    isPinned: false,
    isSolved: true,
  },
  {
    id: 'post-002',
    title: 'Best resources for learning ML algorithms?',
    content: 'I\'m transitioning from web development to machine learning. Can anyone recommend the best courses, books, or resources for understanding ML algorithms from scratch?',
    author: {
      id: 'user-001',
      name: 'Alex Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      level: 12,
    },
    category: 'Machine Learning',
    tags: ['ML', 'Resources', 'Learning'],
    likes: 45,
    replies: 15,
    views: 890,
    createdAt: '2024-12-05T14:20:00Z',
    updatedAt: '2024-12-07T08:45:00Z',
    isLiked: true,
    isPinned: true,
    isSolved: false,
  },
  {
    id: 'post-003',
    title: 'Debugging async/await in Node.js',
    content: 'Getting weird errors with async/await in my Express API. Error says "Cannot read property of undefined" but the code looks fine. Any suggestions?',
    author: {
      id: 'user-007',
      name: 'Nina Patel',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina',
      level: 8,
    },
    category: 'Backend Development',
    tags: ['Node.js', 'Async', 'Debugging'],
    likes: 12,
    replies: 5,
    views: 198,
    createdAt: '2024-12-07T07:15:00Z',
    updatedAt: '2024-12-07T10:30:00Z',
    isLiked: false,
    isPinned: false,
    isSolved: false,
  },
  {
    id: 'post-004',
    title: 'Study group for AWS certification?',
    content: 'Anyone interested in forming a study group for AWS Solutions Architect certification? Looking to start in January 2025.',
    author: {
      id: 'user-003',
      name: 'Marcus Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      level: 9,
    },
    category: 'Certifications',
    tags: ['AWS', 'Study Group', 'Cloud'],
    likes: 31,
    replies: 12,
    views: 567,
    createdAt: '2024-12-04T16:40:00Z',
    updatedAt: '2024-12-07T09:10:00Z',
    isLiked: true,
    isPinned: false,
    isSolved: false,
  },
];

// FORUM REPLIES
export const MOCK_FORUM_REPLIES: Record<string, MockForumReply[]> = {
  'post-001': [
    {
      id: 'reply-001',
      postId: 'post-001',
      content: 'Try using React.memo() for your components and make sure you\'re not creating new object/array references in render. Also check if you\'re using the correct dependencies in useEffect.',
      author: {
        id: 'user-002',
        name: 'Priya Sharma',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        level: 15,
      },
      likes: 18,
      createdAt: '2024-12-06T10:15:00Z',
      isLiked: true,
      isBestAnswer: true,
    },
    {
      id: 'reply-002',
      postId: 'post-001',
      content: 'Also consider using the React DevTools Profiler to identify which components are re-rendering unnecessarily. It\'s a game changer!',
      author: {
        id: 'user-004',
        name: 'Sofia Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
        level: 20,
      },
      likes: 12,
      createdAt: '2024-12-06T11:30:00Z',
      isLiked: false,
      isBestAnswer: false,
    },
  ],
  'post-002': [
    {
      id: 'reply-003',
      postId: 'post-002',
      content: 'Check out Andrew Ng\'s Machine Learning course on Coursera - it\'s the gold standard. Also "Hands-On Machine Learning with Scikit-Learn" book is excellent.',
      author: {
        id: 'user-008',
        name: 'Kenji Yamamoto',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji',
        level: 18,
      },
      likes: 28,
      createdAt: '2024-12-05T15:20:00Z',
      isLiked: true,
      isBestAnswer: false,
    },
  ],
};

// STUDY GROUPS
export const MOCK_STUDY_GROUPS: MockStudyGroup[] = [
  {
    id: 'group-001',
    name: 'React Masters',
    description: 'Daily study group for mastering React, Next.js, and modern frontend development. We do code reviews, pair programming, and build projects together.',
    category: 'Web Development',
    members: 28,
    maxMembers: 50,
    isPublic: true,
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    createdBy: {
      id: 'user-004',
      name: 'Sofia Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    },
    tags: ['React', 'Next.js', 'Frontend'],
    schedule: 'Daily 7-9 PM EST',
    nextMeeting: '2024-12-08T00:00:00Z',
    isJoined: true,
  },
  {
    id: 'group-002',
    name: 'Python Data Science Club',
    description: 'Learn data science with Python. We cover NumPy, Pandas, Matplotlib, and ML libraries. Perfect for beginners and intermediate learners.',
    category: 'Data Science',
    members: 42,
    maxMembers: 60,
    isPublic: true,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    createdBy: {
      id: 'user-002',
      name: 'Priya Sharma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    },
    tags: ['Python', 'Data Science', 'ML'],
    schedule: 'Mon, Wed, Fri 6-8 PM EST',
    nextMeeting: '2024-12-09T23:00:00Z',
    isJoined: true,
  },
  {
    id: 'group-003',
    name: 'AWS Certification Prep',
    description: 'Preparing for AWS Solutions Architect certification. Study materials, practice exams, and hands-on labs.',
    category: 'Cloud',
    members: 19,
    maxMembers: 30,
    isPublic: true,
    coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&q=80',
    createdBy: {
      id: 'user-003',
      name: 'Marcus Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    },
    tags: ['AWS', 'Cloud', 'Certification'],
    schedule: 'Sat-Sun 10 AM-12 PM EST',
    nextMeeting: '2024-12-14T15:00:00Z',
    isJoined: false,
  },
  {
    id: 'group-004',
    name: 'UI/UX Design Circle',
    description: 'Design enthusiasts sharing work, getting feedback, and learning together. Focus on Figma, design systems, and user research.',
    category: 'Design',
    members: 35,
    maxMembers: 40,
    isPublic: true,
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    createdBy: {
      id: 'user-009',
      name: 'Emma Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      },
    tags: ['UI/UX', 'Figma', 'Design'],
    schedule: 'Tue, Thu 8-10 PM EST',
    isJoined: false,
  },
];

// MENTORS
export const MOCK_MENTORS: MockMentor[] = [
  {
    id: 'mentor-001',
    name: 'Dr. Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahMentor',
    title: 'Senior ML Engineer @ Google',
    expertise: ['Machine Learning', 'Python', 'TensorFlow', 'Deep Learning'],
    rating: 4.9,
    reviewCount: 127,
    sessionsCompleted: 340,
    bio: '10+ years in ML/AI. Helped 300+ students land ML jobs at top tech companies. Specializing in computer vision and NLP.',
    availability: 'available',
    hourlyRate: 80,
    languages: ['English', 'Mandarin'],
    isConnected: false,
  },
  {
    id: 'mentor-002',
    name: 'Alex Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexMentor',
    title: 'Full-Stack Developer @ Meta',
    expertise: ['React', 'Node.js', 'System Design', 'AWS'],
    rating: 4.8,
    reviewCount: 98,
    sessionsCompleted: 256,
    bio: 'Full-stack developer with expertise in scalable web applications. Former tech lead at startups, now at Meta.',
    availability: 'busy',
    hourlyRate: 70,
    languages: ['English', 'Spanish'],
    isConnected: true,
  },
  {
    id: 'mentor-003',
    name: 'Priya Gupta',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaMentor',
    title: 'UX Design Lead @ Adobe',
    expertise: ['UI/UX', 'Figma', 'Design Systems', 'User Research'],
    rating: 5.0,
    reviewCount: 64,
    sessionsCompleted: 182,
    bio: 'Award-winning designer with 8 years experience. Passionate about accessible and inclusive design.',
    availability: 'available',
    hourlyRate: 65,
    languages: ['English', 'Hindi'],
    isConnected: false,
  },
  {
    id: 'mentor-004',
    name: 'Carlos Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosMentor',
    title: 'DevOps Engineer @ Netflix',
    expertise: ['DevOps', 'Kubernetes', 'CI/CD', 'Docker', 'AWS'],
    rating: 4.7,
    reviewCount: 45,
    sessionsCompleted: 134,
    bio: 'DevOps specialist helping teams scale infrastructure. Expert in cloud architecture and automation.',
    availability: 'offline',
    hourlyRate: 75,
    languages: ['English', 'Portuguese'],
    isConnected: false,
  },
];

// LEADERBOARD
export const MOCK_LEADERBOARD: MockLeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'user-010',
    name: 'CodeNinja42',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CodeNinja',
    xp: 8750,
    level: 28,
    streak: 45,
    badges: 32,
    isCurrentUser: false,
  },
  {
    rank: 2,
    userId: 'user-011',
    name: 'PixelPerfect',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pixel',
    xp: 7890,
    level: 25,
    streak: 38,
    badges: 28,
    isCurrentUser: false,
  },
  {
    rank: 3,
    userId: 'user-004',
    name: 'Sofia Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    xp: 7230,
    level: 24,
    streak: 35,
    badges: 26,
    isCurrentUser: false,
  },
  {
    rank: 4,
    userId: 'user-012',
    name: 'DataWizard',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DataWiz',
    xp: 6540,
    level: 22,
    streak: 28,
    badges: 24,
    isCurrentUser: false,
  },
  {
    rank: 5,
    userId: 'user-002',
    name: 'Priya Sharma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    xp: 5980,
    level: 21,
    streak: 31,
    badges: 22,
    isCurrentUser: false,
  },
  // ... more entries ...
  {
    rank: 42,
    userId: 'user-001',
    name: 'Alex Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    xp: 2450,
    level: 12,
    streak: 7,
    badges: 8,
    isCurrentUser: true,
  },
];

export const getMockForumPosts = (): MockForumPost[] => {
  return MOCK_FORUM_POSTS;
};

export const getMockForumReplies = (postId: string): MockForumReply[] => {
  return MOCK_FORUM_REPLIES[postId] || [];
};

export const getMockStudyGroups = (): MockStudyGroup[] => {
  return MOCK_STUDY_GROUPS;
};

export const getMockMentors = (): MockMentor[] => {
  return MOCK_MENTORS;
};

export const getMockLeaderboard = (): MockLeaderboardEntry[] => {
  return MOCK_LEADERBOARD;
};
