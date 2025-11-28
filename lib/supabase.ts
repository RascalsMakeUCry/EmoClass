// Supabase client initialization and utilities

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials tidak ditemukan. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diset di .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Handle Supabase errors and return user-friendly Indonesian messages
 */
export function handleSupabaseError(error: any): string {
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Supabase error:', error);
  }

  // Handle empty error object
  if (!error || (typeof error === 'object' && Object.keys(error).length === 0)) {
    return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.';
  }

  if (error.message?.includes('Failed to fetch')) {
    return 'Koneksi internet bermasalah. Silakan coba lagi.';
  }

  if (error.message?.includes('violates foreign key constraint')) {
    return 'Data tidak valid. Silakan pilih kelas dan siswa yang benar.';
  }

  if (error.message?.includes('violates check constraint')) {
    return 'Nilai emosi tidak valid. Silakan pilih salah satu emoji yang tersedia.';
  }

  if (error.code === 'PGRST116') {
    return 'Data tidak ditemukan.';
  }

  if (error.code === '23505') {
    return 'Data sudah ada.';
  }

  return 'Terjadi kesalahan. Silakan coba lagi.';
}
