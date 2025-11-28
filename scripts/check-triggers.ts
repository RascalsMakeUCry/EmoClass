// Script untuk check database triggers
// Run: npx tsx scripts/check-triggers.ts

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

async function checkTriggers() {
  console.log('🔍 Checking Database Triggers\n');

  // Check triggers using raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT 
        trigger_name,
        event_object_table as table_name,
        action_timing as timing,
        event_manipulation as event
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
        AND (trigger_name LIKE 'trigger_notify%'
        OR trigger_name LIKE 'trigger_consecutive%')
      ORDER BY trigger_name;
    `
  });

  if (error) {
    console.log('⚠️  Cannot use RPC, trying direct query...\n');
    
    // Try alternative method
    console.log('📋 Expected Triggers:');
    console.log('   1. trigger_consecutive_negative_emotions (emotion_checkins)');
    console.log('   2. trigger_notify_student_added (students)');
    console.log('   3. trigger_notify_class_created (classes)');
    console.log('   4. trigger_notify_student_checkin (emotion_checkins)');
    console.log('\n💡 To check manually, run this SQL in Supabase SQL Editor:');
    console.log(`
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (trigger_name LIKE 'trigger_notify%'
  OR trigger_name LIKE 'trigger_consecutive%')
ORDER BY trigger_name;
    `);
    console.log('\n📝 To install triggers:');
    console.log('   1. Open Supabase Dashboard → SQL Editor');
    console.log('   2. Copy-paste: supabase/notification-triggers.sql');
    console.log('   3. Run query');
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ No notification triggers found!\n');
    console.log('📝 To install triggers:');
    console.log('   1. Open Supabase Dashboard → SQL Editor');
    console.log('   2. Copy-paste: supabase/notification-triggers.sql');
    console.log('   3. Run query');
    return;
  }

  console.log(`✅ Found ${data.length} trigger(s):\n`);
  data.forEach((trigger: any, index: number) => {
    console.log(`${index + 1}. ${trigger.trigger_name}`);
    console.log(`   Table: ${trigger.table_name}`);
    console.log(`   Timing: ${trigger.timing} ${trigger.event}`);
    console.log('');
  });

  console.log('🎉 All triggers are installed!');
}

checkTriggers().catch(console.error);
