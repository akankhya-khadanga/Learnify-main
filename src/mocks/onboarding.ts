// Mock data for onboarding flow
export interface Domain {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  domain?: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  experience: number;
  rating: number;
  specialties: string[];
  bio: string;
  iqTier: 'low' | 'medium' | 'high';
  studentsCount: number;
}

export const domains: Domain[] = [
  {
    id: 'engineering',
    name: 'Engineering',
    icon: '⚙️',
    description: 'Build, design, and innovate technological solutions',
    color: '#6DAEDB'
  },
  {
    id: 'medicine',
    name: 'Medicine',
    icon: '🏥',
    description: 'Healthcare, biology, and life sciences',
    color: '#C27BA0'
  },
  {
    id: 'arts',
    name: 'Arts & Humanities',
    icon: '🎨',
    description: 'Creative expression, literature, and culture',
    color: '#C9B458'
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    description: 'Management, economics, and entrepreneurship',
    color: '#8B7AB8'
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    description: 'Physics, chemistry, and natural phenomena',
    color: '#7AC7A8'
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: '💻',
    description: 'Computer science, AI, and digital innovation',
    color: '#DB6D97'
  }
];

export const mcqQuestions: MCQQuestion[] = [
  // Easy questions
  {
    id: 'q1',
    question: 'What is the primary function of a CPU in a computer?',
    options: [
      'Store data permanently',
      'Process instructions and calculations',
      'Display graphics',
      'Connect to the internet'
    ],
    correctAnswer: 1,
    difficulty: 'easy'
  },
  {
    id: 'q2',
    question: 'Which of the following is a renewable energy source?',
    options: ['Coal', 'Natural Gas', 'Solar Power', 'Petroleum'],
    correctAnswer: 2,
    difficulty: 'easy'
  },
  {
    id: 'q3',
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Home Tool Markup Language',
      'Hyperlinks and Text Markup Language'
    ],
    correctAnswer: 0,
    difficulty: 'easy'
  },
  {
    id: 'q4',
    question: 'What is the chemical symbol for water?',
    options: ['O2', 'H2O', 'CO2', 'NaCl'],
    correctAnswer: 1,
    difficulty: 'easy'
  },
  {
    id: 'q5',
    question: 'In mathematics, what is the value of π (pi) approximately?',
    options: ['2.14', '3.14', '4.14', '5.14'],
    correctAnswer: 1,
    difficulty: 'easy'
  },
  // Medium questions
  {
    id: 'q6',
    question: 'What is the time complexity of binary search algorithm?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    difficulty: 'medium'
  },
  {
    id: 'q7',
    question: 'Which law states that energy cannot be created or destroyed?',
    options: [
      'Newton\'s First Law',
      'Law of Conservation of Energy',
      'Ohm\'s Law',
      'Boyle\'s Law'
    ],
    correctAnswer: 1,
    difficulty: 'medium'
  },
  {
    id: 'q8',
    question: 'What is the main purpose of DNS in networking?',
    options: [
      'Encrypt data',
      'Translate domain names to IP addresses',
      'Compress files',
      'Monitor network traffic'
    ],
    correctAnswer: 1,
    difficulty: 'medium'
  },
  {
    id: 'q9',
    question: 'In economics, what does GDP stand for?',
    options: [
      'General Domestic Product',
      'Gross Domestic Product',
      'Global Development Plan',
      'Government Deficit Plan'
    ],
    correctAnswer: 1,
    difficulty: 'medium'
  },
  {
    id: 'q10',
    question: 'What is the derivative of x² with respect to x?',
    options: ['x', '2x', 'x²', '2'],
    correctAnswer: 1,
    difficulty: 'medium'
  },
  // Hard questions
  {
    id: 'q11',
    question: 'What is the Halting Problem in computer science?',
    options: [
      'A problem about stopping infinite loops',
      'Determining if a program will terminate for a given input',
      'A scheduling problem for processors',
      'A problem about pausing execution'
    ],
    correctAnswer: 1,
    difficulty: 'hard'
  },
  {
    id: 'q12',
    question: 'In quantum mechanics, what does the Heisenberg Uncertainty Principle state?',
    options: [
      'Energy is quantized',
      'Light has wave-particle duality',
      'Position and momentum cannot be simultaneously known with precision',
      'Electrons orbit in fixed shells'
    ],
    correctAnswer: 2,
    difficulty: 'hard'
  },
  {
    id: 'q13',
    question: 'What is the space complexity of merge sort algorithm?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 2,
    difficulty: 'hard'
  },
  {
    id: 'q14',
    question: 'In game theory, what is a Nash Equilibrium?',
    options: [
      'The best possible outcome for all players',
      'A state where no player can benefit by changing strategy unilaterally',
      'The point where all players cooperate',
      'The maximum payoff scenario'
    ],
    correctAnswer: 1,
    difficulty: 'hard'
  },
  {
    id: 'q15',
    question: 'What is the Riemann Hypothesis primarily concerned with?',
    options: [
      'The distribution of prime numbers',
      'The properties of imaginary numbers',
      'The solution to differential equations',
      'The theory of relativity'
    ],
    correctAnswer: 0,
    difficulty: 'hard'
  }
];

