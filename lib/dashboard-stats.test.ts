import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateDashboardStats,
  calculateEmotionDistribution,
  getSemanticColor,
  getEmotionColor,
} from './dashboard-stats';
import type { EmotionCheckin, EmotionType } from './types';

// Generators for property-based testing
const emotionGenerator = fc.constantFrom<EmotionType>(
  'happy',
  'neutral',
  'normal',
  'stressed',
  'sleepy'
);

const checkinGenerator = fc.record({
  id: fc.uuid(),
  student_id: fc.uuid(),
  emotion: emotionGenerator,
  note: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  created_at: fc.constant(new Date().toISOString()),
});

const checkinsArrayGenerator = fc.array(checkinGenerator, { minLength: 0, maxLength: 50 });

describe('Dashboard Stats Calculations', () => {
  describe('Unit Tests', () => {
    it('should return zero stats for empty checkins', () => {
      const stats = calculateDashboardStats([], 0);
      expect(stats.studentsCheckedIn.count).toBe(0);
      expect(stats.studentsCheckedIn.percentage).toBe(0);
      expect(stats.positiveEmotions.percentage).toBe(0);
      expect(stats.tiredLowEnergy.percentage).toBe(0);
      expect(stats.needsSupport.percentage).toBe(0);
    });

    it('should calculate correct percentages for known data', () => {
      const checkins: EmotionCheckin[] = [
        {
          id: '1',
          student_id: 's1',
          emotion: 'happy',
          note: null,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          student_id: 's2',
          emotion: 'happy',
          note: null,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          student_id: 's3',
          emotion: 'sleepy',
          note: null,
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          student_id: 's4',
          emotion: 'stressed',
          note: null,
          created_at: new Date().toISOString(),
        },
      ];

      const stats = calculateDashboardStats(checkins, 10);

      expect(stats.studentsCheckedIn.count).toBe(4);
      expect(stats.studentsCheckedIn.total).toBe(10);
      expect(stats.studentsCheckedIn.percentage).toBe(40);

      // 2 out of 4 are positive (happy)
      expect(stats.positiveEmotions.count).toBe(2);
      expect(stats.positiveEmotions.percentage).toBe(50);

      // 1 out of 4 is tired (sleepy)
      expect(stats.tiredLowEnergy.count).toBe(1);
      expect(stats.tiredLowEnergy.percentage).toBe(25);

      // 1 out of 4 needs support (stressed)
      expect(stats.needsSupport.count).toBe(1);
      expect(stats.needsSupport.percentage).toBe(25);
    });

    it('should calculate emotion distribution correctly', () => {
      const checkins: EmotionCheckin[] = [
        {
          id: '1',
          student_id: 's1',
          emotion: 'happy',
          note: null,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          student_id: 's2',
          emotion: 'happy',
          note: null,
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          student_id: 's3',
          emotion: 'sleepy',
          note: null,
          created_at: new Date().toISOString(),
        },
      ];

      const distribution = calculateEmotionDistribution(checkins);

      expect(distribution).toHaveLength(2);
      expect(distribution[0].emotion).toBe('happy');
      expect(distribution[0].count).toBe(2);
      expect(distribution[0].percentage).toBe(67); // 2/3 = 66.67 rounded to 67
      expect(distribution[1].emotion).toBe('sleepy');
      expect(distribution[1].count).toBe(1);
      expect(distribution[1].percentage).toBe(33);
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: emoclass-ui-upgrade, Property 1: Stats Card Percentages Sum Constraint
     * Validates: Requirements 2.3, 2.4, 2.5
     */
    it('property: sum of emotion percentages should be approximately 100%', () => {
      fc.assert(
        fc.property(checkinsArrayGenerator, fc.integer({ min: 1, max: 100 }), (checkins, total) => {
          if (checkins.length === 0) return true; // Skip empty case

          const stats = calculateDashboardStats(checkins, total);

          const sum =
            stats.positiveEmotions.percentage +
            stats.tiredLowEnergy.percentage +
            stats.needsSupport.percentage;

          // Sum should be within rounding tolerance of 100%
          return Math.abs(sum - 100) <= 2; // Allow 2% tolerance for rounding
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: emoclass-ui-upgrade, Property 2: Students Checked In Consistency
     * Validates: Requirements 2.2
     */
    it('property: checked-in count should match checkins length and be <= total', () => {
      fc.assert(
        fc.property(checkinsArrayGenerator, fc.integer({ min: 1, max: 100 }), (checkins, total) => {
          const actualTotal = Math.max(total, checkins.length); // Ensure total >= checkins
          const stats = calculateDashboardStats(checkins, actualTotal);

          // Count should match checkins length
          const countMatches = stats.studentsCheckedIn.count === checkins.length;

          // Count should be <= total
          const countValid = stats.studentsCheckedIn.count <= stats.studentsCheckedIn.total;

          // Percentage should be correct (within rounding tolerance)
          const expectedPercentage =
            actualTotal > 0 ? (checkins.length / actualTotal) * 100 : 0;
          const percentageCorrect =
            Math.abs(stats.studentsCheckedIn.percentage - expectedPercentage) < 1;

          return countMatches && countValid && percentageCorrect;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: emoclass-ui-upgrade, Property 3: Emotion Distribution Completeness
     * Validates: Requirements 3.2
     */
    it('property: sum of emotion distribution counts should equal total checkins', () => {
      fc.assert(
        fc.property(checkinsArrayGenerator, (checkins) => {
          const distribution = calculateEmotionDistribution(checkins);

          const totalCount = distribution.reduce((sum, item) => sum + item.count, 0);

          return totalCount === checkins.length;
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: emoclass-ui-upgrade, Property 8: Color Semantic Consistency
     * Validates: Requirements 8.2
     */
    it('property: emotion colors should map to consistent semantic categories', () => {
      fc.assert(
        fc.property(emotionGenerator, (emotion) => {
          const color = getEmotionColor(emotion);
          const semantic = getSemanticColor(color);

          // Verify semantic consistency
          if (emotion === 'happy' || emotion === 'neutral') {
            return semantic === 'positive';
          } else if (emotion === 'sleepy' || emotion === 'normal') {
            return semantic === 'warning';
          } else if (emotion === 'stressed') {
            return semantic === 'negative';
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('property: emotion distribution percentages should sum to approximately 100%', () => {
      fc.assert(
        fc.property(checkinsArrayGenerator, (checkins) => {
          if (checkins.length === 0) return true;

          const distribution = calculateEmotionDistribution(checkins);

          const percentageSum = distribution.reduce((sum, item) => sum + item.percentage, 0);

          // Should be within rounding tolerance of 100%
          return Math.abs(percentageSum - 100) <= distribution.length; // Allow 1% per emotion for rounding
        }),
        { numRuns: 100 }
      );
    });

    it('property: all emotion counts should be non-negative', () => {
      fc.assert(
        fc.property(checkinsArrayGenerator, fc.integer({ min: 0, max: 100 }), (checkins, total) => {
          const stats = calculateDashboardStats(checkins, total);

          return (
            stats.studentsCheckedIn.count >= 0 &&
            stats.positiveEmotions.count >= 0 &&
            stats.tiredLowEnergy.count >= 0 &&
            stats.needsSupport.count >= 0
          );
        }),
        { numRuns: 100 }
      );
    });

    it('property: all percentages should be between 0 and 100', () => {
      fc.assert(
        fc.property(checkinsArrayGenerator, fc.integer({ min: 1, max: 100 }), (checkins, total) => {
          const stats = calculateDashboardStats(checkins, total);

          return (
            stats.studentsCheckedIn.percentage >= 0 &&
            stats.studentsCheckedIn.percentage <= 100 &&
            stats.positiveEmotions.percentage >= 0 &&
            stats.positiveEmotions.percentage <= 100 &&
            stats.tiredLowEnergy.percentage >= 0 &&
            stats.tiredLowEnergy.percentage <= 100 &&
            stats.needsSupport.percentage >= 0 &&
            stats.needsSupport.percentage <= 100
          );
        }),
        { numRuns: 100 }
      );
    });
  });
});
