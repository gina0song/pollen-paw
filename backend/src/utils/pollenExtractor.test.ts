import { extractPollenValues, combineRecommendations } from './pollenExtractor';

describe('pollenExtractor', () => {
  describe('extractPollenValues', () => {
    it('should extract all pollen values correctly', () => {
      const pollenTypeInfo = [
        {
          code: 'GRASS',
          indexInfo: { value: 3 },
          healthRecommendations: ['Wear sunglasses'],
        },
        {
          code: 'TREE',
          indexInfo: { value: 2 },
          healthRecommendations: ['Stay indoors'],
        },
        {
          code: 'WEED',
          indexInfo: { value: 1 },
          healthRecommendations: ['Take medication'],
        },
      ];

      const result = extractPollenValues(pollenTypeInfo);

      expect(result.grassPollen).toBe(3);
      expect(result.treePollen).toBe(2);
      expect(result.weedPollen).toBe(1);
      expect(result.grassRecommendations).toEqual(['Wear sunglasses']);
      expect(result.treeRecommendations).toEqual(['Stay indoors']);
      expect(result.weedRecommendations).toEqual(['Take medication']);
    });

    it('should handle missing pollen types with default values', () => {
      const pollenTypeInfo = [
        {
          code: 'GRASS',
          indexInfo: { value: 2 },
          healthRecommendations: ['Test'],
        },
      ];

      const result = extractPollenValues(pollenTypeInfo);

      expect(result.grassPollen).toBe(2);
      expect(result.treePollen).toBe(0);
      expect(result.weedPollen).toBe(0);
      expect(result.treeRecommendations).toEqual([]);
      expect(result.weedRecommendations).toEqual([]);
    });

    it('should handle missing indexInfo with default value 0', () => {
      const pollenTypeInfo = [
        {
          code: 'GRASS',
          healthRecommendations: ['Test'],
        },
        {
          code: 'TREE',
          indexInfo: { value: 3 },
        },
      ];

      const result = extractPollenValues(pollenTypeInfo);

      expect(result.grassPollen).toBe(0);
      expect(result.treePollen).toBe(3);
    });

    it('should handle missing healthRecommendations with empty array', () => {
      const pollenTypeInfo = [
        {
          code: 'GRASS',
          indexInfo: { value: 2 },
        },
      ];

      const result = extractPollenValues(pollenTypeInfo);

      expect(result.grassRecommendations).toEqual([]);
    });

    it('should handle empty pollenTypeInfo array', () => {
      const result = extractPollenValues([]);

      expect(result.grassPollen).toBe(0);
      expect(result.treePollen).toBe(0);
      expect(result.weedPollen).toBe(0);
      expect(result.grassRecommendations).toEqual([]);
      expect(result.treeRecommendations).toEqual([]);
      expect(result.weedRecommendations).toEqual([]);
    });

    it('should ignore unknown pollen types', () => {
      const pollenTypeInfo = [
        {
          code: 'UNKNOWN',
          indexInfo: { value: 5 },
        },
        {
          code: 'GRASS',
          indexInfo: { value: 2 },
        },
      ];

      const result = extractPollenValues(pollenTypeInfo);

      expect(result.grassPollen).toBe(2);
      expect(result.treePollen).toBe(0);
      expect(result.weedPollen).toBe(0);
    });
  });

  describe('combineRecommendations', () => {
    it('should combine all recommendations', () => {
      const extracted = {
        grassPollen: 3,
        treePollen: 2,
        weedPollen: 1,
        grassRecommendations: ['Wear sunglasses', 'Stay indoors'],
        treeRecommendations: ['Take medication'],
        weedRecommendations: ['Avoid outdoor activities'],
      };

      const result = combineRecommendations(extracted);

      expect(result).toHaveLength(4);
      expect(result).toContain('Wear sunglasses');
      expect(result).toContain('Stay indoors');
      expect(result).toContain('Take medication');
      expect(result).toContain('Avoid outdoor activities');
    });

    it('should remove duplicate recommendations', () => {
      const extracted = {
        grassPollen: 3,
        treePollen: 2,
        weedPollen: 1,
        grassRecommendations: ['Wear sunglasses', 'Stay indoors'],
        treeRecommendations: ['Wear sunglasses', 'Take medication'],
        weedRecommendations: ['Stay indoors'],
      };

      const result = combineRecommendations(extracted);

      expect(result).toHaveLength(3);
      expect(result.filter((r) => r === 'Wear sunglasses')).toHaveLength(1);
      expect(result.filter((r) => r === 'Stay indoors')).toHaveLength(1);
    });

    it('should handle empty recommendations', () => {
      const extracted = {
        grassPollen: 0,
        treePollen: 0,
        weedPollen: 0,
        grassRecommendations: [],
        treeRecommendations: [],
        weedRecommendations: [],
      };

      const result = combineRecommendations(extracted);

      expect(result).toEqual([]);
    });
  });
});