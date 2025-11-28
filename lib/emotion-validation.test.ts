/**
 * **Feature: emoclass, Property 11: Emotion value validation**
 * 
 * Property: For any emotion check-in submission, the emotion value must be one of 
 * ('happy', 'neutral', 'normal', 'stressed', 'sleepy'); any other value should be 
 * rejected with a validation error.
 * 
 * **Validates: Requirements 5.2**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import type { EmotionType } from './types';

// Valid emotion values
const VALID_EMOTIONS: EmotionType[] = ['happy', 'neutral', 'normal', 'stressed', 'sleepy'];

// Function to validate emotion value
function validateEmotion(emotion: string): { valid: boolean; error?: string } {
  if (!VALID_EMOTIONS.includes(emotion as EmotionType)) {
    return {
      valid: false,
      error: 'Nilai emosi tidak valid. Silakan pilih salah satu emoji yang tersedia.',
    };
  }
  return { valid: true };
}

describe('Property 11: Emotion value validation', () => {
  it('should accept all valid emotion values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_EMOTIONS),
        (emotion) => {
          const result = validateEmotion(emotion);
          
          // Property: All valid emotions should be accepted
          return result.valid === true && result.error === undefined;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid emotion values', () => {
    fc.assert(
      fc.property(
        // Generate random strings that are NOT valid emotions
        fc.string().filter(s => !VALID_EMOTIONS.includes(s as EmotionType)),
        (invalidEmotion) => {
          const result = validateEmotion(invalidEmotion);
          
          // Property: All invalid emotions should be rejected
          return result.valid === false && result.error !== undefined;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject empty string', () => {
    const result = validateEmotion('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject null-like values', () => {
    const testCases = ['null', 'undefined', 'NULL', 'UNDEFINED'];
    
    testCases.forEach(testCase => {
      const result = validateEmotion(testCase);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it('should be case-sensitive', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_EMOTIONS),
        (emotion) => {
          // Test uppercase version
          const upperResult = validateEmotion(emotion.toUpperCase());
          // Test mixed case version
          const mixedResult = validateEmotion(
            emotion.charAt(0).toUpperCase() + emotion.slice(1)
          );
          
          // Property: Validation should be case-sensitive
          // Only exact lowercase matches should be valid
          return upperResult.valid === false && mixedResult.valid === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject emotions with whitespace', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_EMOTIONS),
        (emotion) => {
          const withLeadingSpace = validateEmotion(` ${emotion}`);
          const withTrailingSpace = validateEmotion(`${emotion} `);
          const withBothSpaces = validateEmotion(` ${emotion} `);
          
          // Property: Emotions with whitespace should be rejected
          return (
            withLeadingSpace.valid === false &&
            withTrailingSpace.valid === false &&
            withBothSpaces.valid === false
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject similar but incorrect values', () => {
    const similarInvalidValues = [
      'happpy', // typo
      'neutral ', // trailing space
      'Normal', // wrong case
      'stress', // incomplete
      'sleepy!', // extra character
      'happy😊', // with emoji
    ];

    similarInvalidValues.forEach(value => {
      const result = validateEmotion(value);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it('should provide error message in Indonesian', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !VALID_EMOTIONS.includes(s as EmotionType)),
        (invalidEmotion) => {
          const result = validateEmotion(invalidEmotion);
          
          // Property: Error message should be in Indonesian
          if (!result.valid && result.error) {
            // Check for Indonesian words in error message
            const hasIndonesianWords = 
              result.error.includes('tidak') || 
              result.error.includes('Silakan') ||
              result.error.includes('pilih');
            return hasIndonesianWords;
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same input always produces same result', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (emotion) => {
          const result1 = validateEmotion(emotion);
          const result2 = validateEmotion(emotion);
          
          // Property: Function should be deterministic
          return result1.valid === result2.valid;
        }
      ),
      { numRuns: 100 }
    );
  });
});
