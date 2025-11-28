import { describe, it, expect } from 'vitest';
import {
  formatIndonesianDate,
  formatIndonesianTime,
  formatIndonesianNumber,
  getEmotionLabel,
  getEmotionEmoji,
  isNegativeEmotion,
  validateNoteLength,
} from './utils';

describe('formatIndonesianDate', () => {
  it('should format date in Indonesian locale', () => {
    const date = new Date('2025-11-27'); // Thursday
    const formatted = formatIndonesianDate(date);
    
    // Should contain day name, date, month name, and year
    expect(formatted).toContain('27');
    expect(formatted).toContain('November');
    expect(formatted).toContain('2025');
  });

  it('should handle string input', () => {
    const formatted = formatIndonesianDate('2025-11-27');
    expect(formatted).toContain('November');
    expect(formatted).toContain('2025');
  });

  it('should produce format like "Senin, 27 November 2025"', () => {
    const date = new Date('2025-01-06'); // Monday
    const formatted = formatIndonesianDate(date);
    expect(formatted).toMatch(/^(Minggu|Senin|Selasa|Rabu|Kamis|Jumat|Sabtu), \d{1,2} \w+ \d{4}$/);
  });
});

describe('formatIndonesianTime', () => {
  it('should format time in 24-hour format', () => {
    const date = new Date('2025-11-27T13:45:00');
    const formatted = formatIndonesianTime(date);
    expect(formatted).toBe('13:45');
  });

  it('should pad single digits with zero', () => {
    const date = new Date('2025-11-27T09:05:00');
    const formatted = formatIndonesianTime(date);
    expect(formatted).toBe('09:05');
  });

  it('should handle string input', () => {
    const formatted = formatIndonesianTime('2025-11-27T15:30:00');
    expect(formatted).toBe('15:30');
  });
});

describe('formatIndonesianNumber', () => {
  it('should format numbers with Indonesian conventions', () => {
    expect(formatIndonesianNumber(1000)).toContain('1');
    expect(formatIndonesianNumber(1000)).toContain('000');
  });

  it('should handle small numbers', () => {
    expect(formatIndonesianNumber(5)).toBe('5');
  });

  it('should handle large numbers', () => {
    const formatted = formatIndonesianNumber(1000000);
    expect(formatted).toContain('1');
    expect(formatted).toContain('000');
  });
});

describe('getEmotionLabel', () => {
  it('should return Indonesian label for happy', () => {
    expect(getEmotionLabel('happy')).toBe('Senang');
  });

  it('should return Indonesian label for neutral', () => {
    expect(getEmotionLabel('neutral')).toBe('Baik');
  });

  it('should return Indonesian label for normal', () => {
    expect(getEmotionLabel('normal')).toBe('Biasa Saja');
  });

  it('should return Indonesian label for stressed', () => {
    expect(getEmotionLabel('stressed')).toBe('Sedih');
  });

  it('should return Indonesian label for sleepy', () => {
    expect(getEmotionLabel('sleepy')).toBe('Mengantuk');
  });

  it('should return original value for unknown emotion', () => {
    expect(getEmotionLabel('unknown')).toBe('unknown');
  });
});

describe('getEmotionEmoji', () => {
  it('should return correct emoji for each emotion', () => {
    expect(getEmotionEmoji('happy')).toBe('😊');
    expect(getEmotionEmoji('neutral')).toBe('👍');
    expect(getEmotionEmoji('normal')).toBe('😐');
    expect(getEmotionEmoji('stressed')).toBe('😔');
    expect(getEmotionEmoji('sleepy')).toBe('😴');
  });

  it('should return default emoji for unknown emotion', () => {
    expect(getEmotionEmoji('unknown')).toBe('😐');
  });
});

describe('isNegativeEmotion', () => {
  it('should return true for stressed emotion', () => {
    expect(isNegativeEmotion('stressed')).toBe(true);
  });

  it('should return true for sleepy emotion', () => {
    expect(isNegativeEmotion('sleepy')).toBe(true);
  });

  it('should return false for positive emotions', () => {
    expect(isNegativeEmotion('happy')).toBe(false);
    expect(isNegativeEmotion('neutral')).toBe(false);
    expect(isNegativeEmotion('normal')).toBe(false);
  });
});

describe('validateNoteLength', () => {
  it('should return true for notes under 100 characters', () => {
    expect(validateNoteLength('Short note')).toBe(true);
    expect(validateNoteLength('A'.repeat(50))).toBe(true);
    expect(validateNoteLength('A'.repeat(100))).toBe(true);
  });

  it('should return false for notes over 100 characters', () => {
    expect(validateNoteLength('A'.repeat(101))).toBe(false);
    expect(validateNoteLength('A'.repeat(150))).toBe(false);
  });

  it('should return true for empty string', () => {
    expect(validateNoteLength('')).toBe(true);
  });
});
