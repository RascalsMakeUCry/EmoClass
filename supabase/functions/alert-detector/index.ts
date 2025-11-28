// Supabase Edge Function: Alert Detector
// Detects students with 3+ consecutive emotional patterns and sends Telegram alert
// Patterns: Sad/Stressed, Drowsy/Sleepy, Normal energy

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

interface EmotionCheckin {
  id: string;
  student_id: string;
  emotion: string;
  created_at: string;
}

interface Student {
  id: string;
  name: string;
  class_id: string;
}

interface Class {
  id: string;
  name: string;
}

type AlertType = 'stressed' | 'sleepy' | 'normal';

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get the webhook payload
    const payload = await req.json();
    console.log('Webhook payload:', payload);

    // Extract the new check-in data
    const newCheckin = payload.record as EmotionCheckin;
    const studentId = newCheckin.student_id;
    const emotion = newCheckin.emotion;

    console.log(`New check-in: Student ${studentId}, Emotion: ${emotion}`);

    // Only process emotions that need tracking (stressed, sleepy, normal)
    if (emotion !== 'stressed' && emotion !== 'sleepy' && emotion !== 'normal') {
      console.log('Emotion does not require pattern tracking, skipping alert check');
      return new Response(JSON.stringify({ message: 'Emotion does not require tracking' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get last 3 check-ins for this student
    const { data: recentCheckins, error: checkinsError } = await supabase
      .from('emotion_checkins')
      .select('emotion, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (checkinsError) {
      console.error('Error fetching check-ins:', checkinsError);
      throw checkinsError;
    }

    console.log(`Recent check-ins for student ${studentId}:`, recentCheckins);

    // Check for 3 consecutive identical emotions that need attention
    if (recentCheckins && recentCheckins.length === 3) {
      // Check for 3 consecutive stressed emotions
      const allStressed = recentCheckins.every((c) => c.emotion === 'stressed');
      
      // Check for 3 consecutive sleepy emotions
      const allSleepy = recentCheckins.every((c) => c.emotion === 'sleepy');
      
      // Check for 3 consecutive normal emotions
      const allNormal = recentCheckins.every((c) => c.emotion === 'normal');

      let alertType: AlertType | null = null;
      
      if (allStressed) {
        alertType = 'stressed';
        console.log('🚨 ALERT: 3 consecutive stressed emotions detected!');
      } else if (allSleepy) {
        alertType = 'sleepy';
        console.log('🚨 ALERT: 3 consecutive sleepy emotions detected!');
      } else if (allNormal) {
        alertType = 'normal';
        console.log('🚨 ALERT: 3 consecutive normal energy emotions detected!');
      }

      if (alertType) {
        // Get student details
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('name, class_id')
          .eq('id', studentId)
          .single();

        if (studentError) {
          console.error('Error fetching student:', studentError);
          throw studentError;
        }

        // Get class details
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('name')
          .eq('id', (student as Student).class_id)
          .single();

        if (classError) {
          console.error('Error fetching class:', classError);
          throw classError;
        }

        // Send Telegram alert with specific type
        await sendTelegramAlert(
          (student as Student).name,
          (classData as Class).name,
          alertType
        );

        return new Response(
          JSON.stringify({
            message: 'Alert sent',
            student: (student as Student).name,
            class: (classData as Class).name,
            alertType,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        console.log('3 check-ins found but not consecutive identical patterns, no alert needed');
      }
    } else {
      console.log(`Only ${recentCheckins?.length || 0} check-ins found, need 3 for alert`);
    }

    return new Response(JSON.stringify({ message: 'No alert needed' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in alert detector:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

async function sendTelegramAlert(
  studentName: string,
  className: string,
  alertType: AlertType
) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram credentials not configured');
    throw new Error('Telegram credentials missing');
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

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(telegramUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Telegram API error:', error);
    throw new Error(`Failed to send Telegram message: ${error}`);
  }

  console.log('✅ Telegram alert sent successfully');
  return response.json();
}
