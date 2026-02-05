import { ClusterConfig, ClusterType } from '@/types/navigation';

export const NAVIGATION_CLUSTERS: Record<ClusterType, ClusterConfig> = {
  'learning-tools': {
    id: 'learning-tools',
    label: 'Learning Tools',
    icon: 'GraduationCap',
    isPermanent: false,
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    description: 'AI-powered learning and study tools',
    items: [
      {
        id: 'ai-bot',
        label: 'AI Bot',
        icon: 'Bot',
        href: '/ai-bot',
        description: 'Your personal AI tutor',
        color: 'from-pink-500 to-purple-500',
      },
      {
        id: 'roadmap',
        label: 'Roadmap',
        icon: 'Map',
        href: '/roadmap',
        description: 'Structured learning paths',
        color: 'from-purple-500 to-indigo-500',
      },
      {
        id: 'courses',
        label: 'Courses',
        icon: 'BookOpen',
        href: '/courses',
        description: 'Browse all courses',
        color: 'from-indigo-500 to-blue-500',
      },
      {
        id: 'study-planner',
        label: 'Study Planner',
        icon: 'Calendar',
        href: '/study-planner',
        description: 'Plan your study sessions',
        color: 'from-blue-500 to-cyan-500',
      },
      {
        id: 'community',
        label: 'Community',
        icon: 'Users',
        href: '/community',
        description: 'Connect with learners',
        color: 'from-cyan-500 to-teal-500',
      },
    ],
  },
  'sign-language': {
    id: 'sign-language',
    label: 'Sign Language',
    icon: 'Hand',
    isPermanent: true,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    description: 'Learn and practice sign language',
    items: [
      {
        id: 'sign-language',
        label: 'Sign Language',
        icon: 'Hand',
        href: '/sign-language',
        description: 'Sign language hub',
      },
    ],
  },
  'visualization-tools': {
    id: 'visualization-tools',
    label: 'Visualization Tools',
    icon: 'Sparkles',
    isPermanent: false,
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
    description: 'Creative learning visualization',
    items: [
      {
        id: 'workspace',
        label: 'Content Generator',
        icon: 'LayoutGrid',
        href: '/workspace',
        description: 'Unified OS workspace',
        color: 'from-fuchsia-500 to-pink-500',
      },
      {
        id: 'knowledge-orbit',
        label: 'Galaxy Graph',
        icon: 'Globe',
        href: '/knowledge-orbit',
        description: '3D knowledge universe',
        color: 'from-pink-500 to-rose-500',
      },
      {
        id: 'study-vr',
        label: 'Visual Minds',
        icon: 'Glasses',
        href: '/study-vr',
        description: 'Immersive VR learning',
        color: 'from-rose-500 to-red-500',
      },
      {
        id: 'adaptive-content',
        label: 'Adaptive Content',
        icon: 'Zap',
        href: '/adaptive-content',
        description: 'Personalized learning',
        color: 'from-red-500 to-orange-500',
      },
    ],
  },
  'supportive-tools': {
    id: 'supportive-tools',
    label: 'Supportive Tools',
    icon: 'Heart',
    isPermanent: false,
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    description: 'Support for your learning journey',
    items: [
      {
        id: 'schemes',
        label: 'Government Schemes',
        icon: 'Award',
        href: '/schemes',
        description: 'Find scholarships',
        color: 'from-green-500 to-emerald-500',
      },
      {
        id: 'wellness',
        label: 'Mental Wellness',
        icon: 'Heart',
        href: '/wellness',
        description: 'Mental health support',
        color: 'from-emerald-500 to-teal-500',
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        icon: 'Target',
        href: '/smart-opportunities',
        description: 'Career opportunities',
        color: 'from-teal-500 to-cyan-500',
      },
      {
        id: 'analytics',
        label: 'Performance Analytics',
        icon: 'BarChart3',
        href: '/analytics',
        description: 'Track your progress',
        color: 'from-cyan-500 to-blue-500',
      },
      {
        id: 'performance-tiers',
        label: 'Performance Tiers',
        icon: 'Trophy',
        href: '/performance-tiers',
        description: 'Level up your skills',
        color: 'from-blue-500 to-indigo-500',
      },
    ],
  },
  'unified-os': {
    id: 'unified-os',
    label: 'Unified OS',
    icon: 'Sparkles',
    isPermanent: true,
    gradient: 'from-gold via-amber-500 to-yellow-500',
    description: 'Your unified learning workspace',
    items: [
      {
        id: 'unified-os',
        label: 'Unified OS',
        icon: 'Sparkles',
        href: '/unified-os',
        description: 'Premium workspace',
      },
    ],
  },
};

// Get all cluster items as a flat array for routing
export const getAllNavigationItems = () => {
  return Object.values(NAVIGATION_CLUSTERS).flatMap(cluster => cluster.items);
};

// Get cluster by item href
export const getClusterByHref = (href: string): ClusterConfig | null => {
  for (const cluster of Object.values(NAVIGATION_CLUSTERS)) {
    if (cluster.items.some(item => item.href === href)) {
      return cluster;
    }
  }
  return null;
};
