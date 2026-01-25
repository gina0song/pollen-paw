interface PollenTypeInfo {
  code: string;
  indexInfo?: {
    value: number;
  };
  healthRecommendations?: string[];
}

export interface ExtractedPollenValues {
  grassPollen: number;
  treePollen: number;
  weedPollen: number;
  grassRecommendations: string[];
  treeRecommendations: string[];
  weedRecommendations: string[];
}

// Function to extract pollen values and recommendations from pollenTypeInfo array
export function extractPollenValues(
  pollenTypeInfo: PollenTypeInfo[]
): ExtractedPollenValues {
  const grass = pollenTypeInfo.find((p) => p.code === 'GRASS');
  const tree = pollenTypeInfo.find((p) => p.code === 'TREE');
  const weed = pollenTypeInfo.find((p) => p.code === 'WEED');

  return {
    grassPollen: grass?.indexInfo?.value ?? 0,
    treePollen: tree?.indexInfo?.value ?? 0,
    weedPollen: weed?.indexInfo?.value ?? 0,
    grassRecommendations: grass?.healthRecommendations ?? [],
    treeRecommendations: tree?.healthRecommendations ?? [],
    weedRecommendations: weed?.healthRecommendations ?? [],
  };
}

// Combine all unique health recommendations from different pollen types
export function combineRecommendations(
  extracted: ExtractedPollenValues
): string[] {
  const allRecommendations = [
    ...extracted.grassRecommendations,
    ...extracted.treeRecommendations,
    ...extracted.weedRecommendations,
  ];

  // Remove duplicates
  return Array.from(new Set(allRecommendations));
}