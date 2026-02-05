/**
 * Color gradients for different course categories
 * Based on Learnify's purple/pink/neon green color palette
 */

export const categoryColors = {
    // Tech & Programming
    tech: { start: '#BF5AF2', end: '#FF6EC7' }, // Purple → Pink
    coding: { start: '#BF5AF2', end: '#8B5CF6' }, // Purple → Deep Purple
    webdev: { start: '#BEFF00', end: '#00FF88' }, // Neon Green → Teal

    // AI & Data
    ai: { start: '#BF5AF2', end: '#FF6EC7' }, // Purple → Pink
    ml: { start: '#A855F7', end: '#EC4899' }, // Violet → Pink
    data: { start: '#6366F1', end: '#8B5CF6' }, // Indigo → Purple

    // Creative
    design: { start: '#FF6EC7', end: '#FFA500' }, // Pink → Orange
    arts: { start: '#FF6EC7', end: '#FFD700' }, // Pink → Gold
    media: { start: '#F472B6', end: '#FB923C' }, // Pink → Orange

    // Business & Professional
    business: { start: '#3B82F6', end: '#06B6D4' }, // Blue → Cyan
    finance: { start: '#059669', end: '#10B981' }, // Emerald → Green
    marketing: { start: '#F59E0B', end: '#F97316' }, // Amber → Orange

    // Academic
    science: { start: '#8B5CF6', end: '#06B6D4' }, // Purple → Cyan
    medical: { start: '#EC4899', end: '#F97316' }, // Pink → Orange
    language: { start: '#BEFF00', end: '#FBBF24' }, // Neon → Amber
    upsc: { start: '#3B82F6', end: '#8B5CF6' }, // Blue → Purple
    school: { start: '#BEFF00', end: '#10B981' }, // Neon → Green

    // Default
    default: { start: '#BF5AF2', end: '#FF6EC7' }, // Purple → Pink
};

/**
 * Get gradient colors for a course based on its category
 */
export function getCourseColors(category?: string): { start: string; end: string } {
    if (!category) return categoryColors.default;

    const normalized = category.toLowerCase().trim();
    return categoryColors[normalized as keyof typeof categoryColors] || categoryColors.default;
}

/**
 * Level-based color variations
 * Can be combined with category colors for more variety
 */
export const levelTints = {
    beginner: { tint: 0.2, brightness: 1.1 },  // Lighter, brighter
    intermediate: { tint: 0, brightness: 1 },    // Normal
    advanced: { tint: -0.1, brightness: 0.9 },   // Darker, more intense
};

/**
 * Generate random gradient from pool for courses without category
 */
const gradientPool = [
    { start: '#BF5AF2', end: '#FF6EC7' },
    { start: '#BEFF00', end: '#00FF88' },
    { start: '#FF6EC7', end: '#FFA500' },
    { start: '#8B5CF6', end: '#06B6D4' },
    { start: '#A855F7', end: '#EC4899' },
];

export function getRandomGradient(seed?: string): { start: string; end: string } {
    if (seed) {
        // Use seed to get consistent "random" gradient
        const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return gradientPool[hash % gradientPool.length];
    }
    return gradientPool[Math.floor(Math.random() * gradientPool.length)];
}
