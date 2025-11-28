/**
 * **Feature: emoclass, Property 6: Negative emotion filtering**
 * 
 * Property: For any set of emotion check-ins for a given day, the "students needing 
 * attention" section should display only and all students whose most recent check-in 
 * has emotion value of 'stressed' or 'sleepy'.
 * 
 * **Validates: Requirements 2.4**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { EmotionType } from './types';

interface MockCheckin {
  student_id: string;
  emotion: EmotionType;
  created_at: Date;
}

// Function to filter students needing attention
function filterStudentsNeedingAttention(checkins: MockCheckin[]): string[] {
  // Group by student_id and get most recent check-in for each
  const latestCheckins = new Map<string, MockCheckin>();
  
  checkins.forEach(checkin => {
    const existing = latestCheckins.get(checkin.student_id);
    if (!existing || checkin.created_at > existing.created_at) {
      latestCheckins.set(checkin.student_id, checkin);
    }
  });

  // Filter students with negative emotions (stressed or sleepy)
  const needingAttention: string[] = [];
  latestCheckins.forEach((checkin, studentId) => {
    if (checkin.emotion === 'stressed' || checkin.emotion === 'sleepy') {
      needingAttention.push(studentId);
    }
  });

  return needingAttention;
}

describe('Property 6: Negative emotion filtering', () => {
  it('should include all students with stressed emotion in latest check-in', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            student_id: fc.uuid(),
            emotion: fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
            created_at: fc.date(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (checkins) => {
          const typedCheckins = checkins.map(c => ({
            ...c,
            emotion: c.emotion as EmotionType,
          }));

          const needingAttention = filterStudentsNeedingAttention(typedCheckins);

          // Get latest check-in per student
          const latestByStudent = new Map<string, MockCheckin>();
          typedCheckins.forEach(c => {
            const existing = latestByStudent.get(c.student_id);
            if (!existing || c.created_at > existing.created_at) {
              latestByStudent.set(c.student_id, c);
            }
          });

          // Property: All students with stressed in latest check-in should be in attention list
          let allStressedIncluded = true;
          latestByStudent.forEach((checkin, studentId) => {
            if (checkin.emotion === 'stressed') {
              if (!needingAttention.includes(studentId)) {
                allStressedIncluded = false;
              }
            }
          });

          return allStressedIncluded;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include all students with sleepy emotion in latest check-in', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            student_id: fc.uuid(),
            emotion: fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
            created_at: fc.date(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (checkins) => {
          const typedCheckins = checkins.map(c => ({
            ...c,
            emotion: c.emotion as EmotionType,
          }));

          const needingAttention = filterStudentsNeedingAttention(typedCheckins);

          // Get latest check-in per student
          const latestByStudent = new Map<string, MockCheckin>();
          typedCheckins.forEach(c => {
            const existing = latestByStudent.get(c.student_id);
            if (!existing || c.created_at > existing.created_at) {
              latestByStudent.set(c.student_id, c);
            }
          });

          // Property: All students with sleepy in latest check-in should be in attention list
          let allSleepyIncluded = true;
          latestByStudent.forEach((checkin, studentId) => {
            if (checkin.emotion === 'sleepy') {
              if (!needingAttention.includes(studentId)) {
                allSleepyIncluded = false;
              }
            }
          });

          return allSleepyIncluded;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should NOT include students with positive emotions in latest check-in', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            student_id: fc.uuid(),
            emotion: fc.constantFrom('happy', 'neutral', 'normal', 'stressed', 'sleepy'),
            created_at: fc.date(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (checkins) => {
          const typedCheckins = checkins.map(c => ({
            ...c,
            emotion: c.emotion as EmotionType,
          }));

          const needingAttention = filterStudentsNeedingAttention(typedCheckins);

          // Get latest check-in per student
          const latestByStudent = new Map<string, MockCheckin>();
          typedCheckins.forEach(c => {
            const existing = latestByStudent.get(c.student_id);
            if (!existing || c.created_at > existing.created_at) {
              latestByStudent.set(c.student_id, c);
            }
          });

          // Property: No students with positive emotions should be in attention list
          let noPositiveIncluded = true;
          latestByStudent.forEach((checkin, studentId) => {
            if (checkin.emotion === 'happy' || checkin.emotion === 'neutral' || checkin.emotion === 'normal') {
              if (needingAttention.includes(studentId)) {
                noPositiveIncluded = false;
              }
            }
          });

          return noPositiveIncluded;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should only consider most recent check-in per student', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1000000000000, max: 2000000000000 }), // Valid timestamp range
        (studentId, baseTimestamp) => {
          // Create multiple check-ins for same student
          const olderDate = new Date(baseTimestamp - 3600000); // 1 hour earlier
          const newerDate = new Date(baseTimestamp + 3600000); // 1 hour later

          // Skip if dates are invalid
          if (isNaN(olderDate.getTime()) || isNaN(newerDate.getTime())) {
            return true;
          }

          const checkins: MockCheckin[] = [
            { student_id: studentId, emotion: 'stressed', created_at: olderDate },
            { student_id: studentId, emotion: 'happy', created_at: newerDate },
          ];

          const needingAttention = filterStudentsNeedingAttention(checkins);

          // Property: Should NOT be in attention list because latest is happy
          return !needingAttention.includes(studentId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return empty array when no negative emotions exist', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            student_id: fc.uuid(),
            emotion: fc.constantFrom('happy', 'neutral', 'normal'),
            created_at: fc.date(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (checkins) => {
          const typedCheckins = checkins.map(c => ({
            ...c,
            emotion: c.emotion as EmotionType,
          }));

          const needingAttention = filterStudentsNeedingAttention(typedCheckins);

          // Property: Should return empty array
          return needingAttention.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle multiple students correctly', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }),
        fc.date(),
        (studentIds, baseDate) => {
          // Create check-ins: half stressed, half happy
          const checkins: MockCheckin[] = studentIds.map((id, index) => ({
            student_id: id,
            emotion: (index % 2 === 0 ? 'stressed' : 'happy') as EmotionType,
            created_at: baseDate,
          }));

          const needingAttention = filterStudentsNeedingAttention(checkins);

          // Property: Should have exactly half the students (those with stressed)
          const expectedCount = Math.ceil(studentIds.length / 2);
          return needingAttention.length === expectedCount;
        }
      ),
      { numRuns: 100 }
    );
  });
});
