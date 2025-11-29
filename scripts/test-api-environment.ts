/**
 * Test API endpoint untuk environment data
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadEnvFile() {
  const envPath = join(process.cwd(), '.env.local');
  const envFile = readFileSync(envPath, 'utf-8');
  const envVars: Record<string, string> = {};
  
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

const env = loadEnvFile();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testAPI() {
  console.log('🧪 Testing Environment API\n');
  console.log('='.repeat(60));

  // Get Kelas 7A UUID
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .order('name');

  if (!classes || classes.length === 0) {
    console.log('❌ No classes found');
    return;
  }

  const kelas7A = classes[0]; // First class (Kelas 7A)
  console.log(`\n📚 Testing with: ${kelas7A.name}`);
  console.log(`   UUID: ${kelas7A.id}`);

  // Step 1: Check if device exists
  console.log('\n📡 Step 1: Checking iot_devices...');
  const { data: devices } = await supabase
    .from('iot_devices')
    .select('*')
    .eq('class_id', 1); // Kelas 7A = class_id 1

  if (!devices || devices.length === 0) {
    console.log('❌ No device found for class_id 1');
    return;
  }

  console.log('✅ Device found:', devices[0]);

  // Step 2: Check if sensor data exists
  console.log('\n📊 Step 2: Checking iot_sensor_data...');
  const { data: sensorData } = await supabase
    .from('iot_sensor_data')
    .select('*')
    .eq('device_id', devices[0].id)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!sensorData || sensorData.length === 0) {
    console.log('❌ No sensor data found');
    return;
  }

  console.log('✅ Latest sensor data:', sensorData[0]);

  // Step 3: Simulate API logic
  console.log('\n🔧 Step 3: Simulating API logic...');
  
  // Get all classes ordered by name
  const { data: allClasses } = await supabase
    .from('classes')
    .select('id, name')
    .order('name');

  console.log('All classes:', allClasses?.map((c, i) => `${i + 1}. ${c.name} (${c.id})`));

  // Find index of Kelas 7A
  const classIndex = allClasses?.findIndex(c => c.id === kelas7A.id);
  console.log(`\nClass index: ${classIndex}`);
  console.log(`Numeric class_id: ${classIndex !== undefined ? classIndex + 1 : 'N/A'}`);

  // Check if this matches device class_id
  if (classIndex !== undefined && (classIndex + 1) === devices[0].class_id) {
    console.log('✅ Mapping correct! API should work.');
  } else {
    console.log('❌ Mapping mismatch! This is the problem.');
    console.log(`   Expected class_id: ${classIndex !== undefined ? classIndex + 1 : 'N/A'}`);
    console.log(`   Device class_id: ${devices[0].class_id}`);
  }

  // Step 4: Test actual API call simulation
  console.log('\n🌐 Step 4: What API would return...');
  console.log('URL: /api/environment/current?classId=' + kelas7A.id);
  console.log('\nExpected response:');
  console.log(JSON.stringify({
    success: true,
    data: sensorData[0],
    hasDevice: true,
    hasData: true,
  }, null, 2));
}

testAPI().catch(console.error);
