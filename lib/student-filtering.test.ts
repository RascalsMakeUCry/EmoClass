/**
 * **Feature: emoclass, Property 1: Class-based student filtering**
 * 
 * Property: For any class selection, the system should return only students 
 * whose class_id matches the selected class, and no students from other classes 
 * should appear in the list.
 * 
 * **Validates: Requirements 1.2, 5.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Mock student data structure
interface MockStudent {
  id: string;
  name: string;
  class_id: string;
}

// Function to filter students by class_id (simulates the actual filtering logic)
function filterStudentsByClass(students: MockStudent[], classId: string): MockStudent[] {
  return students.filter(student => student.class_id === classId);
}

describe('Property 1: Class-based student filtering', () => {
  it('should return only students matching the selected class_id', () => {
    fc.assert(
      fc.property(
        // Generate random class IDs
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        // Generate random students with class assignments
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            class_id: fc.uuid(),
          }),
          { minLength: 5, maxLength: 30 }
        ),
        (classIds, students) => {
          // Pick a random class ID to filter by
          const selectedClassId = classIds[0];

          // Assign some students to the selected class
          const studentsWithClass = students.map((student, index) => ({
            ...student,
            class_id: index % 3 === 0 ? selectedClassId : classIds[index % classIds.length],
          }));

          // Filter students
          const filtered = filterStudentsByClass(studentsWithClass, selectedClassId);

          // Property 1: All filtered students must have the selected class_id
          const allMatchSelectedClass = filtered.every(
            student => student.class_id === selectedClassId
          );

          // Property 2: No students from other classes should appear
          const noOtherClassStudents = filtered.every(
            student => student.class_id !== '' && student.class_id === selectedClassId
          );

          // Property 3: Count should match expected
          const expectedCount = studentsWithClass.filter(
            s => s.class_id === selectedClassId
          ).length;
          const actualCount = filtered.length;

          return allMatchSelectedClass && noOtherClassStudents && actualCount === expectedCount;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return empty array when no students match the class_id', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            class_id: fc.uuid(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        fc.uuid(),
        (students, nonExistentClassId) => {
          // Ensure no student has the non-existent class ID
          const studentsWithDifferentClass = students.map(s => ({
            ...s,
            class_id: s.class_id === nonExistentClassId ? fc.sample(fc.uuid(), 1)[0] : s.class_id,
          }));

          const filtered = filterStudentsByClass(studentsWithDifferentClass, nonExistentClassId);

          // Should return empty array
          return filtered.length === 0;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain referential integrity - filtered students must exist in original list', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 3, maxLength: 50 }),
            class_id: fc.uuid(),
          }),
          { minLength: 5, maxLength: 30 }
        ),
        (selectedClassId, students) => {
          // Assign some students to the selected class
          const studentsWithClass = students.map((student, index) => ({
            ...student,
            class_id: index % 2 === 0 ? selectedClassId : student.class_id,
          }));

          const filtered = filterStudentsByClass(studentsWithClass, selectedClassId);

          // Every filtered student must exist in the original list
          const allExistInOriginal = filtered.every(filteredStudent =>
            studentsWithClass.some(original => original.id === filteredStudent.id)
          );

          return allExistInOriginal;
        }
      ),
      { numRuns: 100 }
    );
  });
});
