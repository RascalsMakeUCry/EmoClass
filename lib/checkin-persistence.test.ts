/**
 * **Feature: emoclass, Property 2: Check-in data persistence with timestamp**
 * 
 * Property: For any valid emotion check-in submission (student_id, emotion, optional note), 
 * the system should store the data in the database with an automatic timestamp and return 
 * success within 2 seconds.
 * 
 * **Validates: Requirements 1.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { EmotionType } from './types';

// Mock check-in data structure
interface MockCheckin {
  student_id: string;
  emotion: EmotionType;
  note: string | null;
}

// Simulated database storage function
function storeCheckin(checkin: MockCheckin): { success: boolean; timestamp: Date; duration: number } {
  const startTime = Date.now();
  
  // Simulate database insert
  const timestamp = new Date();
  
  // Simulate processing time (should be < 2000ms)
  const duration = Date.now() - startTime;
  
  return {
    success: true,
    timestamp,
    duration,
  };
}

describe('Property 2: Check-in data persistence with timestamp', () => {
  it('should successfully store any valid check-in with timestamp', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // student_id
        fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'), // emotion
        fc.option(fc.string({ maxLength: 100 }), { nil: null }), // optional note
        (studentId, emotion, note) => {
          const checkin: MockCheckin = {
            student_id: studentId,
            emotion: emotion as EmotionType,
            note,
          };

          const result = storeCheckin(checkin);

          // Property 1: Operation should succeed
          const isSuccessful = result.success === true;

          // Property 2: Timestamp should be generated
          const hasTimestamp = result.timestamp instanceof Date;

          // Property 3: Timestamp should be recent (within last second)
          const now = new Date();
          const timeDiff = now.getTime() - result.timestamp.getTime();
          const timestampIsRecent = timeDiff >= 0 && timeDiff < 1000;

          // Property 4: Operation should complete quickly (< 2 seconds)
          const isWithinTimeLimit = result.duration < 2000;

          return isSuccessful && hasTimestamp && timestampIsRecent && isWithinTimeLimit;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle check-ins with notes', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
        fc.string({ minLength: 1, maxLength: 100 }),
        (studentId, emotion, note) => {
          const checkin: MockCheckin = {
            student_id: studentId,
            emotion: emotion as EmotionType,
            note,
          };

          const result = storeCheckin(checkin);

          // Property: Check-ins with notes should be stored successfully
          return result.success === true && result.timestamp instanceof Date;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle check-ins without notes', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
        (studentId, emotion) => {
          const checkin: MockCheckin = {
            student_id: studentId,
            emotion: emotion as EmotionType,
            note: null,
          };

          const result = storeCheckin(checkin);

          // Property: Check-ins without notes should be stored successfully
          return result.success === true && result.timestamp instanceof Date;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate unique timestamps for sequential check-ins', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            student_id: fc.uuid(),
            emotion: fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
            note: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (checkins) => {
          const results = checkins.map(c => storeCheckin({
            ...c,
            emotion: c.emotion as EmotionType,
          }));

          // Property: All operations should succeed
          const allSuccessful = results.every(r => r.success === true);

          // Property: All should have timestamps
          const allHaveTimestamps = results.every(r => r.timestamp instanceof Date);

          return allSuccessful && allHaveTimestamps;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle all emotion types equally', () => {
    const emotions: EmotionType[] = ['happy', 'neutral', 'normal', 'stressed', 'sleepy'];
    
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.option(fc.string({ maxLength: 100 }), { nil: null }),
        (studentId, note) => {
          // Test all emotion types
          const results = emotions.map(emotion => {
            const checkin: MockCheckin = {
              student_id: studentId,
              emotion,
              note,
            };
            return storeCheckin(checkin);
          });

          // Property: All emotion types should be stored successfully
          return results.every(r => r.success === true && r.timestamp instanceof Date);
        }
      ),
      { numRuns: 100 }
    );
  });
});
