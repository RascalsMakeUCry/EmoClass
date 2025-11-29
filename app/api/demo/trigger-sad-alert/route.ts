import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Step 1: Pilih siswa pertama untuk demo
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, class_id, classes(name)')
      .limit(1)
      .single();

    if (studentsError || !students) {
      return NextResponse.json(
        { success: false, error: 'Tidak bisa mengambil data siswa' },
        { status: 500 }
      );
    }

    const student = students as any;

    // Step 2: Hapus check-in lama untuk siswa ini
    await supabase
      .from('emotion_checkins')
      .delete()
      .eq('student_id', student.id);

    // Step 3: Insert 3 check-in dengan emosi "stressed"
    const now = new Date();
    const checkins = [];

    for (let i = 2; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const { data, error } = await supabase
        .from('emotion_checkins')
        .insert({
          student_id: student.id,
          emotion: 'stressed',
          note: `Demo alert - Hari ke-${3 - i}`,
          created_at: date.toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        checkins.push(data);
      }
    }

    if (checkins.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Gagal membuat 3 check-in' },
        { status: 500 }
      );
    }

    // Step 4: Trigger Alert API
    const alertResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/check-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: student.id,
      }),
    });

    const alertResult = await alertResponse.json();

    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        class: student.classes.name,
      },
      checkinsCreated: checkins.length,
      alertResult: {
        alert: alertResult.alert,
        telegramSent: alertResult.telegramSent,
        notificationCreated: alertResult.notificationCreated,
        alertType: alertResult.alertType,
        message: alertResult.message,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
