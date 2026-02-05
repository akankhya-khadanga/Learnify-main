export interface VerifiedSource {
  id: string;
  title: string;
  type: 'lecture_notes' | 'textbook' | 'research_paper' | 'course_material' | 'instructor_upload';
  uploadedBy: string;
  uploadDate: string;
  pageCount?: number;
  verified: boolean;
  active: boolean;
}

export interface Citation {
  sourceId: string;
  sourceTitle: string;
  page?: number;
  section?: string;
  confidence: number; // 0-100
  quote?: string;
}

export interface VerifiedAIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  hallucinationCheck?: {
    passed: boolean;
    confidence: number;
    flags: string[];
  };
  reasoning?: {
    confidenceScore: number;
    sourcesConsulted: string[];
    methodology: string;
  };
}

export interface CourseInfo {
  id: string;
  name: string;
  instructor: string;
  verified: boolean;
}

// Mock verified sources
export const MOCK_VERIFIED_SOURCES: VerifiedSource[] = [
  {
    id: 'src-1',
    title: 'React Hooks - Official Documentation',
    type: 'course_material',
    uploadedBy: 'Prof. Sarah Chen',
    uploadDate: '2024-01-15',
    pageCount: 45,
    verified: true,
    active: true,
  },
  {
    id: 'src-2',
    title: 'Modern JavaScript Patterns (2024)',
    type: 'textbook',
    uploadedBy: 'Prof. Sarah Chen',
    uploadDate: '2024-01-10',
    pageCount: 320,
    verified: true,
    active: true,
  },
  {
    id: 'src-3',
    title: 'Component Lifecycle Lecture Notes',
    type: 'lecture_notes',
    uploadedBy: 'Prof. Sarah Chen',
    uploadDate: '2024-02-01',
    pageCount: 12,
    verified: true,
    active: true,
  },
  {
    id: 'src-4',
    title: 'State Management Best Practices',
    type: 'research_paper',
    uploadedBy: 'Prof. Sarah Chen',
    uploadDate: '2024-01-20',
    pageCount: 18,
    verified: true,
    active: false,
  },
  {
    id: 'src-5',
    title: 'Advanced React Patterns Workshop',
    type: 'instructor_upload',
    uploadedBy: 'Prof. Sarah Chen',
    uploadDate: '2024-02-10',
    pageCount: 67,
    verified: true,
    active: true,
  },
];

// Mock verified conversation
export const MOCK_VERIFIED_CONVERSATION: VerifiedAIMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'What are React Hooks and why should I use them?',
    timestamp: '2024-12-08T10:00:00Z',
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'React Hooks are functions that let you use state and other React features in functional components. According to the official documentation, Hooks were introduced in React 16.8 to solve several problems: they let you reuse stateful logic without changing your component hierarchy, and they let you split one component into smaller functions based on related pieces.',
    timestamp: '2024-12-08T10:00:05Z',
    citations: [
      {
        sourceId: 'src-1',
        sourceTitle: 'React Hooks - Official Documentation',
        page: 3,
        section: 'Introduction to Hooks',
        confidence: 95,
        quote: 'Hooks let you use state and other React features without writing a class.',
      },
      {
        sourceId: 'src-3',
        sourceTitle: 'Component Lifecycle Lecture Notes',
        page: 5,
        confidence: 88,
        quote: 'Hooks solve the problem of reusing stateful logic between components.',
      },
    ],
    hallucinationCheck: {
      passed: true,
      confidence: 95,
      flags: [],
    },
    reasoning: {
      confidenceScore: 95,
      sourcesConsulted: ['src-1', 'src-3'],
      methodology: 'Direct citation from official React documentation and lecture notes. Cross-referenced version information and feature introduction timeline.',
    },
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'Can you explain the useState hook with an example?',
    timestamp: '2024-12-08T10:01:00Z',
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'The useState hook is the most basic Hook for adding state to functional components. It returns a pair: the current state value and a function to update it. Here\'s a simple example:\n\n```javascript\nconst [count, setCount] = useState(0);\n```\n\nThis declares a state variable called "count" initialized to 0, and "setCount" is the function to update it. You can call setCount(newValue) to change the state, which will trigger a re-render.',
    timestamp: '2024-12-08T10:01:08Z',
    citations: [
      {
        sourceId: 'src-1',
        sourceTitle: 'React Hooks - Official Documentation',
        page: 7,
        section: 'Using the State Hook',
        confidence: 98,
        quote: 'useState returns a pair of values: the current state and a function that updates it.',
      },
      {
        sourceId: 'src-2',
        sourceTitle: 'Modern JavaScript Patterns (2024)',
        page: 156,
        confidence: 92,
        quote: 'Array destructuring allows us to give different names to the state variables.',
      },
    ],
    hallucinationCheck: {
      passed: true,
      confidence: 98,
      flags: [],
    },
    reasoning: {
      confidenceScore: 98,
      sourcesConsulted: ['src-1', 'src-2'],
      methodology: 'Combined official documentation example with modern JavaScript pattern explanation. Code example verified against React 18.x standards.',
    },
  },
];

// Mock course info
export const MOCK_COURSE_INFO: CourseInfo = {
  id: 'react-fundamentals-2024',
  name: 'React Fundamentals 2024',
  instructor: 'Prof. Sarah Chen',
  verified: true,
};
