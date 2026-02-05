/**
 * MOCK DATA: Roadmaps
 * Learning roadmaps with milestones and resources
 */

export interface MockRoadmap {
  id: string;
  title: string;
  description: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  progress: number; // 0-100
  createdAt: string;
  milestones: MockMilestone[];
  category: string;
  tags: string[];
  source?: 'ai' | 'template' | 'custom'; // Track roadmap origin
  isAIGenerated?: boolean; // Deprecated: use source instead
}

export interface MockMilestone {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
  completed: boolean;
  resources: MockResource[];
  skills: string[];
  order: number;
}

export interface MockResource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'course' | 'book' | 'practice';
  url: string;
  duration?: string;
  isFree: boolean;
  completed?: boolean; // Track resource completion
  description?: string; // Resource description
}

export const MOCK_ROADMAPS: MockRoadmap[] = [
  {
    id: 'roadmap-001',
    title: 'Full-Stack Web Developer',
    description: 'Complete roadmap to become a full-stack web developer using MERN stack',
    goal: 'Build and deploy full-stack web applications',
    difficulty: 'beginner',
    estimatedDuration: '6 months',
    progress: 35,
    createdAt: '2024-10-01',
    category: 'Web Development',
    tags: ['MERN', 'Full-Stack', 'JavaScript'],
    milestones: [
      {
        id: 'milestone-001',
        title: 'HTML & CSS Fundamentals',
        description: 'Master the basics of HTML5 and CSS3, including semantic HTML, flexbox, and grid',
        difficulty: 'easy',
        estimatedHours: 40,
        completed: true,
        skills: ['HTML5', 'CSS3', 'Flexbox', 'Grid', 'Responsive Design'],
        order: 1,
        resources: [
          {
            id: 'res-001',
            title: 'MDN HTML Docs',
            type: 'article',
            url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
            isFree: true,
          },
          {
            id: 'res-002',
            title: 'CSS Grid Complete Guide',
            type: 'article',
            url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
            isFree: true,
          },
        ],
      },
      {
        id: 'milestone-002',
        title: 'JavaScript Essentials',
        description: 'Learn JavaScript fundamentals, ES6+ features, async programming, and DOM manipulation',
        difficulty: 'medium',
        estimatedHours: 60,
        completed: true,
        skills: ['JavaScript', 'ES6+', 'Async/Await', 'DOM', 'Fetch API'],
        order: 2,
        resources: [
          {
            id: 'res-003',
            title: 'JavaScript.info',
            type: 'article',
            url: 'https://javascript.info/',
            isFree: true,
          },
          {
            id: 'res-004',
            title: 'You Don\'t Know JS',
            type: 'book',
            url: 'https://github.com/getify/You-Dont-Know-JS',
            isFree: true,
          },
        ],
      },
      {
        id: 'milestone-003',
        title: 'React Fundamentals',
        description: 'Build modern UIs with React including hooks, component patterns, and state management',
        difficulty: 'medium',
        estimatedHours: 50,
        completed: false,
        skills: ['React', 'JSX', 'Hooks', 'Component Design', 'State Management'],
        order: 3,
        resources: [
          {
            id: 'res-005',
            title: 'React Official Docs',
            type: 'article',
            url: 'https://react.dev/',
            isFree: true,
          },
          {
            id: 'res-006',
            title: 'React Course',
            type: 'course',
            url: '#',
            duration: '10 hours',
            isFree: true,
          },
        ],
      },
      {
        id: 'milestone-004',
        title: 'Node.js & Express',
        description: 'Create RESTful APIs with Node.js and Express, handle authentication, and connect to databases',
        difficulty: 'medium',
        estimatedHours: 45,
        completed: false,
        skills: ['Node.js', 'Express', 'REST API', 'Middleware', 'JWT'],
        order: 4,
        resources: [],
      },
      {
        id: 'milestone-005',
        title: 'MongoDB & Databases',
        description: 'Design schemas, perform CRUD operations, and understand database relationships',
        difficulty: 'medium',
        estimatedHours: 35,
        completed: false,
        skills: ['MongoDB', 'Mongoose', 'Database Design', 'Aggregation'],
        order: 5,
        resources: [],
      },
      {
        id: 'milestone-006',
        title: 'Full-Stack Integration',
        description: 'Connect frontend and backend, implement authentication, and build complete features',
        difficulty: 'hard',
        estimatedHours: 60,
        completed: false,
        skills: ['Full-Stack', 'Authentication', 'State Management', 'API Integration'],
        order: 6,
        resources: [],
      },
      {
        id: 'milestone-007',
        title: 'Deployment & DevOps',
        description: 'Deploy applications to production using Vercel, Heroku, or AWS',
        difficulty: 'medium',
        estimatedHours: 20,
        completed: false,
        skills: ['Deployment', 'CI/CD', 'Docker', 'Cloud Hosting'],
        order: 7,
        resources: [],
      },
    ],
  },
  {
    id: 'roadmap-002',
    title: 'Data Science with Python',
    description: 'Learn data analysis, visualization, and machine learning with Python',
    goal: 'Analyze data and build ML models',
    difficulty: 'intermediate',
    estimatedDuration: '8 months',
    progress: 20,
    createdAt: '2024-11-01',
    category: 'Data Science',
    tags: ['Python', 'ML', 'Data Analysis'],
    milestones: [
      {
        id: 'milestone-008',
        title: 'Python Programming',
        description: 'Master Python syntax, data structures, and OOP concepts',
        difficulty: 'easy',
        estimatedHours: 40,
        completed: true,
        skills: ['Python', 'Data Structures', 'OOP', 'Functions'],
        order: 1,
        resources: [],
      },
      {
        id: 'milestone-009',
        title: 'NumPy & Pandas',
        description: 'Data manipulation and analysis with NumPy and Pandas',
        difficulty: 'medium',
        estimatedHours: 35,
        completed: false,
        skills: ['NumPy', 'Pandas', 'Data Cleaning', 'Data Analysis'],
        order: 2,
        resources: [],
      },
      {
        id: 'milestone-010',
        title: 'Data Visualization',
        description: 'Create insightful visualizations with Matplotlib and Seaborn',
        difficulty: 'medium',
        estimatedHours: 25,
        completed: false,
        skills: ['Matplotlib', 'Seaborn', 'Plotly', 'Visualization'],
        order: 3,
        resources: [],
      },
      {
        id: 'milestone-011',
        title: 'Statistics & Probability',
        description: 'Essential statistical concepts for data science',
        difficulty: 'hard',
        estimatedHours: 50,
        completed: false,
        skills: ['Statistics', 'Probability', 'Hypothesis Testing', 'A/B Testing'],
        order: 4,
        resources: [],
      },
      {
        id: 'milestone-012',
        title: 'Machine Learning Fundamentals',
        description: 'Learn ML algorithms with Scikit-learn',
        difficulty: 'hard',
        estimatedHours: 70,
        completed: false,
        skills: ['Scikit-learn', 'ML Algorithms', 'Model Evaluation', 'Feature Engineering'],
        order: 5,
        resources: [],
      },
    ],
  },
  {
    id: 'roadmap-003',
    title: 'UI/UX Designer',
    description: 'Become a professional UI/UX designer',
    goal: 'Design beautiful and user-friendly interfaces',
    difficulty: 'beginner',
    estimatedDuration: '4 months',
    progress: 60,
    createdAt: '2024-09-15',
    category: 'Design',
    tags: ['UI/UX', 'Figma', 'Design Thinking'],
    milestones: [
      {
        id: 'milestone-013',
        title: 'Design Fundamentals',
        description: 'Learn color theory, typography, and layout principles',
        difficulty: 'easy',
        estimatedHours: 30,
        completed: true,
        skills: ['Color Theory', 'Typography', 'Layout', 'Composition'],
        order: 1,
        resources: [],
      },
      {
        id: 'milestone-014',
        title: 'Figma Mastery',
        description: 'Master Figma for UI design and prototyping',
        difficulty: 'easy',
        estimatedHours: 25,
        completed: true,
        skills: ['Figma', 'Prototyping', 'Components', 'Auto Layout'],
        order: 2,
        resources: [],
      },
      {
        id: 'milestone-015',
        title: 'User Research',
        description: 'Conduct user interviews, surveys, and usability testing',
        difficulty: 'medium',
        estimatedHours: 35,
        completed: true,
        skills: ['User Research', 'Interviews', 'Surveys', 'Usability Testing'],
        order: 3,
        resources: [],
      },
      {
        id: 'milestone-016',
        title: 'Wireframing & Prototyping',
        description: 'Create wireframes and interactive prototypes',
        difficulty: 'medium',
        estimatedHours: 30,
        completed: false,
        skills: ['Wireframing', 'Prototyping', 'User Flows', 'Information Architecture'],
        order: 4,
        resources: [],
      },
    ],
  },
];

export const getMockRoadmaps = (): MockRoadmap[] => {
  return MOCK_ROADMAPS;
};

export const getMockRoadmap = (id: string): MockRoadmap | undefined => {
  return MOCK_ROADMAPS.find(roadmap => roadmap.id === id);
};

export const getMockRoadmapsByCategory = (category: string): MockRoadmap[] => {
  return MOCK_ROADMAPS.filter(roadmap => roadmap.category === category);
};
