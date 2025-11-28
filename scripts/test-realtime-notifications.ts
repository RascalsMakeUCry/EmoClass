/**
 * Script untuk testing Realtime Notifications
 * 
 * Script ini akan:
 * 1. Create notifikasi baru via API
 * 2. Verifikasi notifikasi muncul di database
 * 3. Instruksi untuk test realtime di browser
 * 
 * Cara menjalankan:
 * npx tsx scripts/test-realtime-notifications.ts
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase credentials tidak ditemukan!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRealtimeNotifications() {
  console.log('🧪 TESTING REALTIME NOTIFICATIONS\n');
  console.log('='.repeat(60));

  // Step 1: Get a teacher user
  console.log('\n📋 Step 1: Mengambil data teacher untuk testing...');
  
  const { data: teachers, error: teachersError } = await supabase
    .from('users')
    .select('id, email, name')
    .eq('role', 'teacher')
    .eq('is_active', true)
    .limit(1);

  if (teachersError || !teachers || teachers.length === 0) {
    console.error('❌ Error: Tidak ada teacher yang aktif');
    console.error(teachersError);
    process.exit(1);
  }

  const teacher = teachers[0];
  console.log(`✅ Teacher dipilih: ${teacher.name || teacher.email}`);
  console.log(`   User ID: ${teacher.id}`);

  // Step 2: Create test notification
  console.log('\n📝 Step 2: Membuat notifikasi test...');
  
  const testNotification = {
    user_id: teacher.id,
    type: 'system',
    priority: 'normal',
    title: '🧪 Test Realtime Notification',
    message: `Test realtime update pada ${new Date().toLocaleString('id-ID')}. Notifikasi ini harus muncul otomatis tanpa refresh!`,
    metadata: {
      test: true,
      timestamp: new Date().toISOString(),
      source: 'test-realtime-notifications',
    },
  };

  const { data: notification, error: insertError } = await supabase
    .from('notifications')
    .insert(testNotification)
    .select()
    .single();

  if (insertError || !notification) {
    console.error('❌ Error membuat notifikasi:', insertError);
    process.exit(1);
  }

  console.log('✅ Notifikasi berhasil dibuat!');
  console.log(`   Notification ID: ${notification.id}`);

  // Step 3: Instructions for browser testing
  console.log('\n📊 HASIL & INSTRUKSI TESTING:');
  console.log('='.repeat(60));
  console.log('✅ Notifikasi test berhasil dibuat di database!');
  console.log('');
  console.log('🌐 TESTING REALTIME DI BROWSER:');
  console.log('─'.repeat(60));
  console.log('1. Buka browser dan login sebagai teacher:');
  console.log(`   Email: ${teacher.email}`);
  console.log('');
  console.log('2. Buka halaman notifikasi:');
  console.log('   http://localhost:3000/notifications');
  console.log('');
  console.log('3. Buka Browser Console (F12)');
  console.log('   - Cari log: "✅ Realtime notifications connected!"');
  console.log('   - Status indicator harus: 🟢 "Live Update Aktif"');
  console.log('');
  console.log('4. JANGAN REFRESH! Jalankan script ini lagi:');
  console.log('   npx tsx scripts/test-realtime-notifications.ts');
  console.log('');
  console.log('5. Perhatikan browser:');
  console.log('   ✅ Notifikasi baru muncul OTOMATIS (tanpa refresh)');
  console.log('   ✅ Toast notification muncul: "🔔 Notifikasi baru: ..."');
  console.log('   ✅ Unread count bertambah otomatis');
  console.log('   ✅ Console log: "✅ Realtime notification change: ..."');
  console.log('');
  console.log('─'.repeat(60));
  console.log('');
  console.log('⚠️ JIKA REALTIME TIDAK BEKERJA:');
  console.log('');
  console.log('1. Pastikan Realtime enabled di Supabase:');
  console.log('   - Dashboard > Database > Replication');
  console.log('   - Centang tabel "notifications"');
  console.log('   - Klik Save');
  console.log('');
  console.log('2. Restart dev server:');
  console.log('   - Stop: Ctrl+C');
  console.log('   - Start: npm run dev');
  console.log('');
  console.log('3. Hard refresh browser:');
  console.log('   - Windows: Ctrl+Shift+R');
  console.log('   - Mac: Cmd+Shift+R');
  console.log('');
  console.log('4. Lihat dokumentasi lengkap:');
  console.log('   docs/REALTIME_NOTIFICATIONS.md');
  console.log('');
  console.log('='.repeat(60));
  console.log('🏁 Testing selesai!\n');
}

// Jalankan testing
testRealtimeNotifications().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
