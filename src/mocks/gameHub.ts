/**
 * PHASE 19: Game Hub + XP Competition Mock Data
 * VR games, multiplayer lobbies, match results
 */

export type GameType = 'VR' | 'Puzzle' | 'Memory' | 'Reflex' | 'Strategy';
export type DifficultyTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export interface Game {
  id: string;
  title: string;
  description: string;
  type: GameType;
  thumbnailUrl: string;
  minXP: number;
  maxXP: number;
  difficulty: number; // 1-10
  tier: DifficultyTier;
  maxPlayers: number;
  avgDuration: string; // "5 min"
  tags: string[];
  isVRCompatible: boolean;
  featured: boolean;
}

export interface LobbyPlayer {
  userId: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  isReady: boolean;
  ping: number; // ms
  rank: number;
  winRate?: number; // percentage
}

export interface MatchResult {
  matchId: string;
  gameId: string;
  gameTitle: string;
  duration: number; // seconds
  timestamp: Date;
  players: MatchPlayer[];
  myRank: number;
  myXpEarned: number;
  myStats: PlayerStats;
}

export interface MatchPlayer {
  userId: string;
  username: string;
  avatar: string;
  rank: number;
  xpEarned: number;
  score: number;
}

export interface PlayerStats {
  accuracy: number; // percentage
  streak: number; // correct answers in a row
  timeBonus: number; // XP from speed
  difficultyBonus: number; // XP from tier
}

export interface Lobby {
  id: string;
  gameId: string;
  gameTitle: string;
  hostId: string;
  players: LobbyPlayer[];
  maxPlayers: number;
  difficulty: DifficultyTier;
  status: 'waiting' | 'ready-check' | 'countdown' | 'in-game';
  countdownSeconds?: number;
  mapName?: string;
}

