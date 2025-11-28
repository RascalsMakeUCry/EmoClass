// Script untuk testing notification helper functions
// Run: npx tsx scripts/test-helper-functions.ts

import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local FIRST
const envPath = join(process.cwd(), '.env.local');
try {
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

// Import helper functions AFTER env is loaded
import {
  notifyBulkImport,
  notifyClassCreated,
  notifyStudentCheckin,
  notifyTelegramAlert,
  notifyAdminAction,
} from '../lib/notification-helper';

async function testHelperFunctions() {
  console.log('🧪 Testing Notification Helper Functions\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  let passCount = 0;
  let failCount = 0;

  // Test 1: notifyBulkImport
  console.log('1️⃣ Testing notifyBulkImport()...');
  try {
    const result = await notifyBulkImport('Kelas 7A', 25);
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

  // Test 2: notifyClassCreated
  console.log('2️⃣ Testing notifyClassCreated()...');
  try {
    const result = await notifyClassCreated('Kelas 8B', 'test-class-id-123');
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

  // Test 3: notifyStudentCheckin
  console.log('3️⃣ Testing notifyStudentCheckin()...');
  try {
    const result = await notifyStudentCheckin(
      'Ahmad Rizki',
      'Kelas 7A',
      'stressed',
      'Merasa tertekan karena ujian'
    );
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

  // Test 4: notifyTelegramAlert
  console.log('4️⃣ Testing notifyTelegramAlert()...');
  try {
    const result = await notifyTelegramAlert(
      'Siti Nurhaliza',
      'Kelas 7A',
      'Siswa meminta bantuan',
      { source: 'telegram', urgency: 'high' }
    );
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

  // Test 5: notifyAdminAction
  console.log('5️⃣ Testing notifyAdminAction()...');
  try {
    const result = await notifyAdminAction(
      'test_action',
      'Testing admin action notification',
      { test: true }
    );
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
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }
}

testHelperFunctions().catch(console.error);
