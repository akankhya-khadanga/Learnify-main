/**
 * PHASE 18: Knowledge Orbit System — Mock Data
 * Galaxy graph data with clusters, topics, and sub-topics
 */

export interface OrbitNode {
  id: string;
  label: string;
  cluster: string;
  type: 'cluster' | 'topic' | 'subtopic';
  difficulty: number; // 1-5
  progress: number; // 0-1
  orbitRadius: number; // Distance from parent
  orbitSpeed: number; // Revolution speed
  angle: number; // Starting angle
  color: string;
  description: string;
  resources: Resource[];
  dependencies: string[]; // IDs of prerequisite nodes
  children?: OrbitNode[];
}

export interface Resource {
  id: string;
  type: 'video' | 'article' | 'exercise' | 'quiz';
  title: string;
  duration?: string;
  completed: boolean;
}

export interface GalaxyCluster {
  id: string;
  name: string;
  color: string;
  centerPosition: [number, number, number];
  topics: OrbitNode[];
}

// Mathematics Galaxy
const mathTopics: OrbitNode[] = [
  {
    id: 'calculus_derivatives',
    label: 'Derivatives',
    cluster: 'Mathematics',
    type: 'topic',
    difficulty: 3,
    progress: 0.75,
    orbitRadius: 8,
    orbitSpeed: 1.2,
    angle: 0,
    color: '#C9B458',
    description: 'Understanding rates of change and slopes of curves',
    resources: [
      { id: 'r1', type: 'video', title: 'Introduction to Derivatives', duration: '12 min', completed: true },
      { id: 'r2', type: 'exercise', title: 'Practice Problems', completed: true },
      { id: 'r3', type: 'quiz', title: 'Derivatives Quiz', completed: false },
    ],
    dependencies: [],
    children: [
      {
        id: 'power_rule',
        label: 'Power Rule',
        cluster: 'Mathematics',
        type: 'subtopic',
        difficulty: 2,
        progress: 0.9,
        orbitRadius: 2.5,
        orbitSpeed: 2.0,
        angle: 45,
        color: '#C9B458',
        description: 'Basic differentiation using power rule',
        resources: [{ id: 'r4', type: 'video', title: 'Power Rule Explained', duration: '8 min', completed: true }],
        dependencies: ['calculus_derivatives'],
      },
      {
        id: 'chain_rule',
        label: 'Chain Rule',
        cluster: 'Mathematics',
        type: 'subtopic',
        difficulty: 4,
        progress: 0.5,
        orbitRadius: 3,
        orbitSpeed: 1.5,
        angle: 120,
        color: '#C9B458',
        description: 'Differentiating composite functions',
        resources: [{ id: 'r5', type: 'article', title: 'Chain Rule Guide', completed: false }],
        dependencies: ['power_rule'],
      },
    ],
  },
  {
    id: 'linear_algebra',
    label: 'Linear Algebra',
    cluster: 'Mathematics',
    type: 'topic',
    difficulty: 4,
    progress: 0.35,
    orbitRadius: 12,
    orbitSpeed: 0.8,
    angle: 90,
    color: '#C9B458',
    description: 'Study of vectors, matrices, and linear transformations',
    resources: [
      { id: 'r6', type: 'video', title: 'Vectors & Matrices', duration: '15 min', completed: true },
      { id: 'r7', type: 'exercise', title: 'Matrix Operations', completed: false },
    ],
    dependencies: [],
    children: [
      {
        id: 'eigenvalues',
        label: 'Eigenvalues',
        cluster: 'Mathematics',
        type: 'subtopic',
        difficulty: 5,
        progress: 0.2,
        orbitRadius: 3.5,
        orbitSpeed: 1.0,
        angle: 200,
        color: '#C9B458',
        description: 'Special scalars associated with linear transformations',
        resources: [{ id: 'r8', type: 'video', title: 'Eigenvalues Intro', duration: '18 min', completed: false }],
        dependencies: ['linear_algebra'],
      },
    ],
  },
  {
    id: 'trigonometry',
    label: 'Trigonometry',
    cluster: 'Mathematics',
    type: 'topic',
    difficulty: 2,
    progress: 0.95,
    orbitRadius: 6,
    orbitSpeed: 1.8,
    angle: 180,
    color: '#C9B458',
    description: 'Study of triangles and periodic functions',
    resources: [
      { id: 'r9', type: 'video', title: 'Trig Functions', duration: '10 min', completed: true },
      { id: 'r10', type: 'quiz', title: 'Trig Quiz', completed: true },
    ],
    dependencies: [],
    children: [],
  },
  {
    id: 'probability',
    label: 'Probability',
    cluster: 'Mathematics',
    type: 'topic',
    difficulty: 3,
    progress: 0.6,
    orbitRadius: 10,
    orbitSpeed: 1.0,
    angle: 270,
    color: '#C9B458',
    description: 'Mathematics of randomness and likelihood',
    resources: [
      { id: 'r11', type: 'article', title: 'Probability Basics', completed: true },
      { id: 'r12', type: 'exercise', title: 'Practice Problems', completed: false },
    ],
    dependencies: [],
    children: [
      {
        id: 'bayes_theorem',
        label: "Bayes' Theorem",
        cluster: 'Mathematics',
        type: 'subtopic',
        difficulty: 4,
        progress: 0.4,
        orbitRadius: 2.8,
        orbitSpeed: 1.6,
        angle: 315,
        color: '#C9B458',
        description: 'Conditional probability and updating beliefs',
        resources: [{ id: 'r13', type: 'video', title: "Bayes' Theorem", duration: '14 min', completed: false }],
        dependencies: ['probability'],
      },
    ],
  },
];

