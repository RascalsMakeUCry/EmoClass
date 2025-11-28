/**
 * Script untuk testing Telegram Alert - 3 Hari Berturut-turut Emosi Sedih
 * 
 * Script ini akan:
 * 1. Insert 3 check-in dengan emosi "stressed" (Sedih) untuk siswa tertentu
 * 2. Trigger alert API untuk mengirim notifikasi Telegram
 * 3. Menampilkan hasil testing
 * 
 * Cara menjalankan:
 * npx tsx scripts/test-sad-alert.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
try {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch (error) {
  console.error('⚠️ Warning: Could not load .env.local file');
}

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase credentials tidak ditemukan!');
  console.error('Pastikan .env.local sudah diisi dengan benar.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Student {
  id: string;
  name: string;
  class_id: string;
  classes: {
    name: string;
  };
}

async function testSadAlert() {
  console.log('🧪 TESTING TELEGRAM ALERT - 3 HARI SEDIH BERTURUT-TURUT\n');
  console.log('='.repeat(60));

  // Step 1: Pilih siswa untuk testing
  console.log('\n📋 Step 1: Mengambil data siswa untuk testing...');
  
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, name, class_id, classes(name)')
    .limit(1)
    .single();

  if (studentsError || !students) {
    console.error('❌ Error: Tidak bisa mengambil data siswa');
    console.error(studentsError);
    process.exit(1);
  }

  const student = students as unknown as Student;
  console.log(`✅ Siswa dipilih: ${student.name} (${student.classes.name})`);
  console.log(`   Student ID: ${student.id}`);

  // Step 2: Hapus check-in lama untuk siswa ini (clean slate)
  console.log('\n🧹 Step 2: Membersihkan data check-in lama...');
  
  const { error: deleteError } = await supabase
    .from('emotion_checkins')
    .delete()
    .eq('student_id', student.id);

  if (deleteError) {
    console.error('❌ Error menghapus data lama:', deleteError);
  } else {
    console.log('✅ Data lama berhasil dihapus');
  }

  // Step 3: Insert 3 check-in dengan emosi "stressed" (Sedih/Tertekan)
  console.log('\n📝 Step 3: Memasukkan 3 check-in "Sedih/Tertekan" berturut-turut...');
  
  const now = new Date();
  const checkins = [];

  for (let i = 2; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i); // Hari ke-3, ke-2, ke-1
    
    const { data, error } = await supabase
      .from('emotion_checkins')
      .insert({
        student_id: student.id,
        emotion: 'stressed',
        note: `Testing alert - Hari ke-${3 - i}`,
        created_at: date.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error insert check-in hari ke-${3 - i}:`, error);
    } else {
      checkins.push(data);
      console.log(`✅ Check-in ${3 - i}/3 berhasil (${date.toLocaleDateString('id-ID')})`);
    }
  }

  if (checkins.length !== 3) {
    console.error('\n❌ Error: Tidak berhasil insert 3 check-in!');
    process.exit(1);
  }

  // Step 4: Verifikasi data di database
  console.log('\n🔍 Step 4: Verifikasi data di database...');
  
  const { data: recentCheckins, error: verifyError } = await supabase
    .from('emotion_checkins')
    .select('emotion, created_at, note')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })
    .limit(3);

  if (verifyError || !recentCheckins) {
    console.error('❌ Error verifikasi:', verifyError);
  } else {
    console.log('✅ Data berhasil diverifikasi:');
    recentCheckins.forEach((checkin, idx) => {
      const date = new Date(checkin.created_at);
      console.log(`   ${idx + 1}. ${checkin.emotion} - ${date.toLocaleDateString('id-ID')} - ${checkin.note}`);
    });
  }

  // Step 5: Trigger Alert API
  console.log('\n🚨 Step 5: Trigger Alert API...');
  console.log('   Mengirim request ke /api/check-alert...');
  
  try {
    const response = await fetch('http://localhost:3000/api/check-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: student.id,
      }),
    });

    const result = await response.json();

    console.log('\n📊 HASIL TESTING:');
    console.log('='.repeat(60));
    console.log(`Status: ${response.ok ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Alert Triggered: ${result.alert ? '✅ YA' : '❌ TIDAK'}`);
    console.log(`Telegram Sent: ${result.telegramSent ? '✅ YA' : '❌ TIDAK'}`);
    console.log(`Notification Created: ${result.notificationCreated ? '✅ YA' : '❌ TIDAK'}`);
    console.log(`Alert Type: ${result.alertType || 'N/A'}`);
    console.log(`Message: ${result.message}`);
    
    if (result.alert && result.telegramSent && result.notificationCreated) {
      console.log('\n🎉 TESTING BERHASIL SEMPURNA!');
      console.log('✅ Alert terdeteksi');
      console.log('✅ Telegram notification terkirim');
      console.log('✅ Notifikasi dibuat di database');
      console.log('\n📱 Cek Telegram Anda untuk melihat pesan alert.');
      console.log('� Cek Lhalaman /notifications untuk melihat notifikasi di UI.');
      console.log('\nPesan yang seharusnya diterima:');
      console.log('─'.repeat(60));
      console.log('� KEMOCLASS ALERT - PERLU PERHATIAN KHUSUS');
      console.log('');
      console.log(`👤 Siswa: ${student.name}`);
      console.log(`📚 Kelas: ${student.classes.name}`);
      console.log('😔 Pola: Emosi sedih/tertekan selama 3 hari berturut-turut');
      console.log('');
      console.log('⚠️ REKOMENDASI TINDAK LANJUT:');
      console.log('1. �️ Laakukan konseling individual segera');
      console.log('2. 🏠 Hubungi orang tua/wali untuk koordinasi');
      console.log('3. 👥 Pertimbangkan sesi kelompok dukungan sebaya');
      console.log('4. � Eavaluasi faktor akademik atau sosial');
      console.log('5. 💚 Pantau perkembangan emosi harian');
      console.log('');
      console.log('📅 Tindakan: Jadwalkan pertemuan dalam 1-2 hari kerja');
      console.log('⏰ Prioritas: TINGGI');
      console.log('─'.repeat(60));
    } else if (result.alert && result.telegramSent && !result.notificationCreated) {
      console.log('\n⚠️ TESTING SEBAGIAN BERHASIL');
      console.log('✅ Alert terdeteksi');
      console.log('✅ Telegram notification terkirim');
      console.log('❌ Notifikasi TIDAK dibuat di database');
      console.log('\n� Kemungkoinan penyebab:');
      console.log('   - Tidak ada teacher yang aktif di database');
      console.log('   - Error saat insert ke tabel notifications');
      console.log('   - RLS policy menghalangi insert');
      console.log('\n📖 Cek console log server untuk detail error');
    } else if (result.alert && !result.telegramSent) {
      console.log('\n⚠️ TESTING SEBAGIAN BERHASIL');
      console.log('✅ Alert terdeteksi');
      console.log(`${result.notificationCreated ? '✅' : '❌'} Notifikasi ${result.notificationCreated ? 'dibuat' : 'TIDAK dibuat'} di database`);
      console.log('❌ Telegram notification TIDAK terkirim');
      console.log('\n💡 Kemungkinan penyebab:');
      console.log('   - TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diset di .env.local');
      console.log('   - Bot token atau chat ID tidak valid');
      console.log('   - Koneksi internet bermasalah');
      console.log('\n📖 Lihat docs/TELEGRAM_SETUP.md untuk setup Telegram bot');
    } else {
      console.log('\n❌ TESTING GAGAL');
      console.log('Alert tidak terdeteksi meskipun sudah ada 3 check-in berturut-turut');
      console.log('\nResponse lengkap:');
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    console.error('\n❌ ERROR saat memanggil API:');
    console.error(error);
    console.log('\n💡 Pastikan development server sudah running:');
    console.log('   npm run dev');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Testing selesai!\n');
}

// Jalankan testing
testSadAlert().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
