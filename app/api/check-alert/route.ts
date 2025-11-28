import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type AlertType = 'stressed' | 'sleepy' | 'normal';

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'Student ID required' },
        { status: 400 }
      );
    }

    // Get last 3 check-ins for this student
    const { data: recentCheckins, error: checkinsError } = await supabase
      .from('emotion_checkins')
      .select('emotion, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (checkinsError) {
      console.error('Error fetching check-ins:', checkinsError);
      return NextResponse.json(
        { success: false, message: 'Database error' },
        { status: 500 }
      );
    }

    // Check if we have 3 check-ins
    if (!recentCheckins || recentCheckins.length < 3) {
      return NextResponse.json({
        success: true,
        alert: false,
        message: `Only ${recentCheckins?.length || 0} check-ins found`,
      });
    }

    // Check for 3 consecutive identical emotions that need attention
    const allStressed = recentCheckins.every((c) => c.emotion === 'stressed');
    const allSleepy = recentCheckins.every((c) => c.emotion === 'sleepy');
    const allNormal = recentCheckins.every((c) => c.emotion === 'normal');

    let alertType: AlertType | null = null;
    
    if (allStressed) {
      alertType = 'stressed';
    } else if (allSleepy) {
      alertType = 'sleepy';
    } else if (allNormal) {
      alertType = 'normal';
    }

    if (!alertType) {
      return NextResponse.json({
        success: true,
        alert: false,
        message: 'Not consecutive identical patterns',
      });
    }
    // Get student and class details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('name, class_id, classes(name)')
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.error('Error fetching student:', studentError);
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      );
    }

    const studentName = student.name;
    const className = (student.classes as any)?.name || 'Unknown';

    // Send Telegram alert with specific alert type
    const telegramSent = await sendTelegramAlert(studentName, className, alertType);

    return NextResponse.json({
      success: true,
      alert: true,
      telegramSent,
      student: studentName,
      class: className,
      alertType,
      message: `🚨 Alert sent! 3 consecutive ${alertType} emotions detected.`,
    });
  } catch (error) {
    console.error('Error in check-alert:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendTelegramAlert(
  studentName: string,
  className: string,
  alertType: AlertType
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ Telegram credentials not configured in .env.local');
    return false;
  }

  let message = '';
  
  if (alertType === 'stressed') {
    message = `🚨 EMOCLASS ALERT - PERLU PERHATIAN KHUSUS

👤 Siswa: ${studentName}
📚 Kelas: ${className}
😔 Pola: Emosi sedih/tertekan selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
1. 🗣️ Lakukan konseling individual segera
2. 🏠 Hubungi orang tua/wali untuk koordinasi
3. 👥 Pertimbangkan sesi kelompok dukungan sebaya
4. 📋 Evaluasi faktor akademik atau sosial yang mungkin menjadi penyebab
5. 💚 Pantau perkembangan emosi harian minggu depan

📅 Tindakan: Jadwalkan pertemuan dalam 1-2 hari kerja
⏰ Prioritas: TINGGI`;
  } else if (alertType === 'sleepy') {
    message = `🚨 EMOCLASS ALERT - PERHATIAN KESEHATAN

👤 Siswa: ${studentName}
📚 Kelas: ${className}
😴 Pola: Mengantuk/kelelahan selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
1. 🛏️ Tanyakan pola tidur dan kesehatan siswa
2. 📱 Evaluasi penggunaan gadget sebelum tidur
3. 🏠 Konsultasi dengan orang tua tentang rutinitas malam
4. 🏥 Pertimbangkan rujukan ke tenaga kesehatan jika perlu
5. 💡 Edukasi pentingnya sleep hygiene dan istirahat cukup
6. 📚 Evaluasi beban tugas dan kegiatan ekstrakurikuler

📅 Tindakan: Konseling ringan dalam 2-3 hari
⏰ Prioritas: SEDANG`;
  } else if (alertType === 'normal') {
    message = `ℹ️ EMOCLASS MONITORING - PEMANTAUAN RUTIN

👤 Siswa: ${studentName}
📚 Kelas: ${className}
🙂 Pola: Energi normal/datar selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
1. 💬 Lakukan check-in informal untuk memahami kondisi siswa
2. 🎯 Evaluasi motivasi dan engagement di kelas
3. 🌟 Cari peluang untuk meningkatkan keterlibatan positif
4. 🤝 Pertimbangkan aktivitas yang bisa meningkatkan semangat
5. 📊 Pantau apakah ini pola konsisten atau fase sementara

📅 Tindakan: Observasi dan check-in informal minggu ini
⏰ Prioritas: RENDAH - Monitoring`;
  }

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
      const error = await response.text();
      console.error('❌ Telegram API error:', error);
      return false;
    }

    console.log('✅ Telegram alert sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to send Telegram alert:', error);
    return false;
  }
}
