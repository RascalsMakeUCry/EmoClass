/**
 * Interactive Script untuk Testing Telegram Alert
 * 
 * Script ini memungkinkan Anda memilih:
 * - Siswa mana yang mau di-test
 * - Jenis emosi (Sedih, Mengantuk, atau Normal)
 * 
 * Cara menjalankan:
 * npx tsx scripts/test-alert-interactive.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Supabase credentials tidak ditemukan!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

interface Student {
  id: string;
  name: string;
  class_id: string;
  classes: {
    name: string;
  };
}

type EmotionType = 'happy' | 'normal' | 'stressed';

const emotionMap: Record<string, { type: EmotionType; label: string; emoji: string }> = {
  '1': { type: 'happy', label: 'Senang/Bahagia', emoji: '😊' },
  '2': { type: 'normal', label: 'Biasa Saja/Normal', emoji: '😐' },
  '3': { type: 'stressed', label: 'Sedih/Tertekan', emoji: '😔' },
};

async function testAlertInteractive() {
  console.log('🧪 INTERACTIVE TESTING - TELEGRAM ALERT\n');
  console.log('='.repeat(60));

  // Step 1: Ambil semua siswa
  console.log('\n📋 Mengambil daftar siswa...');
  
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, name, class_id, classes(name)')
    .order('name')
    .limit(10);

  if (studentsError || !students || students.length === 0) {
    console.error('❌ Error: Tidak bisa mengambil data siswa');
    rl.close();
    process.exit(1);
  }

  // Step 2: Tampilkan pilihan siswa
  console.log('\n👥 Pilih siswa untuk testing:\n');
  students.forEach((student: any, idx) => {
    const s = student as unknown as Student;
    console.log(`${idx + 1}. ${s.name} (${s.classes.name})`);
  });

  const studentChoice = await question('\nPilih nomor siswa (1-' + students.length + '): ');
  const studentIndex = parseInt(studentChoice) - 1;

  if (studentIndex < 0 || studentIndex >= students.length) {
    console.error('❌ Pilihan tidak valid!');
    rl.close();
    process.exit(1);
  }

  const selectedStudent = students[studentIndex] as unknown as Student;
  console.log(`\n✅ Siswa dipilih: ${selectedStudent.name} (${selectedStudent.classes.name})`);

  // Step 3: Pilih jenis emosi
  console.log('\n😊 Pilih jenis emosi untuk testing:\n');
  console.log('1. 😊 Senang/Bahagia (Tidak trigger alert)');
  console.log('2. 😐 Biasa Saja/Normal (Monitoring)');
  console.log('3. 😔 Sedih/Tertekan (Priority: TINGGI - Trigger alert)');

  const emotionChoice = await question('\nPilih nomor emosi (1-3): ');
  
  if (!emotionMap[emotionChoice]) {
    console.error('❌ Pilihan tidak valid!');
    rl.close();
    process.exit(1);
  }

  const selectedEmotion = emotionMap[emotionChoice];
  console.log(`\n✅ Emosi dipilih: ${selectedEmotion.emoji} ${selectedEmotion.label}`);

  // Step 4: Konfirmasi
  console.log('\n' + '='.repeat(60));
  console.log('📝 RINGKASAN TESTING:');
  console.log(`   Siswa: ${selectedStudent.name}`);
  console.log(`   Kelas: ${selectedStudent.classes.name}`);
  console.log(`   Emosi: ${selectedEmotion.emoji} ${selectedEmotion.label}`);
  console.log('='.repeat(60));

  const confirm = await question('\nLanjutkan testing? (y/n): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('\n❌ Testing dibatalkan.');
    rl.close();
    process.exit(0);
  }

  rl.close();

  // Step 5: Hapus data lama
  console.log('\n🧹 Membersihkan data check-in lama...');
  
  const { error: deleteError } = await supabase
    .from('emotion_checkins')
    .delete()
    .eq('student_id', selectedStudent.id);

  if (deleteError) {
    console.error('❌ Error menghapus data lama:', deleteError);
  } else {
    console.log('✅ Data lama berhasil dihapus');
  }

  // Step 6: Insert 3 check-in
  console.log(`\n📝 Memasukkan 3 check-in "${selectedEmotion.label}" berturut-turut...`);
  
  const now = new Date();
  const checkins = [];

  for (let i = 2; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const { data, error } = await supabase
      .from('emotion_checkins')
      .insert({
        student_id: selectedStudent.id,
        emotion: selectedEmotion.type,
        note: `Testing ${selectedEmotion.label} - Hari ke-${3 - i}`,
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

  // Step 7: Trigger Alert API
  console.log('\n🚨 Trigger Alert API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/check-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: selectedStudent.id,
      }),
    });

    const result = await response.json();

    console.log('\n📊 HASIL TESTING:');
    console.log('='.repeat(60));
    console.log(`Status: ${response.ok ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Alert Triggered: ${result.alert ? '✅ YA' : '❌ TIDAK'}`);
    console.log(`Telegram Sent: ${result.telegramSent ? '✅ YA' : '❌ TIDAK'}`);
    console.log(`Alert Type: ${result.alertType || 'N/A'}`);
    console.log(`Message: ${result.message}`);
    
    if (result.alert && result.telegramSent) {
      console.log('\n🎉 TESTING BERHASIL!');
      console.log('✅ Alert terdeteksi dan Telegram notification terkirim!');
      console.log('\n📱 Cek Telegram Anda untuk melihat pesan alert.');
    } else if (result.alert && !result.telegramSent) {
      console.log('\n⚠️ TESTING SEBAGIAN BERHASIL');
      console.log('✅ Alert terdeteksi');
      console.log('❌ Telegram notification TIDAK terkirim');
      console.log('\n💡 Periksa konfigurasi TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID di .env.local');
    } else {
      console.log('\n❌ TESTING GAGAL');
      console.log('Alert tidak terdeteksi');
    }

  } catch (error) {
    console.error('\n❌ ERROR saat memanggil API:');
    console.error(error);
    console.log('\n💡 Pastikan development server sudah running: npm run dev');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Testing selesai!\n');
}

testAlertInteractive().catch((error) => {
  console.error('❌ Unexpected error:', error);
  rl.close();
  process.exit(1);
});
