import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';

type AlertType = 'stressed';

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

    // Check for 3 consecutive stressed emotions
    const allStressed = recentCheckins.every((c) => c.emotion === 'stressed');

    if (!allStressed) {
      return NextResponse.json({
        success: true,
        alert: false,
        message: 'Not 3 consecutive stressed emotions',
      });
    }

    const alertType: AlertType = 'stressed';
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

    // Create notification in database for all teachers
    const notificationCreated = await createNotificationForTeachers(
      studentName,
      className,
      alertType
    );

    return NextResponse.json({
      success: true,
      alert: true,
      telegramSent,
      notificationCreated,
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

async function createNotificationForTeachers(
  studentName: string,
  className: string,
  alertType: AlertType
): Promise<boolean> {
  try {
    // Get all active teachers
    const { data: teachers, error: teachersError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')
      .eq('is_active', true);

    if (teachersError || !teachers || teachers.length === 0) {
      console.error('❌ Error fetching teachers:', teachersError);
      return false;
    }

    // Create notification for each teacher
    const notifications = teachers.map((teacher) => ({
      user_id: teacher.id,
      type: 'alert',
      priority: 'urgent',
      title: '🚨 Alert: Siswa Perlu Perhatian Khusus',
      message: `Siswa ${studentName} dari kelas ${className} menunjukkan emosi sedih/tertekan selama 3 hari berturut-turut. Tindakan segera diperlukan.`,
      metadata: {
        student_name: studentName,
        class_name: className,
        alert_type: alertType,
        pattern: '3_consecutive_stressed',
        source: 'telegram_alert',
      },
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) {
      console.error('❌ Error creating notifications:', insertError);
      return false;
    }

    console.log(`✅ Notifications created for ${teachers.length} teacher(s)`);
    return true;
  } catch (error) {
    console.error('❌ Failed to create notifications:', error);
    return false;
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

  const message = `🚨 EMOCLASS ALERT - PERLU PERHATIAN KHUSUS

👤 Siswa: ${studentName}
📚 Kelas: ${className}
😔 Pola: Emosi sedih/tertekan selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT:
1. 🗣️ Lakukan konseling individual segera
2. 🏠 Hubungi orang tua/wali untuk koordinasi
3. 👥 Pertimbangkan sesi kelompok dukungan sebaya
4. 📋 Evaluasi faktor akademik atau sosial yang mungkin menjadi penyebab
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
