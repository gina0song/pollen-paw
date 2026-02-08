interface PlantInfo {
  code: string;
  displayName: string;
  inSeason?: boolean;
  indexInfo?: {
    value: number;
    category?: string;
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


function getPollenTypeForPlant(plantCode: string): "TREE" | "GRASS" | "WEED" | null {
  const TREE_PLANTS = [
    "MAPLE",
    "ELM",
    "COTTONWOOD",
    "ALDER",
    "BIRCH",
    "ASH",
    "PINE",
    "OAK",
    "JUNIPER"
  ];

  const GRASS_PLANTS = ["GRAMINALES"];

  const WEED_PLANTS = ["RAGWEED"];

  if (TREE_PLANTS.includes(plantCode)) return "TREE";
  if (GRASS_PLANTS.includes(plantCode)) return "GRASS";
  if (WEED_PLANTS.includes(plantCode)) return "WEED";

  return null;
}


export function extractPollenValues(
  plantInfo: PlantInfo[]
): ExtractedPollenValues {
  
  const treeValues: number[] = [];
  const grassValues: number[] = [];
  const weedValues: number[] = [];

  const treeRecommendations: Set<string> = new Set();
  const grassRecommendations: Set<string> = new Set();
  const weedRecommendations: Set<string> = new Set();

  for (const plant of plantInfo) {
    const pollenType = getPollenTypeForPlant(plant.code);
    
    if (!plant.indexInfo?.value) continue;

    const value = plant.indexInfo.value;
    const recommendations = plant.healthRecommendations ?? [];

    switch (pollenType) {
      case "TREE":
        treeValues.push(value);
        recommendations.forEach(rec => treeRecommendations.add(rec));
        break;
      case "GRASS":
        grassValues.push(value);
        recommendations.forEach(rec => grassRecommendations.add(rec));
        break;
      case "WEED":
        weedValues.push(value);
        recommendations.forEach(rec => weedRecommendations.add(rec));
        break;
    }
  }

  const calculateAverage = (values: number[]): number => {
    if (values.length === 0) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  };

  return {
    treePollen: calculateAverage(treeValues),
    grassPollen: calculateAverage(grassValues),
    weedPollen: calculateAverage(weedValues),
    treeRecommendations: Array.from(treeRecommendations),
    grassRecommendations: Array.from(grassRecommendations),
    weedRecommendations: Array.from(weedRecommendations),
  };
}


export function combineRecommendations(
  extracted: ExtractedPollenValues
): string[] {
  const allRecommendations = [
    ...extracted.treeRecommendations,
    ...extracted.grassRecommendations,
    ...extracted.weedRecommendations,
  ];

  return Array.from(new Set(allRecommendations));
}
