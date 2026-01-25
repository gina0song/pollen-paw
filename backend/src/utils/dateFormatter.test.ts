import { formatDate, formatApiDate, isValidDateFormat } from './dateFormatter';

describe('dateFormatter', () => {
  describe('formatDate', () => {
    it('should format single-digit month and day with leading zeros', () => {
      expect(formatDate(2026, 1, 5)).toBe('2026-01-05');
      expect(formatDate(2026, 3, 9)).toBe('2026-03-09');
    });

    it('should format double-digit month and day without changes', () => {
      expect(formatDate(2026, 12, 25)).toBe('2026-12-25');
      expect(formatDate(2026, 10, 15)).toBe('2026-10-15');
    });

    it('should handle edge case dates', () => {
      expect(formatDate(2026, 1, 1)).toBe('2026-01-01');
      expect(formatDate(2026, 12, 31)).toBe('2026-12-31');
    });

    it('should handle leap year dates', () => {
      expect(formatDate(2024, 2, 29)).toBe('2024-02-29');
    });

    it('should format dates from different years', () => {
      expect(formatDate(2025, 6, 15)).toBe('2025-06-15');
      expect(formatDate(2027, 8, 20)).toBe('2027-08-20');
    });

    it('should handle year 2000 and earlier', () => {
      expect(formatDate(2000, 1, 1)).toBe('2000-01-01');
      expect(formatDate(1999, 12, 31)).toBe('1999-12-31');
    });
  });

  describe('formatApiDate', () => {
    it('should format API date object correctly', () => {
      const apiDate = { year: 2026, month: 1, day: 23 };
      expect(formatApiDate(apiDate)).toBe('2026-01-23');
    });

    it('should handle various API date objects', () => {
      expect(formatApiDate({ year: 2026, month: 12, day: 31 })).toBe(
        '2026-12-31'
      );
      expect(formatApiDate({ year: 2025, month: 7, day: 4 })).toBe(
        '2025-07-04'
      );
    });

    it('should pad single-digit values in API date object', () => {
      expect(formatApiDate({ year: 2026, month: 3, day: 5 })).toBe(
        '2026-03-05'
      );
    });
  });

  describe('isValidDateFormat', () => {
    it('should return true for valid ISO 8601 dates', () => {
      expect(isValidDateFormat('2026-01-23')).toBe(true);
      expect(isValidDateFormat('2025-12-31')).toBe(true);
      expect(isValidDateFormat('2024-02-29')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidDateFormat('2026-1-23')).toBe(false); // Single-digit month
      expect(isValidDateFormat('2026-01-3')).toBe(false); // Single-digit day
      expect(isValidDateFormat('26-01-23')).toBe(false); // Two-digit year
      expect(isValidDateFormat('2026/01/23')).toBe(false); // Wrong separator
      expect(isValidDateFormat('01-23-2026')).toBe(false); // Wrong order
    });

    it('should return false for non-date strings', () => {
      expect(isValidDateFormat('not a date')).toBe(false);
      expect(isValidDateFormat('')).toBe(false);
      expect(isValidDateFormat('abc-def-ghi')).toBe(false);
    });

    it('should check format only, not date validity', () => {
      // These have correct format but invalid dates
      expect(isValidDateFormat('2026-13-45')).toBe(true);
      expect(isValidDateFormat('2026-00-00')).toBe(true);
    });
  });
});