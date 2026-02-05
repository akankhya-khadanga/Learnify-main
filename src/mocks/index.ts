/**
 * MOCK DATA - Central Export
 * Import mock data from this file throughout the application
 * 
 * Usage:
 * import { MOCK_CURRENT_USER, MOCK_COURSES, generateMockAIResponse } from '@/mocks';
 */

// Users
export * from './users';

// Courses
export * from './courses';

// AI Messages
export * from './aiMessages';

// Analytics
export * from './analytics';

// Community
export * from './community';

// Notes
export * from './notes';

// Study Planner
export * from './studyPlanner';

// Roadmaps
export * from './roadmaps';

// Verified Sources (Phase 14)
export * from './verifiedSources';

// Deadline Radar (Phase 16)
export * from './deadlineRadar';

// Adaptive Content (Phase 17)
export * from './adaptiveContent';

// Knowledge Orbit (Phase 18)
export * from './knowledgeOrbit';

// Game Hub (Phase 19)
export * from './gameHub';

// Performance Tiers (Phase 23)
export * from './performanceTiers';

// Smart Opportunities (Phase 24)
export * from './opportunities';

// Wellness & Motivation (Phase 25)
export * from './wellness';

// Government Schemes (Phase 28)
export * from './schemes';

// Game System (Phase 31)
export * from './game';

// Multiplayer System (Phase 32)
export * from './multiplayer';

// VR Collaborators (Phase 33)
export * from './vrCollaborators';

/**
 * Configuration flag to enable/disable mock data
 * Set to false when backend is ready
 */
export const USE_MOCK_DATA = false;

/**
 * Simulated network delay for realistic UI testing
 */
export const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Mock API response wrapper
 * Simulates async API calls with delays
 */
export async function mockApiCall<T>(
  data: T,
  delay: number = 500,
  shouldFail: boolean = false
): Promise<T> {
  await mockDelay(delay);

  if (shouldFail) {
    throw new Error('Mock API call failed');
  }

  return data;
}