export const teachers: Teacher[] = [
  // Low IQ tier (High experience teachers)
  {
    id: 't1',
    name: 'Dr. Sarah Mitchell',
    avatar: '👩‍🏫',
    experience: 15,
    rating: 4.9,
    specialties: ['Mathematics', 'Physics', 'Critical Thinking'],
    bio: 'Specialized in building strong foundations for students who need extra support. Patient and detail-oriented teaching approach.',
    iqTier: 'low',
    studentsCount: 342
  },
  {
    id: 't2',
    name: 'Prof. James Chen',
    avatar: '👨‍🏫',
    experience: 18,
    rating: 4.8,
    specialties: ['Engineering', 'Problem Solving', 'Conceptual Learning'],
    bio: 'Expert at breaking down complex topics into digestible pieces. Proven track record with struggling students.',
    iqTier: 'low',
    studentsCount: 298
  },
  {
    id: 't3',
    name: 'Dr. Maria Rodriguez',
    avatar: '👩‍💼',
    experience: 20,
    rating: 5.0,
    specialties: ['Sciences', 'Research Methods', 'Academic Writing'],
    bio: 'Two decades of experience helping students overcome learning challenges. Compassionate and thorough.',
    iqTier: 'low',
    studentsCount: 415
  },
  // Medium IQ tier (Balanced teachers)
  {
    id: 't4',
    name: 'Alex Thompson',
    avatar: '👨‍💻',
    experience: 8,
    rating: 4.7,
    specialties: ['Computer Science', 'Algorithm Design', 'Software Development'],
    bio: 'Balanced approach combining theory and practice. Great for students with solid fundamentals.',
    iqTier: 'medium',
    studentsCount: 256
  },
  {
    id: 't5',
    name: 'Dr. Emily Watson',
    avatar: '👩‍🔬',
    experience: 10,
    rating: 4.8,
    specialties: ['Chemistry', 'Biology', 'Laboratory Techniques'],
    bio: 'Engaging teaching style that balances rigor with accessibility. Perfect for motivated learners.',
    iqTier: 'medium',
    studentsCount: 189
  },
  {
    id: 't6',
    name: 'Michael Park',
    avatar: '👨‍🎓',
    experience: 7,
    rating: 4.6,
    specialties: ['Business', 'Economics', 'Data Analysis'],
    bio: 'Modern teaching methods with real-world applications. Ideal for self-driven students.',
    iqTier: 'medium',
    studentsCount: 223
  },
  // High IQ tier (Junior teachers for advanced students)
  {
    id: 't7',
    name: 'Lisa Kumar',
    avatar: '👩‍🎓',
    experience: 3,
    rating: 4.5,
    specialties: ['Advanced Mathematics', 'Theoretical Physics', 'Research'],
    bio: 'Recent PhD graduate with fresh perspectives. Excellent for high-achieving students who grasp concepts quickly.',
    iqTier: 'high',
    studentsCount: 87
  },
  {
    id: 't8',
    name: 'David Foster',
    avatar: '👨‍🔬',
    experience: 4,
    rating: 4.6,
    specialties: ['AI', 'Machine Learning', 'Innovation'],
    bio: 'Cutting-edge knowledge in emerging fields. Best suited for independent learners who need minimal guidance.',
    iqTier: 'high',
    studentsCount: 95
  },
  {
    id: 't9',
    name: 'Rachel Green',
    avatar: '👩‍💻',
    experience: 2,
    rating: 4.4,
    specialties: ['Web Development', 'UI/UX', 'Creative Coding'],
    bio: 'Energetic and innovative teaching style. Perfect for students who learn by doing and exploring.',
    iqTier: 'high',
    studentsCount: 64
  }
];

// Helper function to evaluate IQ based on responses
export function evaluateIQ(responses: boolean[]): 'low' | 'medium' | 'high' {
  const correctCount = responses.filter(r => r).length;
  const percentage = (correctCount / responses.length) * 100;
  
  if (percentage < 40) return 'low';
  if (percentage < 70) return 'medium';
  return 'high';
}

// Get teachers for IQ tier
export function getTeachersForIQTier(iqTier: 'low' | 'medium' | 'high'): Teacher[] {
  return teachers.filter(t => t.iqTier === iqTier);
}
