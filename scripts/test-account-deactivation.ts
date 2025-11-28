/**
 * Test Script: Account Deactivation Notification
 * 
 * Script ini untuk testing fitur notifikasi real-time ketika admin
 * menonaktifkan atau menghapus akun guru yang sedang login.
 * 
 * Usage:
 *   npx tsx scripts/test-account-deactivation.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function listTeachers() {
  console.log('\n📋 Daftar Guru:');
  console.log('─'.repeat(80));
  
  const { data: teachers, error } = await supabase
    .from('users')
    .select('id, email, full_name, is_active')
    .eq('role', 'teacher')
    .order('full_name');

  if (error) {
    console.error('❌ Error:', error.message);
    return [];
  }

  if (!teachers || teachers.length === 0) {
    console.log('Tidak ada guru ditemukan.');
    return [];
  }

  teachers.forEach((teacher, index) => {
    const status = teacher.is_active ? '✅ Aktif' : '❌ Nonaktif';
    console.log(`${index + 1}. ${teacher.full_name} (${teacher.email}) - ${status}`);
    console.log(`   ID: ${teacher.id}`);
  });

  console.log('─'.repeat(80));
  return teachers;
}

async function deactivateTeacher(teacherId: string) {
  console.log('\n🔄 Menonaktifkan akun...');
  
  const { error } = await supabase
    .from('users')
    .update({ is_active: false })
    .eq('id', teacherId);

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✅ Akun berhasil dinonaktifkan!');
  console.log('💡 Jika guru sedang login, mereka akan melihat modal notifikasi.');
  return true;
}

async function reactivateTeacher(teacherId: string) {
  console.log('\n🔄 Mengaktifkan kembali akun...');
  
  const { error } = await supabase
    .from('users')
    .update({ is_active: true })
    .eq('id', teacherId);

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✅ Akun berhasil diaktifkan kembali!');
  return true;
}

async function deleteTeacher(teacherId: string) {
  console.log('\n⚠️  WARNING: Ini akan menghapus akun secara permanen!');
  const confirm = await question('Ketik "DELETE" untuk konfirmasi: ');
  
  if (confirm !== 'DELETE') {
    console.log('❌ Dibatalkan.');
    return false;
  }

  console.log('\n🔄 Menghapus akun...');
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', teacherId);

  if (error) {
    console.error('❌ Error:', error.message);
    return false;
  }

  console.log('✅ Akun berhasil dihapus!');
  console.log('💡 Jika guru sedang login, mereka akan melihat modal notifikasi.');
  return true;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║         Test Script: Account Deactivation Notification                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log('📝 Instruksi Testing:');
  console.log('1. Buka browser dan login sebagai guru');
  console.log('2. Jalankan script ini untuk menonaktifkan akun guru tersebut');
  console.log('3. Perhatikan modal notifikasi muncul di browser guru');
  console.log('4. Modal akan menampilkan countdown 5 detik sebelum redirect');
  console.log();

  while (true) {
    const teachers = await listTeachers();
    
    if (teachers.length === 0) {
      console.log('\n❌ Tidak ada guru untuk di-test.');
      break;
    }

    console.log('\n📌 Pilih Aksi:');
    console.log('1. Nonaktifkan akun guru');
    console.log('2. Aktifkan kembali akun guru');
    console.log('3. Hapus akun guru (PERMANENT)');
    console.log('4. Refresh daftar');
    console.log('5. Keluar');
    console.log();

    const action = await question('Pilih aksi (1-5): ');

    if (action === '5') {
      console.log('\n👋 Selesai!');
      break;
    }

    if (action === '4') {
      continue;
    }

    if (action === '1' || action === '2' || action === '3') {
      const teacherIndex = await question('\nPilih nomor guru: ');
      const index = parseInt(teacherIndex) - 1;

      if (index < 0 || index >= teachers.length) {
        console.log('❌ Nomor tidak valid!');
        continue;
      }

      const teacher = teachers[index];
      console.log(`\n👤 Guru dipilih: ${teacher.full_name} (${teacher.email})`);

      if (action === '1') {
        if (!teacher.is_active) {
          console.log('⚠️  Akun sudah nonaktif!');
          continue;
        }
        await deactivateTeacher(teacher.id);
      } else if (action === '2') {
        if (teacher.is_active) {
          console.log('⚠️  Akun sudah aktif!');
          continue;
        }
        await reactivateTeacher(teacher.id);
      } else if (action === '3') {
        await deleteTeacher(teacher.id);
      }

      console.log('\n⏳ Tunggu beberapa detik untuk melihat efek di browser...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('❌ Pilihan tidak valid!');
    }
  }

  rl.close();
}

main().catch(console.error);
