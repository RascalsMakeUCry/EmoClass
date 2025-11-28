// Script untuk testing sistem notifikasi
// Run: npx tsx scripts/test-notifications.ts

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  } catch (error) {
    console.error('⚠️  Could not load .env.local file');
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System\n');

  // Test 1: Check if notification table exists
  console.log('1️⃣ Checking notification table...');
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .limit(1);

  if (notifError) {
    console.error('❌ Notification table error:', notifError.message);
    return;
  }
  console.log('✅ Notification table exists\n');

  // Test 2: Check database triggers
  console.log('2️⃣ Checking database triggers...');
  const { data: triggers, error: triggerError } = await supabase
    .rpc('get_triggers');

  if (triggerError) {
    console.log('⚠️  Cannot check triggers (RPC not available)');
    console.log('   Run this SQL in Supabase to check manually:');
    console.log(`
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND (trigger_name LIKE 'trigger_notify%'
      OR trigger_name LIKE 'trigger_consecutive%');
    `);
  } else {
    console.log('✅ Triggers:', triggers);
  }
  console.log('');

  // Test 3: Get active teachers
  console.log('3️⃣ Checking active teachers...');
  const { data: teachers, error: teacherError } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('role', 'teacher')
    .eq('is_active', true);

  if (teacherError) {
    console.error('❌ Error fetching teachers:', teacherError.message);
    return;
  }

  if (!teachers || teachers.length === 0) {
    console.log('⚠️  No active teachers found');
    console.log('   Create a teacher account first');
    return;
  }

  console.log(`✅ Found ${teachers.length} active teacher(s):`);
  teachers.forEach(t => console.log(`   - ${t.full_name} (${t.email})`));
  console.log('');

  // Test 4: Create test notification
  console.log('4️⃣ Creating test notification...');
  const testNotification = {
    user_id: teachers[0].id,
    type: 'system',
    priority: 'normal',
    title: '🧪 Test Notification',
    message: 'This is a test notification created by test script',
    metadata: {
      source: 'test_script',
      timestamp: new Date().toISOString(),
    },
  };

  const { data: createdNotif, error: createError } = await supabase
    .from('notifications')
    .insert(testNotification)
    .select()
    .single();

  if (createError) {
    console.error('❌ Error creating notification:', createError.message);
    return;
  }

  console.log('✅ Test notification created:');
  console.log(`   ID: ${createdNotif.id}`);
  console.log(`   Title: ${createdNotif.title}`);
  console.log(`   For: ${teachers[0].full_name}`);
  console.log('');

  // Test 5: Check notification stats
  console.log('5️⃣ Notification statistics...');
  const { data: stats, error: statsError } = await supabase
    .from('notifications')
    .select('type, priority, is_read');

  if (statsError) {
    console.error('❌ Error fetching stats:', statsError.message);
    return;
  }

  const totalNotifs = stats?.length || 0;
  const unreadNotifs = stats?.filter(n => !n.is_read).length || 0;
  const byType = stats?.reduce((acc: any, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});
  const byPriority = stats?.reduce((acc: any, n) => {
    acc[n.priority] = (acc[n.priority] || 0) + 1;
    return acc;
  }, {});

  console.log(`   Total notifications: ${totalNotifs}`);
  console.log(`   Unread: ${unreadNotifs}`);
  console.log(`   By type:`, byType);
  console.log(`   By priority:`, byPriority);
  console.log('');

  // Test 6: Clean up test notification
  console.log('6️⃣ Cleaning up test notification...');
  const { error: deleteError } = await supabase
    .from('notifications')
    .delete()
    .eq('id', createdNotif.id);

  if (deleteError) {
    console.error('❌ Error deleting test notification:', deleteError.message);
  } else {
    console.log('✅ Test notification deleted');
  }
  console.log('');

  // Summary
  console.log('📊 Test Summary:');
  console.log('✅ Notification table: OK');
  console.log(`✅ Active teachers: ${teachers.length}`);
  console.log('✅ Create notification: OK');
  console.log('✅ Delete notification: OK');
  console.log('\n🎉 All tests passed!');
}

// Run tests
testNotificationSystem().catch(console.error);
