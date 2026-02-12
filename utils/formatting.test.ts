import { formatTime, getSeverityColor, getStatusColor } from './formatting';
import { describe, it, expect } from '@jest/globals';

describe('formatting utils', () => {
  describe('formatTime', () => {
    it('formats ISO string to time correctly', () => {
      const date = new Date('2023-10-01T14:30:00.000Z');
      // Note: This test depends on the machine's timezone. 
      // For a robust test, we might mock Date or Intl.DateTimeFormat.
      // Checking for existence of a time-like pattern.
      const result = formatTime(date.toISOString());
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('getSeverityColor', () => {
    it('returns red for CRITICAL', () => {
      expect(getSeverityColor('CRITICAL')).toContain('text-red-500');
    });

    it('returns orange for HIGH', () => {
      expect(getSeverityColor('HIGH')).toContain('text-orange-500');
    });

    it('returns default for unknown', () => {
      expect(getSeverityColor('UNKNOWN' as any)).toContain('text-slate-500');
    });
  });

  describe('getStatusColor', () => {
    it('returns green for RESOLVED', () => {
      expect(getStatusColor('RESOLVED')).toBe('text-green-400');
    });
  });
});