// Simple test untuk notification helper functions
// Run: npx tsx scripts/test-helper-simple.ts

import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim();
    process.env[key.trim()] = value;
  }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to create notification
async function createNotification(params: {
  target: 'all_teachers' | 'all_users' | 'specific_user';
  userId?: string;
  type: 'alert' | 'system' | 'summary';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  title: string;
  message: string;
  metadata?: any;
}) {
  const { target, userId, type, priority, title, message, metadata } = params;

  // Get target users
  let targetUsers: { id: string }[] = [];

  if (target === 'all_teachers') {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')
      .eq('is_active', true);
    targetUsers = data || [];
  } else if (target === 'all_users') {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('is_active', true);
    targetUsers = data || [];
  } else if (target === 'specific_user' && userId) {
    targetUsers = [{ id: userId }];
  }

  if (targetUsers.length === 0) {
    return { success: false, error: 'No target users found' };
  }

  // Create notifications
  const notifications = targetUsers.map(u => ({
    user_id: u.id,
    type,
    priority,
    title,
    message,
    metadata: {
      ...metadata,
      source: 'test_script',
      created_at: new Date().toISOString(),
    },
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    count: targetUsers.length,
    message: `Notification sent to ${targetUsers.length} user(s)`,
  };
}

async function testHelperFunctions() {
  console.log('🧪 Testing Notification Helper Functions\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  let passCount = 0;
  let failCount = 0;

  // Test 1: Bulk Import Notification
  console.log('1️⃣ Testing Bulk Import Notification...');
  try {
    const result = await createNotification({
      target: 'all_teachers',
      type: 'system',
      priority: 'low',
      title: '👥 Data Siswa Baru Ditambahkan',
      message: '25 siswa baru berhasil ditambahkan ke Kelas 7A melalui import Excel.',
      metadata: {
        action: 'bulk_import',
        class_name: 'Kelas 7A',
        student_count: 25,
      },
    });
    
    if (result.success) {
      console.log(`✅ Success! Sent to ${result.count} teacher(s)`);
      passCount++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failCount++;
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    failCount++;
  }
  console.log('');

  // Test 2: Class Created Notification
  console.log('2️⃣ Testing Class Created Notification...');
  try {
    const result = await createNotification({
      target: 'all_teachers',
      type: 'system',
      priority: 'low',
      title: '🏫 Kelas Baru Dibuat',
      message: 'Kelas 8B berhasil dibuat. Anda sekarang dapat menambahkan siswa ke kelas ini.',
      metadata: {
        action: 'class_created',
        class_name: 'Kelas 8B',
      },
    });
    
    if (result.success) {
      console.log(`✅ Success! Sent to ${result.count} teacher(s)`);
      passCount++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failCount++;
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    failCount++;
  }
  console.log('');

  // Test 3: Student Check-in Notification (Stressed)
  console.log('3️⃣ Testing Student Check-in Notification (Stressed)...');
  try {
    const result = await createNotification({
      target: 'all_teachers',
      type: 'system',
      priority: 'high',
      title: '😰 Check-in Baru',
      message: 'Ahmad Rizki dari Kelas 7A baru saja check-in dengan emosi: stressed. Catatan: Merasa tertekan karena ujian',
      metadata: {
        action: 'student_checkin',
        student_name: 'Ahmad Rizki',
        class_name: 'Kelas 7A',
        emotion: 'stressed',
        notes: 'Merasa tertekan karena ujian',
      },
    });
    
    if (result.success) {
      console.log(`✅ Success! Sent to ${result.count} teacher(s)`);
      passCount++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failCount++;
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    failCount++;
  }
  console.log('');

  // Test 4: Telegram Alert Notification
  console.log('4️⃣ Testing Telegram Alert Notification...');
  try {
    const result = await createNotification({
      target: 'all_teachers',
      type: 'alert',
      priority: 'urgent',
      title: '🚨 Alert dari Telegram Bot',
      message: 'Siti Nurhaliza dari Kelas 7A: Siswa meminta bantuan',
      metadata: {
        source: 'telegram_bot',
        student_name: 'Siti Nurhaliza',
        class_name: 'Kelas 7A',
        alert_type: 'Siswa meminta bantuan',
      },
    });
    
    if (result.success) {
      console.log(`✅ Success! Sent to ${result.count} teacher(s)`);
      passCount++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failCount++;
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    failCount++;
  }
  console.log('');

  // Test 5: Admin Action Notification
  console.log('5️⃣ Testing Admin Action Notification...');
  try {
    const result = await createNotification({
      target: 'all_teachers',
      type: 'system',
      priority: 'normal',
      title: '⚙️ Admin Action',
      message: 'Testing admin action notification',
      metadata: {
        action: 'test_action',
        test: true,
      },
    });
    
    if (result.success) {
      console.log(`✅ Success! Sent to ${result.count} teacher(s)`);
      passCount++;
    } else {
      console.log(`❌ Failed: ${result.error}`);
      failCount++;
    }
  } catch (error: any) {
    console.log(`❌ Error: ${error.message}`);
    failCount++;
  }
  console.log('');

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 Test Summary:');
  console.log(`   Total: ${passCount + failCount}`);
  console.log(`   ✅ Passed: ${passCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failCount === 0) {
    console.log('🎉 All helper functions working correctly!');
    console.log('\n💡 Check your notifications page to see the test notifications:');
    console.log('   http://localhost:3000/notifications');
    console.log('\n📝 You should see 5 new notifications with different types and priorities.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }
}

testHelperFunctions().catch(console.error);
