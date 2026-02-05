/**
 * MOCK DATA: Multiplayer Match System
 * Mock opponent AI, matchmaking, and competition logic
 */

export interface MockPlayer {
  id: string;
  username: string;
  avatar: string;
  level: number;
  energy: number;
  questionsAnswered: number;
  correctAnswers: number;
  isAI: boolean;
}

export interface MatchSettings {
  maxPlayers: number;
  questionCount: number;
  timePerQuestion: number; // seconds
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
}

export interface MatchState {
  matchId: string;
  status: 'WAITING' | 'COUNTDOWN' | 'IN_PROGRESS' | 'FINISHED';
  players: MockPlayer[];
  currentQuestionIndex: number;
  settings: MatchSettings;
}

export const MOCK_AI_PLAYERS = [
  { id: 'ai1', username: 'MathWizard_42', avatar: '🧙‍♂️', level: 28 },
  { id: 'ai2', username: 'QuantumQueen', avatar: '👑', level: 35 },
  { id: 'ai3', username: 'CodeNinja_88', avatar: '🥷', level: 19 },
  { id: 'ai4', username: 'ChemGenius', avatar: '⚗️', level: 31 },
  { id: 'ai5', username: 'BrainBeast', avatar: '🧠', level: 40 },
  { id: 'ai6', username: 'StudyStorm', avatar: '⚡', level: 38 },
  { id: 'ai7', username: 'LogicLord', avatar: '👨‍🔬', level: 26 },
  { id: 'ai8', username: 'AlgebraAce', avatar: '🎯', level: 33 }
];

export const createMockPlayer = (
  playerId: string,
  isAI: boolean = true
): MockPlayer => {
  if (!isAI) {
    return {
      id: playerId,
      username: 'You',
      avatar: '👤',
      level: 25,
      energy: 50,
      questionsAnswered: 0,
      correctAnswers: 0,
      isAI: false
    };
  }

  const template = MOCK_AI_PLAYERS[Math.floor(Math.random() * MOCK_AI_PLAYERS.length)];
  return {
    ...template,
    energy: 50,
    questionsAnswered: 0,
    correctAnswers: 0,
    isAI: true
  };
};

export const createMatch = (playerCount: number = 4): MatchState => {
  const players: MockPlayer[] = [
    createMockPlayer('player', false)
  ];

  const aiCount = Math.min(playerCount - 1, 3);
  for (let i = 0; i < aiCount; i++) {
    players.push(createMockPlayer(`ai${i + 1}`, true));
  }

  return {
    matchId: `match_${Date.now()}`,
    status: 'WAITING',
    players,
    currentQuestionIndex: 0,
    settings: {
      maxPlayers: playerCount,
      questionCount: 5,
      timePerQuestion: 30,
      difficulty: 'MIXED'
    }
  };
};

export const simulateAIAnswer = (player: MockPlayer, questionDifficulty: string): boolean => {
  if (!player.isAI) return false;

  let correctChance = 0.5;
  
  switch (questionDifficulty) {
    case 'EASY':
      correctChance = 0.75;
      break;
    case 'MEDIUM':
      correctChance = 0.6;
      break;
    case 'HARD':
      correctChance = 0.4;
      break;
  }

  const levelBonus = (player.level / 100) * 0.2;
  correctChance = Math.min(0.95, correctChance + levelBonus);

  return Math.random() < correctChance;
};

export const calculateMatchReward = (rank: number, totalPlayers: number): number => {
  const baseReward = 50;
  const rewards: Record<number, number> = {
    1: baseReward,
    2: Math.floor(baseReward * 0.7),
    3: Math.floor(baseReward * 0.5),
    4: Math.floor(baseReward * 0.3)
  };

  return rewards[rank] || Math.floor(baseReward * 0.2);
};

export const getAIAnswerDelay = (): number => {
  return Math.random() * 2000 + 1000; // 1-3 seconds
};