// Physics Galaxy
const physicsTopics: OrbitNode[] = [
  {
    id: 'quantum_mechanics',
    label: 'Quantum Mechanics',
    cluster: 'Physics',
    type: 'topic',
    difficulty: 5,
    progress: 0.25,
    orbitRadius: 14,
    orbitSpeed: 0.6,
    angle: 30,
    color: '#6DAEDB',
    description: 'Physics of the very small',
    resources: [
      { id: 'r14', type: 'video', title: 'Quantum Intro', duration: '20 min', completed: true },
      { id: 'r15', type: 'article', title: 'Wave-Particle Duality', completed: false },
    ],
    dependencies: [],
    children: [
      {
        id: 'schrodinger',
        label: 'Schrödinger Equation',
        cluster: 'Physics',
        type: 'subtopic',
        difficulty: 5,
        progress: 0.1,
        orbitRadius: 3.2,
        orbitSpeed: 0.9,
        angle: 60,
        color: '#6DAEDB',
        description: 'Fundamental equation of quantum mechanics',
        resources: [{ id: 'r16', type: 'video', title: 'Schrödinger Explained', duration: '22 min', completed: false }],
        dependencies: ['quantum_mechanics'],
      },
    ],
  },
  {
    id: 'classical_mechanics',
    label: 'Classical Mechanics',
    cluster: 'Physics',
    type: 'topic',
    difficulty: 3,
    progress: 0.8,
    orbitRadius: 7,
    orbitSpeed: 1.4,
    angle: 150,
    color: '#6DAEDB',
    description: "Newton's laws and motion",
    resources: [
      { id: 'r17', type: 'video', title: "Newton's Laws", duration: '12 min', completed: true },
      { id: 'r18', type: 'quiz', title: 'Mechanics Quiz', completed: true },
    ],
    dependencies: [],
    children: [],
  },
  {
    id: 'electromagnetism',
    label: 'Electromagnetism',
    cluster: 'Physics',
    type: 'topic',
    difficulty: 4,
    progress: 0.5,
    orbitRadius: 11,
    orbitSpeed: 0.9,
    angle: 240,
    color: '#6DAEDB',
    description: 'Electric and magnetic fields',
    resources: [
      { id: 'r19', type: 'video', title: "Maxwell's Equations", duration: '16 min', completed: true },
      { id: 'r20', type: 'exercise', title: 'EM Problems', completed: false },
    ],
    dependencies: [],
    children: [
      {
        id: 'gaussian_law',
        label: "Gauss's Law",
        cluster: 'Physics',
        type: 'subtopic',
        difficulty: 4,
        progress: 0.6,
        orbitRadius: 2.6,
        orbitSpeed: 1.3,
        angle: 100,
        color: '#6DAEDB',
        description: 'Electric flux and charge distribution',
        resources: [{ id: 'r21', type: 'article', title: "Gauss's Law Guide", completed: true }],
        dependencies: ['electromagnetism'],
      },
    ],
  },
];

