export interface VRRoom {
  id: string;
  name: string;
  frameUrl: string;
  usersOnline: number;
  whiteboardsActive: number;
  maxWhiteboards: number;
  description: string;
  thumbnail?: string;
}

export interface VRCollaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  currentTool: 'draw' | 'erase' | 'rectangle' | 'circle' | 'none';
}

export interface WhiteboardStroke {
  id: string;
  userId: string;
  userName: string;
  tool: 'draw' | 'erase' | 'rectangle' | 'circle';
  color: string;
  points: { x: number; y: number }[];
  timestamp: number;
}

export interface VRModel {
  id: string;
  name: string;
  fileType: 'glb' | 'obj';
  preview: string;
  uploadedBy: string;
  timestamp: number;
}

// Mock VR Rooms
export const MOCK_VR_ROOMS: VRRoom[] = [
  {
    id: 'room-main',
    name: 'Main Study Hall',
    frameUrl: 'https://framevr.io/INTELLI-LEARN',
    usersOnline: 24,
    whiteboardsActive: 2,
    maxWhiteboards: 4,
    description: 'General purpose collaborative study space for all subjects',
  },
  {
    id: 'room-1',
    name: 'Mathematics Hub',
    frameUrl: 'https://framevr.io/INTELLI-LEARN/math-hub',
    usersOnline: 12,
    whiteboardsActive: 3,
    maxWhiteboards: 4,
    description: 'Dedicated space for math collaboration and problem-solving',
  },
  {
    id: 'room-2',
    name: 'Science Lab',
    frameUrl: 'https://framevr.io/INTELLI-LEARN/science-lab',
    usersOnline: 8,
    whiteboardsActive: 2,
    maxWhiteboards: 4,
    description: 'Virtual science laboratory with 3D models and experiments',
  },
  {
    id: 'room-3',
    name: 'Creative Arts Studio',
    frameUrl: 'https://framevr.io/INTELLI-LEARN/arts-studio',
    usersOnline: 15,
    whiteboardsActive: 4,
    maxWhiteboards: 4,
    description: 'Collaborate on art projects and design work',
  },
  {
    id: 'room-4',
    name: 'Language Lounge',
    frameUrl: 'https://framevr.io/INTELLI-LEARN/language-lounge',
    usersOnline: 6,
    whiteboardsActive: 1,
    maxWhiteboards: 4,
    description: 'Practice languages with peers from around the world',
  },
  {
    id: 'room-5',
    name: 'Exam Prep Center',
    frameUrl: 'https://framevr.io/INTELLI-LEARN/exam-prep',
    usersOnline: 20,
    whiteboardsActive: 4,
    maxWhiteboards: 4,
    description: 'Focused study space for exam preparation',
  },
];

// Mock Collaborators
export const MOCK_VR_COLLABORATORS: VRCollaborator[] = [
  {
    id: 'user-1',
    name: 'Priya Sharma',
    avatar: '👩‍🎓',
    color: '#C27BA0',
    isOnline: true,
    currentTool: 'draw',
  },
  {
    id: 'user-2',
    name: 'Rahul Kumar',
    avatar: '👨‍💻',
    color: '#6DAEDB',
    isOnline: true,
    currentTool: 'rectangle',
  },
  {
    id: 'user-3',
    name: 'Ananya Singh',
    avatar: '👩‍🔬',
    color: '#C9B458',
    isOnline: true,
    currentTool: 'circle',
  },
  {
    id: 'user-4',
    name: 'Arjun Patel',
    avatar: '👨‍🎨',
    color: '#FF6B6B',
    isOnline: false,
    currentTool: 'none',
  },
  {
    id: 'user-5',
    name: 'Ishita Reddy',
    avatar: '👩‍🏫',
    color: '#4ECDC4',
    isOnline: true,
    currentTool: 'draw',
  },
];

// Pre-scripted whiteboard strokes for simulation
export const MOCK_WHITEBOARD_STROKES: WhiteboardStroke[] = [
  {
    id: 'stroke-1',
    userId: 'user-1',
    userName: 'Priya Sharma',
    tool: 'draw',
    color: '#C27BA0',
    points: [
      { x: 100, y: 150 },
      { x: 105, y: 155 },
      { x: 115, y: 165 },
      { x: 130, y: 175 },
      { x: 150, y: 180 },
    ],
    timestamp: Date.now() - 5000,
  },
  {
    id: 'stroke-2',
    userId: 'user-2',
    userName: 'Rahul Kumar',
    tool: 'rectangle',
    color: '#6DAEDB',
    points: [
      { x: 200, y: 100 },
      { x: 300, y: 200 },
    ],
    timestamp: Date.now() - 4000,
  },
  {
    id: 'stroke-3',
    userId: 'user-3',
    userName: 'Ananya Singh',
    tool: 'circle',
    color: '#C9B458',
    points: [
      { x: 400, y: 250 },
      { x: 450, y: 300 },
    ],
    timestamp: Date.now() - 3000,
  },
];

// Mock 3D Models
export const MOCK_VR_MODELS: VRModel[] = [
  {
    id: 'model-1',
    name: 'DNA Helix',
    fileType: 'glb',
    preview: '🧬',
    uploadedBy: 'Ananya Singh',
    timestamp: Date.now() - 10000,
  },
  {
    id: 'model-2',
    name: 'Solar System',
    fileType: 'obj',
    preview: '🪐',
    uploadedBy: 'Rahul Kumar',
    timestamp: Date.now() - 8000,
  },
];

// Helper Functions
export function getRoomById(roomId: string): VRRoom | undefined {
  return MOCK_VR_ROOMS.find((room) => room.id === roomId);
}

export function getActiveCollaborators(): VRCollaborator[] {
  return MOCK_VR_COLLABORATORS.filter((user) => user.isOnline);
}

export function canAddWhiteboard(roomId: string): boolean {
  const room = getRoomById(roomId);
  if (!room) return false;
  return room.whiteboardsActive < room.maxWhiteboards;
}

export function simulateCollaboratorAction(): WhiteboardStroke {
  const collaborators = getActiveCollaborators();
  const randomUser = collaborators[Math.floor(Math.random() * collaborators.length)];
  const tools: ('draw' | 'rectangle' | 'circle')[] = ['draw', 'rectangle', 'circle'];
  const randomTool = tools[Math.floor(Math.random() * tools.length)];

  const baseX = Math.random() * 600;
  const baseY = Math.random() * 400;
  const points: { x: number; y: number }[] = [];

  if (randomTool === 'draw') {
    // Generate random drawing path
    for (let i = 0; i < 8; i++) {
      points.push({
        x: baseX + Math.random() * 50 - 25,
        y: baseY + Math.random() * 50 - 25,
      });
    }
  } else {
    // Generate shape corners
    points.push({ x: baseX, y: baseY });
    points.push({ x: baseX + 80, y: baseY + 60 });
  }

  return {
    id: `stroke-${Date.now()}-${Math.random()}`,
    userId: randomUser.id,
    userName: randomUser.name,
    tool: randomTool,
    color: randomUser.color,
    points,
    timestamp: Date.now(),
  };
}

export function generateCursorPosition(): { x: number; y: number } {
  return {
    x: Math.random() * 700,
    y: Math.random() * 500,
  };
}
