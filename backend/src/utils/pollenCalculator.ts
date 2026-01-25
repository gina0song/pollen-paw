// Utility functions for pollen level calculations
export function calculatePollenLevel(
  grass: number,
  tree: number,
  weed: number
): string {
  const maxValue = Math.max(grass, tree, weed);
  
  if (maxValue >= 4) return 'VERY_HIGH';
  if (maxValue >= 3) return 'HIGH';
  if (maxValue >= 2) return 'MODERATE';
  return 'LOW';
}

// Function to get the maximum pollen value among the three types
export function getMaxPollenValue(
  grass: number,
  tree: number,
  weed: number
): number {
  return Math.max(grass, tree, weed);
}