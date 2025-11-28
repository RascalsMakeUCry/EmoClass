/**
 * **Feature: emoclass, Property 3: Note length validation**
 * 
 * Property: For any text note input, if the length exceeds 100 characters, 
 * the system should reject the submission with an error message; if the length 
 * is 100 or fewer characters, the system should accept it.
 * 
 * **Validates: Requirements 1.4**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateNoteLength } from './utils';

describe('Property 3: Note length validation', () => {
  it('should accept notes with 100 or fewer characters', () => {
    fc.assert(
      fc.property(
        // Generate strings with length 0-100
        fc.string({ maxLength: 100 }),
        (note) => {
          const isValid = validateNoteLength(note);
          
          // Property: All notes with length <= 100 should be valid
          return isValid === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject notes with more than 100 characters', () => {
    fc.assert(
      fc.property(
        // Generate strings with length 101-200
        fc.string({ minLength: 101, maxLength: 200 }),
        (note) => {
          const isValid = validateNoteLength(note);
          
          // Property: All notes with length > 100 should be invalid
          return isValid === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle boundary case: exactly 100 characters', () => {
    fc.assert(
      fc.property(
        // Generate string of exactly 100 characters
        fc.string({ minLength: 100, maxLength: 100 }),
        (note) => {
          const isValid = validateNoteLength(note);
          
          // Property: Exactly 100 characters should be valid
          expect(note.length).toBe(100);
          return isValid === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle boundary case: exactly 101 characters', () => {
    fc.assert(
      fc.property(
        // Generate string of exactly 101 characters
        fc.string({ minLength: 101, maxLength: 101 }),
        (note) => {
          const isValid = validateNoteLength(note);
          
          // Property: Exactly 101 characters should be invalid
          expect(note.length).toBe(101);
          return isValid === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty strings', () => {
    fc.assert(
      fc.property(
        fc.constant(''),
        (note) => {
          const isValid = validateNoteLength(note);
          
          // Property: Empty string should be valid
          return isValid === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle strings with special characters and unicode', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 100 }),
        (note) => {
          const isValid = validateNoteLength(note);
          
          // Property: Strings <= 100 chars should be valid
          return note.length <= 100 ? isValid === true : isValid === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be consistent: same input always produces same result', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 200 }),
        (note) => {
          const result1 = validateNoteLength(note);
          const result2 = validateNoteLength(note);
          
          // Property: Function should be deterministic
          return result1 === result2;
        }
      ),
      { numRuns: 100 }
    );
  });
});
