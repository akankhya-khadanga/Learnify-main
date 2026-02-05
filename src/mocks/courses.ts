/**
 * MOCK DATA: Courses
 * Realistic course data for UI development
 */

export interface MockCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  thumbnail: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string; // e.g., "6 weeks", "40 hours"
  rating: number;
  reviews: number;  // Changed from reviewCount to match CourseDetail
  enrolledStudents: number;  // Changed from enrolled to match CourseDetail
  lessonsCount: number;  // Added to match CourseDetail
  price: number; // 0 for free
  tags: string[];
  modules: CourseModule[];
  language: string;
  lastUpdated: string;
  skills: string[];
  prerequisites?: string[];
  isEnrolled?: boolean;
  progress?: number; // 0-100
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  duration: string; // "45 min", "2 hours"
  lessons: CourseLesson[];
  quiz?: boolean;
  assignment?: boolean;
}

export interface CourseLesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';
  duration: string;
  completed?: boolean;
  videoUrl?: string;
  content?: string;
}

export const MOCK_COURSES: MockCourse[] = [
  {
    id: 'course-001',
    title: 'Complete React Developer Course 2024',
    description: 'Master React from basics to advanced concepts including Hooks, Context API, Redux, Next.js, and deployment. Build 12+ real-world projects.',
    instructor: 'Sarah Johnson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    category: 'Web Development',
    difficulty: 'intermediate',
    duration: '8 weeks',
    rating: 4.8,
    reviews: 2847,
    enrolledStudents: 45230,
    lessonsCount: 3,  // 3 lessons in module 1
    price: 0,
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    language: 'English',
    lastUpdated: '2024-11-20',
    skills: ['React', 'Hooks', 'Redux', 'Next.js', 'TypeScript'],
    prerequisites: ['Basic JavaScript', 'HTML & CSS'],
    isEnrolled: true,
    progress: 45,
    modules: [
      {
        id: 'mod-001',
        title: 'React Fundamentals',
        description: 'Learn the core concepts of React including components, props, and state',
        duration: '6 hours',
        lessons: [
          { id: 'lesson-001', title: 'Introduction to React', type: 'video', duration: '15 min', completed: true },
          { id: 'lesson-002', title: 'Components & Props', type: 'video', duration: '25 min', completed: true },
          { id: 'lesson-003', title: 'State Management', type: 'video', duration: '30 min', completed: false },
        ],
        quiz: true,
      },
      {
        id: 'mod-002',
        title: 'Advanced React Patterns',
        description: 'Master advanced patterns including Hooks, Context, and custom hooks',
        duration: '8 hours',
        lessons: [
          { id: 'lesson-004', title: 'React Hooks Deep Dive', type: 'video', duration: '40 min', completed: false },
          { id: 'lesson-005', title: 'Context API', type: 'video', duration: '35 min', completed: false },
        ],
        quiz: true,
        assignment: true,
      },
    ],
  },
  {
    id: 'course-002',
    title: 'Python for Data Science & Machine Learning',
    description: 'Complete Python course covering NumPy, Pandas, Matplotlib, Scikit-learn, TensorFlow, and real ML projects.',
    instructor: 'Dr. Rahul Mehta',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    category: 'Data Science',
    difficulty: 'intermediate',
    duration: '10 weeks',
    rating: 4.9,
    reviews: 5621,
    enrolledStudents: 78450,
    lessonsCount: 1,  // 1 lesson in module 1
    price: 0,
    tags: ['Python', 'Machine Learning', 'Data Science', 'AI'],
    language: 'English',
    lastUpdated: '2024-12-01',
    skills: ['Python', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow'],
    prerequisites: ['Basic Programming'],
    isEnrolled: true,
    progress: 20,
    modules: [
      {
        id: 'mod-003',
        title: 'Python Essentials',
        description: 'Core Python programming concepts',
        duration: '5 hours',
        lessons: [
          { id: 'lesson-006', title: 'Python Basics', type: 'video', duration: '20 min', completed: true },
        ],
        quiz: true,
      },
    ],
  },
  {
    id: 'course-003',
    title: 'Full-Stack Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, Node.js, Express, MongoDB, and React. Build and deploy full-stack applications.',
    instructor: 'Michael Chen',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
    category: 'Web Development',
    difficulty: 'beginner',
    duration: '12 weeks',
    rating: 4.7,
    reviews: 3921,
    enrolledStudents: 52100,
    lessonsCount: 0,  // No modules/lessons yet
    price: 0,
    tags: ['Full Stack', 'MERN', 'JavaScript', 'Node.js'],
    language: 'English',
    lastUpdated: '2024-11-15',
    skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
    isEnrolled: false,
    modules: [],
  },
  {
    id: 'course-004',
    title: 'UI/UX Design Masterclass',
    description: 'Master user interface and user experience design using Figma. Learn design thinking, wireframing, prototyping, and user research.',
    instructor: 'Emma Wilson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    category: 'Design',
    difficulty: 'beginner',
    duration: '6 weeks',
    rating: 4.9,
    reviews: 1834,
    enrolledStudents: 28900,
    lessonsCount: 0,  // No modules/lessons yet
    price: 0,
    tags: ['UI/UX', 'Figma', 'Design', 'Prototyping'],
    language: 'English',
    lastUpdated: '2024-11-28',
    skills: ['Figma', 'UI Design', 'UX Research', 'Wireframing', 'Prototyping'],
    isEnrolled: true,
    progress: 60,
    modules: [],
  },
  {
    id: 'course-005',
    title: 'DevOps & Cloud Computing with AWS',
    description: 'Learn DevOps practices, CI/CD pipelines, Docker, Kubernetes, and AWS cloud services. Deploy scalable applications.',
    instructor: 'James Anderson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&q=80',
    category: 'DevOps',
    difficulty: 'advanced',
    duration: '10 weeks',
    rating: 4.6,
    reviews: 1245,
    enrolledStudents: 15670,
    lessonsCount: 0,  // No modules/lessons yet
    price: 0,
    tags: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    language: 'English',
    lastUpdated: '2024-12-05',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    prerequisites: ['Linux Basics', 'Git', 'Cloud Fundamentals'],
    isEnrolled: false,
    modules: [],
  },
  {
    id: 'course-006',
    title: 'Cybersecurity Fundamentals',
    description: 'Introduction to cybersecurity concepts, network security, cryptography, ethical hacking, and security best practices.',
    instructor: 'Dr. Lisa Kumar',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&q=80',
    category: 'Security',
    difficulty: 'beginner',
    duration: '8 weeks',
    rating: 4.8,
    reviews: 987,
    enrolledStudents: 12340,
    lessonsCount: 0,  // No modules/lessons yet
    price: 0,
    tags: ['Cybersecurity', 'Ethical Hacking', 'Network Security'],
    language: 'English',
    lastUpdated: '2024-11-10',
    skills: ['Network Security', 'Cryptography', 'Penetration Testing', 'Security Tools'],
    isEnrolled: false,
    modules: [],
  },
  // External Courses - Now with real content!
  {
    id: 'ext-1',
    title: 'Python Programming for Beginners',
    description: 'Learn Python from scratch. Master variables, loops, functions, and object-oriented programming. Build real-world projects and applications.',
    instructor: 'John Smith',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&q=80',
    category: 'Programming',
    difficulty: 'beginner',
    duration: '8 weeks',
    rating: 4.7,
    reviews: 125,
    enrolledStudents: 125000,
    lessonsCount: 12,
    price: 0,
    tags: ['Python', 'Programming', 'Beginner', 'Coding'],
    language: 'English',
    lastUpdated: '2024-12-01',
    skills: ['Python Basics', 'OOP', 'Data Structures', 'File Handling', 'Problem Solving'],
    prerequisites: [],
    isEnrolled: false,
    modules: [
      {
        id: 'py-mod-001',
        title: 'Python Fundamentals',
        description: 'Learn the basics of Python programming',
        duration: '3 hours',
        lessons: [
          { id: 'py-l-001', title: 'Introduction to Python', type: 'video', duration: '15 min' },
          { id: 'py-l-002', title: 'Variables and Data Types', type: 'video', duration: '20 min' },
          { id: 'py-l-003', title: 'Basic Operations', type: 'coding', duration: '25 min' },
          { id: 'py-l-004', title: 'Python Basics Quiz', type: 'quiz', duration: '10 min' },
        ],
        quiz: true,
      },
      {
        id: 'py-mod-002',
        title: 'Control Flow',
        description: 'Master if statements, loops, and conditionals',
        duration: '4 hours',
        lessons: [
          { id: 'py-l-005', title: 'If Statements', type: 'video', duration: '20 min' },
          { id: 'py-l-006', title: 'For Loops', type: 'video', duration: '25 min' },
          { id: 'py-l-007', title: 'While Loops', type: 'video', duration: '20 min' },
          { id: 'py-l-008', title: 'Loop Exercises', type: 'coding', duration: '30 min' },
        ],
        quiz: true,
      },
      {
        id: 'py-mod-003',
        title: 'Functions and Modules',
        description: 'Learn to write reusable code with functions',
        duration: '5 hours',
        lessons: [
          { id: 'py-l-009', title: 'Defining Functions', type: 'video', duration: '25 min' },
          { id: 'py-l-010', title: 'Function Parameters', type: 'video', duration: '30 min' },
          { id: 'py-l-011', title: 'Lambda Functions', type: 'video', duration: '20 min' },
          { id: 'py-l-012', title: 'Modules and Packages', type: 'reading', duration: '25 min' },
        ],
        quiz: true,
      },
    ],
  },
  {
    id: 'ext-2',
    title: 'JavaScript Mastery: From Zero to Hero',
    description: 'Complete JavaScript course covering ES6+, async/await, DOM manipulation, and modern frameworks. Build interactive web applications.',
    instructor: 'Sarah Johnson',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80',
    category: 'Web Development',
    difficulty: 'intermediate',
    duration: '10 weeks',
    rating: 4.8,
    reviews: 98,
    enrolledStudents: 98000,
    lessonsCount: 13,
    price: 0,
    tags: ['JavaScript', 'ES6', 'Web Development', 'Frontend'],
    language: 'English',
    lastUpdated: '2024-11-25',
    skills: ['JavaScript', 'ES6+', 'DOM Manipulation', 'Async Programming', 'API Integration'],
    prerequisites: ['Basic HTML & CSS'],
    isEnrolled: false,
    modules: [
      {
        id: 'js-mod-001',
        title: 'JavaScript Basics',
        description: 'Foundation of JavaScript programming',
        duration: '4 hours',
        lessons: [
          { id: 'js-l-001', title: 'JavaScript Introduction', type: 'video', duration: '20 min' },
          { id: 'js-l-002', title: 'Variables and Constants', type: 'video', duration: '25 min' },
          { id: 'js-l-003', title: 'Data Types and Operators', type: 'video', duration: '30 min' },
          { id: 'js-l-004', title: 'Practice: Basic JS', type: 'coding', duration: '35 min' },
        ],
        quiz: true,
      },
      {
        id: 'js-mod-002',
        title: 'ES6+ Features',
        description: 'Modern JavaScript features',
        duration: '6 hours',
        lessons: [
          { id: 'js-l-005', title: 'Arrow Functions', type: 'video', duration: '25 min' },
          { id: 'js-l-006', title: 'Destructuring', type: 'video', duration: '20 min' },
          { id: 'js-l-007', title: 'Spread and Rest', type: 'video', duration: '25 min' },
          { id: 'js-l-008', title: 'Template Literals', type: 'video', duration: '15 min' },
          { id: 'js-l-009', title: 'ES6 Practice', type: 'coding', duration: '40 min' },
        ],
        quiz: true,
      },
      {
        id: 'js-mod-003',
        title: 'Async JavaScript',
        description: 'Promises, async/await, and API calls',
        duration: '5 hours',
        lessons: [
          { id: 'js-l-010', title: 'Callbacks', type: 'video', duration: '20 min' },
          { id: 'js-l-011', title: 'Promises', type: 'video', duration: '30 min' },
          { id: 'js-l-012', title: 'Async/Await', type: 'video', duration: '25 min' },
          { id: 'js-l-013', title: 'Fetch API', type: 'video', duration: '30 min' },
        ],
        quiz: true,
        assignment: true,
      },
    ],
  },
  {
    id: 'ext-3',
    title: 'React.js Complete Guide',
    description: 'Master React.js with hooks, context API, routing, and state management. Build scalable single-page applications.',
    instructor: 'Mike Chen',
    instructorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    category: 'Web Development',
    difficulty: 'intermediate',
    duration: '12 weeks',
    rating: 4.9,
    reviews: 87,
    enrolledStudents: 87000,
    lessonsCount: 14,
    price: 0,
    tags: ['React', 'Hooks', 'Context API', 'Frontend', 'SPA'],
    language: 'English',
    lastUpdated: '2024-12-10',
    skills: ['React', 'Hooks', 'Context API', 'React Router', 'State Management'],
    prerequisites: ['JavaScript', 'ES6 Basics'],
    isEnrolled: false,
    modules: [
      {
        id: 'react-mod-001',
        title: 'React Basics',
        description: 'Introduction to React and JSX',
        duration: '5 hours',
        lessons: [
          { id: 'react-l-001', title: 'What is React?', type: 'video', duration: '20 min' },
          { id: 'react-l-002', title: 'JSX Fundamentals', type: 'video', duration: '25 min' },
          { id: 'react-l-003', title: 'Components', type: 'video', duration: '30 min' },
          { id: 'react-l-004', title: 'Props', type: 'video', duration: '25 min' },
          { id: 'react-l-005', title: 'First React App', type: 'coding', duration: '35 min' },
        ],
        quiz: true,
      },
      {
        id: 'react-mod-002',
        title: 'React Hooks',
        description: 'Master useState, useEffect, and more',
        duration: '7 hours',
        lessons: [
          { id: 'react-l-006', title: 'useState Hook', type: 'video', duration: '30 min' },
          { id: 'react-l-007', title: 'useEffect Hook', type: 'video', duration: '35 min' },
          { id: 'react-l-008', title: 'useContext Hook', type: 'video', duration: '30 min' },
          { id: 'react-l-009', title: 'Custom Hooks', type: 'video', duration: '40 min' },
          { id: 'react-l-010', title: 'Hooks Practice', type: 'coding', duration: '45 min' },
        ],
        quiz: true,
        assignment: true,
      },
      {
        id: 'react-mod-003',
        title: 'State Management',
        description: 'Context API and advanced state patterns',
        duration: '6 hours',
        lessons: [
          { id: 'react-l-011', title: 'Context API Deep Dive', type: 'video', duration: '35 min' },
          { id: 'react-l-012', title: 'useReducer Hook', type: 'video', duration: '30 min' },
          { id: 'react-l-013', title: 'State Management Patterns', type: 'reading', duration: '25 min' },
          { id: 'react-l-014', title: 'Building with Context', type: 'coding', duration: '50 min' },
        ],
        quiz: true,
      },
    ],
  },
];

export const getMockCourse = (id: string): MockCourse | undefined => {
  return MOCK_COURSES.find(course => course.id === id);
};

export const getMockEnrolledCourses = (): MockCourse[] => {
  return MOCK_COURSES.filter(course => course.isEnrolled);
};

export const getMockCoursesByCategory = (category: string): MockCourse[] => {
  return MOCK_COURSES.filter(course => course.category === category);
};

export const getMockCoursesByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): MockCourse[] => {
  return MOCK_COURSES.filter(course => course.difficulty === difficulty);
};
