import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { EmotionType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, emotion, note } = body;

    // Validation
    if (!studentId || typeof studentId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'ID siswa tidak valid' },
        { status: 400 }
      );
    }

    if (!emotion || typeof emotion !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Emosi harus dipilih' },
        { status: 400 }
      );
    }

    // Validate emotion is one of the allowed values
    const validEmotions: EmotionType[] = ['happy', 'neutral', 'normal', 'stressed', 'sleepy'];
    if (!validEmotions.includes(emotion as EmotionType)) {
      return NextResponse.json(
        { success: false, message: 'Nilai emosi tidak valid. Silakan pilih salah satu emoji yang tersedia.' },
        { status: 400 }
      );
    }

    // Validate note length if provided
    if (note && typeof note === 'string' && note.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Catatan tidak boleh lebih dari 100 karakter' },
        { status: 400 }
      );
    }

    // Check if student has already checked in today
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingCheckin, error: checkError } = await supabase
      .from('emotion_checkins')
      .select('id')
      .eq('student_id', studentId)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .limit(1);

    if (checkError) {
      console.error('Error checking existing checkin:', checkError);
    }

    if (existingCheckin && existingCheckin.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Kamu sudah check-in hari ini. Silakan coba lagi besok.' },
        { status: 400 }
      );
    }

    // Insert check-in into database
    const { data, error } = await supabase
      .from('emotion_checkins')
      .insert({
        student_id: studentId,
        emotion: emotion as EmotionType,
        note: note && typeof note === 'string' ? note.trim() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: handleSupabaseError(error) },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in berhasil disimpan',
      data,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
