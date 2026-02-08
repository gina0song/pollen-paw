import { calculatePollenLevel, getMaxPollenValue } from './pollenCalculator';

describe('pollenCalculator', () => {
  describe('calculatePollenLevel', () => {
    it('should return LOW when all values are 0', () => {
      expect(calculatePollenLevel(0, 0, 0)).toBe('LOW');
    });
    
    it('should return LOW when all values are below 2', () => {
      expect(calculatePollenLevel(1, 1, 1)).toBe('LOW');
      expect(calculatePollenLevel(0, 1, 1.5)).toBe('LOW');
    });
    it('should return MODERATE when max value is exactly 2', () => {
      expect(calculatePollenLevel(2, 0, 0)).toBe('MODERATE');
      expect(calculatePollenLevel(0, 2, 1)).toBe('MODERATE');
      expect(calculatePollenLevel(1, 1, 2)).toBe('MODERATE');
    });
    
    it('should return MODERATE when max value is between 2 and 3', () => {
      expect(calculatePollenLevel(2.5, 1, 0)).toBe('MODERATE');
      expect(calculatePollenLevel(0, 2.9, 1)).toBe('MODERATE');
    });
    it('should return HIGH when max value is exactly 3', () => {
      expect(calculatePollenLevel(3, 0, 0)).toBe('HIGH');
      expect(calculatePollenLevel(0, 3, 2)).toBe('HIGH');
      expect(calculatePollenLevel(2, 1, 3)).toBe('HIGH');
    });

    it('should return HIGH when max value is between 3 and 4', () => {
      expect(calculatePollenLevel(3.5, 2, 1)).toBe('HIGH');
      expect(calculatePollenLevel(1, 3.9, 0)).toBe('HIGH');
    });
    it('should return VERY_HIGH when max value is 4 or above', () => {
      expect(calculatePollenLevel(4, 0, 0)).toBe('VERY_HIGH');
      expect(calculatePollenLevel(0, 4, 3)).toBe('VERY_HIGH');
      expect(calculatePollenLevel(2, 1, 5)).toBe('VERY_HIGH');
    });

    it('should handle edge case with very large values', () => {
      expect(calculatePollenLevel(100, 0, 0)).toBe('VERY_HIGH');
      expect(calculatePollenLevel(0, 999, 0)).toBe('VERY_HIGH');
    });
    it('should prioritize the highest value among multiple types', () => {
      expect(calculatePollenLevel(1, 4, 2)).toBe('VERY_HIGH');
      expect(calculatePollenLevel(3, 2, 1)).toBe('HIGH');
      expect(calculatePollenLevel(2, 1, 0)).toBe('MODERATE');
    });
  });
  describe('getMaxPollenValue', () => {
    it('should return the maximum value', () => {
      expect(getMaxPollenValue(1, 2, 3)).toBe(3);
      expect(getMaxPollenValue(5, 2, 1)).toBe(5);
      expect(getMaxPollenValue(2, 4, 3)).toBe(4);
    });
    it('should handle all equal values', () => {
      expect(getMaxPollenValue(2, 2, 2)).toBe(2);
    });
    it('should handle zero values', () => {
      expect(getMaxPollenValue(0, 0, 0)).toBe(0);
      expect(getMaxPollenValue(0, 3, 0)).toBe(3);
    });
  });
});