export interface PlayerProfile {
  userId: string;
  username: string;
  avatar: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalGamesPlayed: number;
  totalXPEarned: number;
  globalRank: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

// Mock Games Data
export const MOCK_GAMES: Game[] = [
  {
    id: 'subway-math',
    title: 'Subway Surfer Math',
    description: 'Dodge obstacles while solving equations at lightning speed',
    type: 'VR',
    thumbnailUrl: '/game-subway.jpg',
    minXP: 50,
    maxXP: 200,
    difficulty: 5,
    tier: 'Gold',
    maxPlayers: 8,
    avgDuration: '5 min',
    tags: ['Algebra', 'Reflexes', 'Multiplayer'],
    isVRCompatible: true,
    featured: true,
  },
  {
    id: 'memory-palace',
    title: 'Memory Palace Builder',
    description: 'Construct 3D memory palaces to memorize complex concepts',
    type: 'Puzzle',
    thumbnailUrl: '/game-memory.jpg',
    minXP: 30,
    maxXP: 120,
    difficulty: 3,
    tier: 'Silver',
    maxPlayers: 4,
    avgDuration: '8 min',
    tags: ['Memory', 'Architecture', 'Solo'],
    isVRCompatible: true,
    featured: false,
  },
  {
    id: 'temple-vocab',
    title: 'Temple Run Vocabulary',
    description: 'Swipe left/right based on word definitions as you sprint',
    type: 'Reflex',
    thumbnailUrl: '/game-temple.jpg',
    minXP: 40,
    maxXP: 150,
    difficulty: 4,
    tier: 'Silver',
    maxPlayers: 6,
    avgDuration: '4 min',
    tags: ['Vocabulary', 'English', 'Fast-Paced'],
    isVRCompatible: true,
    featured: true,
  },
  {
    id: 'periodic-race',
    title: 'Periodic Table Race',
    description: 'Place elements in the correct position faster than opponents',
    type: 'Strategy',
    thumbnailUrl: '/game-periodic.jpg',
    minXP: 60,
    maxXP: 250,
    difficulty: 7,
    tier: 'Diamond',
    maxPlayers: 4,
    avgDuration: '6 min',
    tags: ['Chemistry', 'Strategy', 'Competitive'],
    isVRCompatible: false,
    featured: false,
  },
  {
    id: 'geometry-dash',
    title: 'Geometry Dash Calculus',
    description: 'Jump to platforms with correct derivative values',
    type: 'Reflex',
    thumbnailUrl: '/game-geometry.jpg',
    minXP: 70,
    maxXP: 300,
    difficulty: 8,
    tier: 'Diamond',
    maxPlayers: 8,
    avgDuration: '5 min',
    tags: ['Calculus', 'Precision', 'Elite'],
    isVRCompatible: false,
    featured: true,
  },
  {
    id: 'code-combat',
    title: 'Code Combat Arena',
    description: 'Write functions to control your warrior in real-time battles',
    type: 'Strategy',
    thumbnailUrl: '/game-code.jpg',
    minXP: 80,
    maxXP: 350,
    difficulty: 9,
    tier: 'Diamond',
    maxPlayers: 4,
    avgDuration: '10 min',
    tags: ['Programming', 'Logic', 'PvP'],
    isVRCompatible: false,
    featured: false,
  },
  {
    id: 'history-timeline',
    title: 'History Timeline Rush',
    description: 'Arrange historical events in chronological order under pressure',
    type: 'Puzzle',
    thumbnailUrl: '/game-history.jpg',
    minXP: 25,
    maxXP: 100,
    difficulty: 2,
    tier: 'Bronze',
    maxPlayers: 6,
    avgDuration: '4 min',
    tags: ['History', 'Timeline', 'Beginner'],
    isVRCompatible: false,
    featured: false,
  },
  {
    id: 'molecule-builder',
    title: 'Molecule Builder VR',
    description: 'Construct molecules in 3D space by bonding atoms correctly',
    type: 'VR',
    thumbnailUrl: '/game-molecule.jpg',
    minXP: 45,
    maxXP: 180,
    difficulty: 6,
    tier: 'Gold',
    maxPlayers: 4,
    avgDuration: '7 min',
    tags: ['Chemistry', '3D', 'Creative'],
    isVRCompatible: true,
    featured: true,
  },
];

// Mock Lobby Players
export const MOCK_LOBBY_PLAYERS: LobbyPlayer[] = [
  {
    userId: '1',
    username: 'MathWizard_42',
    avatar: '🧙‍♂️',
    level: 28,
    xp: 14500,
    isReady: true,
    ping: 23,
    rank: 142,
    winRate: 73,
  },
  {
    userId: '2',
    username: 'QuantumQueen',
    avatar: '👑',
    level: 35,
    xp: 22000,
    isReady: true,
    ping: 31,
    rank: 89,
    winRate: 81,
  },
  {
    userId: '3',
    username: 'CodeNinja_88',
    avatar: '🥷',
    level: 19,
    xp: 8200,
    isReady: false,
    ping: 45,
    rank: 301,
    winRate: 58,
  },
  {
    userId: '4',
    username: 'ChemGenius',
    avatar: '⚗️',
    level: 31,
    xp: 18700,
    isReady: true,
    ping: 18,
    rank: 115,
    winRate: 76,
  },
];

// Mock Lobby
export const MOCK_LOBBY: Lobby = {
  id: 'lobby-1',
  gameId: 'subway-math',
  gameTitle: 'Subway Surfer Math',
  hostId: '1',
  players: MOCK_LOBBY_PLAYERS,
  maxPlayers: 8,
  difficulty: 'Gold',
  status: 'ready-check',
  mapName: 'Downtown Express',
};

// Mock Match Result
export const MOCK_MATCH_RESULT: MatchResult = {
  matchId: 'match-123',
  gameId: 'subway-math',
  gameTitle: 'Subway Surfer Math',
  duration: 312, // 5 min 12 sec
  timestamp: new Date(),
  players: [
    {
      userId: '2',
      username: 'QuantumQueen',
      avatar: '👑',
      rank: 1,
      xpEarned: 200,
      score: 8950,
    },
    {
      userId: '1',
      username: 'MathWizard_42',
      avatar: '🧙‍♂️',
      rank: 2,
      xpEarned: 150,
      score: 8200,
    },
    {
      userId: '4',
      username: 'ChemGenius',
      avatar: '⚗️',
      rank: 3,
      xpEarned: 120,
      score: 7500,
    },
    {
      userId: '3',
      username: 'CodeNinja_88',
      avatar: '🥷',
      rank: 4,
      xpEarned: 80,
      score: 6100,
    },
  ],
  myRank: 2,
  myXpEarned: 150,
  myStats: {
    accuracy: 87,
    streak: 12,
    timeBonus: 30,
    difficultyBonus: 50,
  },
};

// Mock Player Profile
export const MOCK_PLAYER_PROFILE: PlayerProfile = {
  userId: '1',
  username: 'MathWizard_42',
  avatar: '🧙‍♂️',
  level: 28,
  currentXP: 14500,
  xpToNextLevel: 16000,
  totalGamesPlayed: 342,
  totalXPEarned: 68400,
  globalRank: 142,
  badges: [
    {
      id: 'badge-1',
      name: 'First Victory',
      description: 'Win your first competitive match',
      icon: '🏆',
      rarity: 'common',
      unlockedAt: new Date('2025-01-15'),
    },
    {
      id: 'badge-2',
      name: 'Speed Demon',
      description: 'Complete 10 games in under 3 minutes',
      icon: '⚡',
      rarity: 'rare',
      unlockedAt: new Date('2025-02-20'),
    },
    {
      id: 'badge-3',
      name: 'Diamond League',
      description: 'Reach Diamond tier in any game',
      icon: '💎',
      rarity: 'epic',
    },
  ],
};

// Mock Game Leaderboard (renamed to avoid conflict with community.ts MOCK_LEADERBOARD)
export const MOCK_GAME_LEADERBOARD: LobbyPlayer[] = [
  {
    userId: '5',
    username: 'ProdigyPlayer',
    avatar: '⭐',
    level: 42,
    xp: 35000,
    isReady: true,
    ping: 15,
    rank: 1,
    winRate: 92,
  },
  {
    userId: '6',
    username: 'BrainBeast',
    avatar: '🧠',
    level: 40,
    xp: 32000,
    isReady: true,
    ping: 20,
    rank: 2,
    winRate: 88,
  },
  {
    userId: '7',
    username: 'StudyStorm',
    avatar: '⚡',
    level: 38,
    xp: 28500,
    isReady: true,
    ping: 25,
    rank: 3,
    winRate: 85,
  },
  {
    userId: '2',
    username: 'QuantumQueen',
    avatar: '👑',
    level: 35,
    xp: 22000,
    isReady: true,
    ping: 31,
    rank: 4,
    winRate: 81,
  },
  {
    userId: '4',
    username: 'ChemGenius',
    avatar: '⚗️',
    level: 31,
    xp: 18700,
    isReady: true,
    ping: 18,
    rank: 5,
    winRate: 76,
  },
];

// Helper functions
export function getTierColor(tier: DifficultyTier): string {
  switch (tier) {
    case 'Bronze':
      return '#CD7F32';
    case 'Silver':
      return '#C0C0C0';
    case 'Gold':
      return '#C9B458';
    case 'Diamond':
      return '#6DAEDB';
  }
}

export function getTierFromDifficulty(difficulty: number): DifficultyTier {
  if (difficulty <= 2) return 'Bronze';
  if (difficulty <= 4) return 'Silver';
  if (difficulty <= 6) return 'Gold';
  return 'Diamond';
}

export function calculateXPToNextLevel(level: number): number {
  return level * 500 + 500; // Linear growth: level 1 = 1000 XP, level 2 = 1500 XP, etc.
}

export function getGameById(id: string): Game | undefined {
  return MOCK_GAMES.find((game) => game.id === id);
}

// Mock async functions
export async function mockStartGame(gameId: string): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true };
}

export async function mockJoinLobby(lobbyId: string): Promise<Lobby> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_LOBBY;
}

export async function mockReadyUp(lobbyId: string, userId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export async function mockMatchmake(gameId: string): Promise<Lobby> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return MOCK_LOBBY;
}
