import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'test-id',
              student_id: 'student-123',
              emotion: 'happy',
              note: 'Test note',
              created_at: new Date().toISOString(),
            },
            error: null,
          })),
        })),
      })),
    })),
  },
  handleSupabaseError: vi.fn((error) => 'Terjadi kesalahan database'),
}));

describe('POST /api/checkin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully insert valid check-in', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkin', {
      method: 'POST',
      body: JSON.stringify({
        studentId: 'student-123',
        emotion: 'happy',
        note: 'Feeling great today!',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('berhasil');
  });

  it('should reject check-in without studentId', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkin', {
      method: 'POST',
      body: JSON.stringify({
        emotion: 'happy',
        note: 'Test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('ID siswa');
  });

  it('should reject check-in without emotion', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkin', {
      method: 'POST',
      body: JSON.stringify({
        studentId: 'student-123',
        note: 'Test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Emosi');
  });

  it('should reject invalid emotion value', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkin', {
      method: 'POST',
      body: JSON.stringify({
        studentId: 'student-123',
        emotion: 'invalid_emotion',
        note: 'Test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('tidak valid');
  });

  it('should reject note longer than 100 characters', async () => {
    const longNote = 'A'.repeat(101);
    const request = new NextRequest('http://localhost:3000/api/checkin', {
      method: 'POST',
      body: JSON.stringify({
        studentId: 'student-123',
        emotion: 'happy',
        note: longNote,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('100 karakter');
  });

  it('should accept check-in without note', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkin', {
      method: 'POST',
      body: JSON.stringify({
        studentId: 'student-123',
        emotion: 'happy',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should accept all valid emotion types', async () => {
    const validEmotions = ['happy', 'neutral', 'normal', 'stressed', 'sleepy'];

    for (const emotion of validEmotions) {
      const request = new NextRequest('http://localhost:3000/api/checkin', {
        method: 'POST',
        body: JSON.stringify({
          studentId: 'student-123',
          emotion,
          note: 'Test',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    }
  });

  it('should return error messages in Indonesian', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkin', {
      method: 'POST',
      body: JSON.stringify({
        studentId: 'student-123',
        emotion: 'invalid',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.message).toMatch(/tidak|Silakan|pilih/);
  });

  it('should trim whitespace from notes', async () => {
    const request = new NextRequest('http://localhost:3000/api/checkin', {
      method: 'POST',
      body: JSON.stringify({
        studentId: 'student-123',
        emotion: 'happy',
        note: '  Test note with spaces  ',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
