// Script untuk testing input emotion
// Run: npx tsx scripts/test-input-emotion.ts

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

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
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInputEmotion() {
  console.log('🧪 Testing Input Emotion\n');

  // Step 1: Get a student
  console.log('1️⃣ Getting student data...');
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id, name, classes(name)')
    .limit(1);

  if (studentError) {
    console.error('❌ Error fetching student:', studentError);
    return;
  }

  if (!students || students.length === 0) {
    console.error('❌ No students found in database');
    console.log('   Please add students first via admin panel');
    return;
  }

  const student = students[0];
  console.log(`✅ Student found: ${student.name}`);
  console.log(`   Class: ${(student.classes as any)?.name || 'Unknown'}`);
  console.log(`   ID: ${student.id}\n`);

  // Step 2: Check if already checked in today
  console.log('2️⃣ Checking today\'s check-in status...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: existingCheckin, error: checkError } = await supabase
    .from('emotion_checkins')
    .select('id, emotion, created_at')
    .eq('student_id', student.id)
    .gte('created_at', today.toISOString())
    .limit(1);

  if (checkError) {
    console.error('❌ Error checking existing check-in:', checkError);
    return;
  }

  if (existingCheckin && existingCheckin.length > 0) {
    console.log('⚠️  Student already checked in today:');
    console.log(`   Emotion: ${existingCheckin[0].emotion}`);
    console.log(`   Time: ${new Date(existingCheckin[0].created_at).toLocaleString('id-ID')}`);
    console.log('\n💡 Skipping insert test (already checked in)');
    console.log('   To test again, delete today\'s check-in first\n');
    return;
  }

  console.log('✅ No check-in today, proceeding with test\n');

  // Step 3: Test insert emotion check-in
  console.log('3️⃣ Testing emotion check-in insert...');
  const testEmotion = 'happy';
  const testNote = 'Testing from script';

  console.log(`   Student: ${student.name}`);
  console.log(`   Emotion: ${testEmotion}`);
  console.log(`   Note: ${testNote}`);

  const { data: insertData, error: insertError } = await supabase
    .from('emotion_checkins')
    .insert({
      student_id: student.id,
      emotion: testEmotion,
      note: testNote,
    })
    .select();

  if (insertError) {
    console.error('\n❌ Insert failed!');
    console.error('   Error:', insertError);
    console.error('   Code:', insertError.code);
    console.error('   Message:', insertError.message);
    console.error('   Details:', insertError.details);
    console.error('   Hint:', insertError.hint);
    return;
  }

  console.log('\n✅ Check-in successful!');
  console.log('   Data:', insertData);

  // Step 4: Verify insert
  console.log('\n4️⃣ Verifying insert...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('emotion_checkins')
    .select('*')
    .eq('student_id', student.id)
    .gte('created_at', today.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
    return;
  }

  if (!verifyData || verifyData.length === 0) {
    console.error('❌ Check-in not found after insert!');
    return;
  }

  console.log('✅ Verification successful:');
  console.log('   ID:', verifyData[0].id);
  console.log('   Student ID:', verifyData[0].student_id);
  console.log('   Emotion:', verifyData[0].emotion);
  console.log('   Note:', verifyData[0].note);
  console.log('   Created:', new Date(verifyData[0].created_at).toLocaleString('id-ID'));

  // Step 5: Clean up (optional)
  console.log('\n5️⃣ Cleaning up test data...');
  const { error: deleteError } = await supabase
    .from('emotion_checkins')
    .delete()
    .eq('id', verifyData[0].id);

  if (deleteError) {
    console.error('❌ Cleanup failed:', deleteError);
    console.log('   Please delete manually: ID =', verifyData[0].id);
    return;
  }

  console.log('✅ Test data cleaned up\n');

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 Test Summary:');
  console.log('✅ Student fetch: OK');
  console.log('✅ Check-in status check: OK');
  console.log('✅ Insert emotion check-in: OK');
  console.log('✅ Verification: OK');
  console.log('✅ Cleanup: OK');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('🎉 All tests passed!');
  console.log('\n💡 If you\'re still getting errors in the UI:');
  console.log('   1. Check browser console for detailed error');
  console.log('   2. Verify Supabase URL and keys in .env.local');
  console.log('   3. Check if RLS policies allow insert');
  console.log('   4. Try clearing browser cache and reload');
}

testInputEmotion().catch(console.error);
