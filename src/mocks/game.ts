/**
 * MOCK DATA: Game Questions & Energy System
 * Practice mode questions, competition challenges, and energy tracking
 */

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionCategory = 'MATH' | 'SCIENCE' | 'HISTORY' | 'ENGLISH' | 'GENERAL';

export interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: QuestionDifficulty;
  category: QuestionCategory;
  explanation: string;
  points: number;
}

export interface EnergyConfig {
  baseEnergy: number;
  correctAnswerBonus: number;
  wrongAnswerPenalty: number;
  maxEnergy: number;
  minEnergy: number;
}

export interface GameSession {
  sessionId: string;
  mode: 'PRACTICE' | 'COMPETITION';
  startTime: Date;
  currentEnergy: number;
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
}

export const ENERGY_CONFIG: EnergyConfig = {
  baseEnergy: 50,
  correctAnswerBonus: 6,
  wrongAnswerPenalty: 2,
  maxEnergy: 100,
  minEnergy: 0
};

export const PRACTICE_QUESTIONS: GameQuestion[] = [
  {
    id: 'q001',
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctAnswer: 2,
    difficulty: 'EASY',
    category: 'GENERAL',
    explanation: 'Paris is the capital and largest city of France.',
    points: 10
  },
  {
    id: 'q002',
    question: 'What is 15 × 8?',
    options: ['110', '120', '130', '140'],
    correctAnswer: 1,
    difficulty: 'EASY',
    category: 'MATH',
    explanation: '15 multiplied by 8 equals 120.',
    points: 10
  },
  {
    id: 'q003',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 1,
    difficulty: 'EASY',
    category: 'SCIENCE',
    explanation: 'Mars is called the Red Planet due to iron oxide on its surface.',
    points: 10
  },
  {
    id: 'q004',
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 1,
    difficulty: 'MEDIUM',
    category: 'ENGLISH',
    explanation: 'William Shakespeare wrote this famous tragedy around 1594-1596.',
    points: 15
  },
  {
    id: 'q005',
    question: 'What is the square root of 144?',
    options: ['10', '11', '12', '13'],
    correctAnswer: 2,
    difficulty: 'EASY',
    category: 'MATH',
    explanation: '12 × 12 = 144, so the square root of 144 is 12.',
    points: 10
  },
  {
    id: 'q006',
    question: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
    difficulty: 'MEDIUM',
    category: 'HISTORY',
    explanation: 'World War II ended in 1945 with the surrender of Japan.',
    points: 15
  },
  {
    id: 'q007',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    difficulty: 'MEDIUM',
    category: 'SCIENCE',
    explanation: 'Au comes from the Latin word "aurum" meaning gold.',
    points: 15
  },
  {
    id: 'q008',
    question: 'Which is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswer: 3,
    difficulty: 'EASY',
    category: 'GENERAL',
    explanation: 'The Pacific Ocean covers more area than all land masses combined.',
    points: 10
  },
  {
    id: 'q009',
    question: 'What is 7³ (7 to the power of 3)?',
    options: ['343', '347', '353', '357'],
    correctAnswer: 0,
    difficulty: 'MEDIUM',
    category: 'MATH',
    explanation: '7 × 7 × 7 = 343',
    points: 15
  },
  {
    id: 'q010',
    question: 'Who painted the Mona Lisa?',
    options: ['Pablo Picasso', 'Vincent van Gogh', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 2,
    difficulty: 'EASY',
    category: 'GENERAL',
    explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.',
    points: 10
  },
  {
    id: 'q011',
    question: 'What is the speed of light in vacuum?',
    options: ['299,792 km/s', '300,000 km/s', '299,000 km/s', '298,792 km/s'],
    correctAnswer: 0,
    difficulty: 'HARD',
    category: 'SCIENCE',
    explanation: 'The speed of light in vacuum is approximately 299,792,458 meters per second.',
    points: 20
  },
  {
    id: 'q012',
    question: 'Which Shakespeare play features the character Hamlet?',
    options: ['Macbeth', 'Othello', 'Hamlet', 'King Lear'],
    correctAnswer: 2,
    difficulty: 'EASY',
    category: 'ENGLISH',
    explanation: 'Hamlet is the titular character in Shakespeare\'s tragedy.',
    points: 10
  },
  {
    id: 'q013',
    question: 'What is the value of π (pi) to 2 decimal places?',
    options: ['3.12', '3.14', '3.16', '3.18'],
    correctAnswer: 1,
    difficulty: 'EASY',
    category: 'MATH',
    explanation: 'Pi (π) is approximately 3.14159, which rounds to 3.14.',
    points: 10
  },
  {
    id: 'q014',
    question: 'Who was the first President of the United States?',
    options: ['Thomas Jefferson', 'George Washington', 'John Adams', 'Benjamin Franklin'],
    correctAnswer: 1,
    difficulty: 'EASY',
    category: 'HISTORY',
    explanation: 'George Washington served as the first U.S. President from 1789-1797.',
    points: 10
  },
  {
    id: 'q015',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Chloroplast'],
    correctAnswer: 2,
    difficulty: 'EASY',
    category: 'SCIENCE',
    explanation: 'Mitochondria generate most of the cell\'s energy in the form of ATP.',
    points: 10
  },
  {
    id: 'q016',
    question: 'Solve: 3x + 7 = 22. What is x?',
    options: ['3', '4', '5', '6'],
    correctAnswer: 2,
    difficulty: 'MEDIUM',
    category: 'MATH',
    explanation: '3x = 15, therefore x = 5',
    points: 15
  },
  {
    id: 'q017',
    question: 'In which continent is the Sahara Desert located?',
    options: ['Asia', 'Africa', 'Australia', 'South America'],
    correctAnswer: 1,
    difficulty: 'EASY',
    category: 'GENERAL',
    explanation: 'The Sahara Desert is located in northern Africa.',
    points: 10
  },
  {
    id: 'q018',
    question: 'What is the atomic number of carbon?',
    options: ['4', '5', '6', '7'],
    correctAnswer: 2,
    difficulty: 'MEDIUM',
    category: 'SCIENCE',
    explanation: 'Carbon has 6 protons, giving it an atomic number of 6.',
    points: 15
  },
  {
    id: 'q019',
    question: 'Who discovered penicillin?',
    options: ['Marie Curie', 'Alexander Fleming', 'Louis Pasteur', 'Isaac Newton'],
    correctAnswer: 1,
    difficulty: 'MEDIUM',
    category: 'SCIENCE',
    explanation: 'Alexander Fleming discovered penicillin in 1928.',
    points: 15
  },
  {
    id: 'q020',
    question: 'What is the longest river in the world?',
    options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
    correctAnswer: 1,
    difficulty: 'MEDIUM',
    category: 'GENERAL',
    explanation: 'The Nile River is generally considered the longest at about 6,650 km.',
    points: 15
  }
];

export const getRandomQuestions = (count: number = 10): GameQuestion[] => {
  const shuffled = [...PRACTICE_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const calculateEnergyChange = (
  currentEnergy: number,
  isCorrect: boolean
): number => {
  const change = isCorrect 
    ? ENERGY_CONFIG.correctAnswerBonus 
    : -ENERGY_CONFIG.wrongAnswerPenalty;
  
  const newEnergy = currentEnergy + change;
  
  return Math.max(
    ENERGY_CONFIG.minEnergy,
    Math.min(ENERGY_CONFIG.maxEnergy, newEnergy)
  );
};

export const createGameSession = (mode: 'PRACTICE' | 'COMPETITION'): GameSession => {
  return {
    sessionId: `session_${Date.now()}`,
    mode,
    startTime: new Date(),
    currentEnergy: ENERGY_CONFIG.baseEnergy,
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0
  };
};
