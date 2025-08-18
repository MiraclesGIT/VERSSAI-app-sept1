
// Utility functions for startup-related operations

/**
 * Generates a random brand color for startup logos
 * @returns A hex color code
 */
export const getRandomColor = () => {
  const colors = [
    '#8B5CF6', // purple
    '#06B6D4', // cyan
    '#EC4899', // pink
    '#0EA5E9', // blue
    '#10B981', // green
    '#F59E0B', // yellow
    '#EF4444'  // red
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Generates logo initials from a startup name
 * @param name The startup name
 * @returns Uppercase initials (up to 2 characters)
 */
export const generateLogoInitials = (name: string): string => {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

/**
 * Generates a random readiness score for a startup (only used when manually generating)
 * @returns A number between 40 and 90
 */
export const generateReadinessScore = (): number => {
  return Math.floor(Math.random() * 51) + 40;
};
