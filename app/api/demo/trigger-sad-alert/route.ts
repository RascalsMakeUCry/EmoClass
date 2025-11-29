import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper functions copied from check-alert
async function createNotificationForTeachers(
  studentName: string,
  className: string
): Promise<boolean> {
  try {
    const { data: teachers, error: teachersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')
      .eq('is_active', true);

    if (teachersError || !teachers || teachers.length === 0) {
      return false;
    }

    const notifications = teachers.map((teacher) => ({
      user_id: teacher.id,
      type: 'alert',
      priority: 'urgent',
      title: '🚨 Alert: Siswa Perlu Perhatian Khusus',
      message: `Siswa ${studentName} dari kelas ${className} menunjukkan emosi sedih/tertekan selama 3 hari berturut-turut. Tindakan segera diperlukan.`,
      metadata: {
        student_name: studentName,
        class_name: className,
        alert_type: 'stressed',
        pattern: '3_consecutive_stressed',
        source: 'demo_alert',
      },
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function sendTelegramAlert(
  studentName: string,
  className: string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  const message = `🚨 EMOCLASS ALERT - PERLU PERHATIAN KHUSUS

👤 Siswa: ${studentName}
📚 Kelas: ${className}
😔 Pola: Emosi sedih/tertekan selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT:
1. 🗣️ Lakukan konseling individual segera
2. 🏠 Hubungi orang tua/wali untuk koordinasi
3. 👥 Pertimbangkan sesi kelompok dukungan sebaya
4. 📋 Evaluasi faktor akademik atau sosial
5. 💚 Pantau perkembangan emosi harian

📅 Tindakan: Jadwalkan pertemuan dalam 1-2 hari kerja
⏰ Prioritas: TINGGI`;

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export async function POST() {
  try {
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, class_id')
      .limit(1)
      .single();

    if (studentsError) {
      return NextResponse.json(
        { success: false, error: `Database error: ${studentsError.message}` },
        { status: 500 }
      );
    }

    if (!students) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada siswa di database. Tambahkan siswa terlebih dahulu.' },
        { status: 404 }
      );
    }

    const student = students as any;
    
    let className = 'Unknown';
    if (student.class_id) {
      const { data: classData } = await supabase
        .from('classes')
        .select('name')
        .eq('id', student.class_id)
        .single();
      
      if (classData) {
        className = classData.name;
      }
    }

    await supabase
      .from('emotion_checkins')
      .delete()
      .eq('student_id', student.id);

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
        { success: false, error: `Gagal membuat 3 check-in (hanya ${checkins.length} berhasil)` },
        { status: 500 }
      );
    }

    const telegramSent = await sendTelegramAlert(student.name, className);
    const notificationCreated = await createNotificationForTeachers(student.name, className);

    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        class: className,
      },
      checkinsCreated: checkins.length,
      alertResult: {
        alert: true,
        telegramSent,
        notificationCreated,
        alertType: 'consecutive_sad',
        message: '🚨 Alert sent! 3 consecutive stressed emotions detected.',
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
