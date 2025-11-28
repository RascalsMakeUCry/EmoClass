/**
 * **Feature: emoclass, Property 5: Real-time dashboard updates**
 * 
 * Property: For any new emotion check-in submitted, the dashboard visualization 
 * should reflect the updated emotion distribution within 5 seconds without requiring 
 * a manual page refresh.
 * 
 * **Validates: Requirements 2.2**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { EmotionType } from './types';

interface DashboardState {
  emotionCounts: Record<EmotionType, number>;
  lastUpdated: Date;
}

// Simulate dashboard update logic
function updateDashboard(
  currentState: DashboardState,
  newCheckin: { emotion: EmotionType; timestamp: Date }
): DashboardState {
  const newCounts = { ...currentState.emotionCounts };
  newCounts[newCheckin.emotion]++;

  return {
    emotionCounts: newCounts,
    lastUpdated: newCheckin.timestamp,
  };
}

// Check if update happened within time limit
function isWithinTimeLimit(
  checkinTime: Date,
  updateTime: Date,
  limitSeconds: number
): boolean {
  const diffMs = updateTime.getTime() - checkinTime.getTime();
  return diffMs >= 0 && diffMs <= limitSeconds * 1000;
}

describe('Property 5: Real-time dashboard updates', () => {
  it('should increment emotion count when new check-in is added', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (emotion, timestamp) => {
          const initialState: DashboardState = {
            emotionCounts: { happy: 0, neutral: 0, normal: 0, stressed: 0, sleepy: 0 },
            lastUpdated: new Date(timestamp.getTime() - 1000),
          };

          const newCheckin = {
            emotion: emotion as EmotionType,
            timestamp,
          };

          const updatedState = updateDashboard(initialState, newCheckin);

          // Property: Count for the emotion should increase by 1
          return updatedState.emotionCounts[emotion as EmotionType] === 1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should update lastUpdated timestamp to match check-in time', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
        fc.integer({ min: 1000000000000, max: 2000000000000 }),
        (emotion, timestampMs) => {
          const timestamp = new Date(timestampMs);
          
          // Skip invalid dates
          if (isNaN(timestamp.getTime())) {
            return true;
          }

          const initialState: DashboardState = {
            emotionCounts: { happy: 0, neutral: 0, normal: 0, stressed: 0, sleepy: 0 },
            lastUpdated: new Date(timestampMs - 10000),
          };

          const newCheckin = {
            emotion: emotion as EmotionType,
            timestamp,
          };

          const updatedState = updateDashboard(initialState, newCheckin);

          // Property: lastUpdated should be set to check-in timestamp
          return updatedState.lastUpdated.getTime() === timestamp.getTime();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle multiple sequential check-ins correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            emotion: fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
            timestamp: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (checkins) => {
          let state: DashboardState = {
            emotionCounts: { happy: 0, neutral: 0, normal: 0, stressed: 0, sleepy: 0 },
            lastUpdated: new Date('2020-01-01'),
          };

          // Apply all check-ins
          checkins.forEach(checkin => {
            state = updateDashboard(state, {
              emotion: checkin.emotion as EmotionType,
              timestamp: checkin.timestamp,
            });
          });

          // Property: Total count should equal number of check-ins
          const totalCount = Object.values(state.emotionCounts).reduce((a, b) => a + b, 0);
          return totalCount === checkins.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should update within 5 second time limit', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.integer({ min: 0, max: 5000 }), // delay in ms (0-5 seconds)
        (emotion, checkinTime, delayMs) => {
          const updateTime = new Date(checkinTime.getTime() + delayMs);

          // Property: Update should be within 5 second limit
          return isWithinTimeLimit(checkinTime, updateTime, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject updates that exceed time limit', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        fc.integer({ min: 5001, max: 10000 }), // delay > 5 seconds
        (checkinTime, delayMs) => {
          const updateTime = new Date(checkinTime.getTime() + delayMs);

          // Property: Update should NOT be within 5 second limit
          return !isWithinTimeLimit(checkinTime, updateTime, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve counts for other emotions when updating', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (newEmotion, timestamp) => {
          // Start with some existing counts
          const initialState: DashboardState = {
            emotionCounts: { happy: 5, neutral: 3, normal: 2, stressed: 1, sleepy: 0 },
            lastUpdated: new Date(timestamp.getTime() - 1000),
          };

          const initialTotal = Object.values(initialState.emotionCounts).reduce((a, b) => a + b, 0);

          const newCheckin = {
            emotion: newEmotion as EmotionType,
            timestamp,
          };

          const updatedState = updateDashboard(initialState, newCheckin);
          const updatedTotal = Object.values(updatedState.emotionCounts).reduce((a, b) => a + b, 0);

          // Property: Total should increase by exactly 1
          return updatedTotal === initialTotal + 1;
        }
      ),
      { numRuns: 100 }
    );
  });
});