// Computer Science Galaxy
const csTopics: OrbitNode[] = [
  {
    id: 'data_structures',
    label: 'Data Structures',
    cluster: 'Computer Science',
    type: 'topic',
    difficulty: 3,
    progress: 0.7,
    orbitRadius: 9,
    orbitSpeed: 1.1,
    angle: 45,
    color: '#C27BA0',
    description: 'Organizing and storing data efficiently',
    resources: [
      { id: 'r22', type: 'video', title: 'Arrays & Lists', duration: '10 min', completed: true },
      { id: 'r23', type: 'exercise', title: 'DS Practice', completed: true },
    ],
    dependencies: [],
    children: [
      {
        id: 'binary_trees',
        label: 'Binary Trees',
        cluster: 'Computer Science',
        type: 'subtopic',
        difficulty: 4,
        progress: 0.65,
        orbitRadius: 2.9,
        orbitSpeed: 1.4,
        angle: 170,
        color: '#C27BA0',
        description: 'Hierarchical tree data structure',
        resources: [{ id: 'r24', type: 'video', title: 'Binary Tree Traversal', duration: '14 min', completed: true }],
        dependencies: ['data_structures'],
      },
      {
        id: 'hash_tables',
        label: 'Hash Tables',
        cluster: 'Computer Science',
        type: 'subtopic',
        difficulty: 3,
        progress: 0.8,
        orbitRadius: 2.7,
        orbitSpeed: 1.6,
        angle: 290,
        color: '#C27BA0',
        description: 'Fast key-value lookup structures',
        resources: [{ id: 'r25', type: 'article', title: 'Hashing Explained', completed: true }],
        dependencies: ['data_structures'],
      },
    ],
  },
  {
    id: 'algorithms',
    label: 'Algorithms',
    cluster: 'Computer Science',
    type: 'topic',
    difficulty: 4,
    progress: 0.45,
    orbitRadius: 13,
    orbitSpeed: 0.7,
    angle: 135,
    color: '#C27BA0',
    description: 'Problem-solving techniques and optimization',
    resources: [
      { id: 'r26', type: 'video', title: 'Algorithm Analysis', duration: '18 min', completed: true },
      { id: 'r27', type: 'exercise', title: 'Sorting Algorithms', completed: false },
    ],
    dependencies: ['data_structures'],
    children: [
      {
        id: 'dynamic_programming',
        label: 'Dynamic Programming',
        cluster: 'Computer Science',
        type: 'subtopic',
        difficulty: 5,
        progress: 0.3,
        orbitRadius: 3.3,
        orbitSpeed: 0.8,
        angle: 220,
        color: '#C27BA0',
        description: 'Optimization by breaking into subproblems',
        resources: [{ id: 'r28', type: 'video', title: 'DP Intro', duration: '25 min', completed: false }],
        dependencies: ['algorithms'],
      },
    ],
  },
  {
    id: 'machine_learning',
    label: 'Machine Learning',
    cluster: 'Computer Science',
    type: 'topic',
    difficulty: 5,
    progress: 0.2,
    orbitRadius: 15,
    orbitSpeed: 0.5,
    angle: 300,
    color: '#C27BA0',
    description: 'Teaching computers to learn from data',
    resources: [
      { id: 'r29', type: 'video', title: 'ML Basics', duration: '22 min', completed: true },
      { id: 'r30', type: 'article', title: 'Neural Networks', completed: false },
    ],
    dependencies: ['linear_algebra', 'probability'],
    children: [],
  },
];

export const GALAXY_CLUSTERS: GalaxyCluster[] = [
  {
    id: 'math_galaxy',
    name: 'Mathematics',
    color: '#C9B458',
    centerPosition: [0, 0, 0],
    topics: mathTopics,
  },
  {
    id: 'physics_galaxy',
    name: 'Physics',
    color: '#6DAEDB',
    centerPosition: [35, 0, 0],
    topics: physicsTopics,
  },
  {
    id: 'cs_galaxy',
    name: 'Computer Science',
    color: '#C27BA0',
    centerPosition: [-35, 0, 0],
    topics: csTopics,
  },
];

// Helper to flatten all nodes for search/filtering
export function getAllNodes(): OrbitNode[] {
  const nodes: OrbitNode[] = [];
  
  GALAXY_CLUSTERS.forEach(cluster => {
    cluster.topics.forEach(topic => {
      nodes.push(topic);
      if (topic.children) {
        nodes.push(...topic.children);
      }
    });
  });
  
  return nodes;
}

// Get node by ID
export function getNodeById(id: string): OrbitNode | undefined {
  return getAllNodes().find(node => node.id === id);
}

// Calculate progress color
export function getProgressColor(progress: number): string {
  if (progress < 0.3) return '#6DAEDB'; // Blue - just started
  if (progress < 0.7) return '#C9B458'; // Gold - in progress
  return '#C27BA0'; // Pink - nearly complete
}

// Calculate difficulty label
export function getDifficultyLabel(difficulty: number): string {
  const labels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
  return labels[difficulty - 1] || 'Unknown';
}
