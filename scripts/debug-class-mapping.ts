/**
 * Debug class mapping issue
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

async function debug() {
  console.log('🔍 Debugging Class Mapping\n');
  console.log('='.repeat(60));

  // Get classes ordered by name (same as API)
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .order('name');

  console.log('\n📚 Classes (ordered by name):');
  classes?.forEach((cls, index) => {
    console.log(`   Index ${index} → class_id ${index + 1}: ${cls.name}`);
    console.log(`      UUID: ${cls.id}`);
  });

  // Get all devices
  const { data: devices } = await supabase
    .from('iot_devices')
    .select('*');

  console.log('\n📡 IoT Devices:');
  devices?.forEach(device => {
    console.log(`   Device: ${device.device_id}`);
    console.log(`   class_id: ${device.class_id}`);
    console.log(`   UUID: ${device.id}`);
  });

  // Test mapping
  console.log('\n🧪 Testing Mapping:');
  const testClassUuid = 'bb938c77-9a7a-4bb3-aebe-796dc5f7c63f'; // Kelas 7A
  const classIndex = classes?.findIndex(c => c.id === testClassUuid);
  const numericClassId = classIndex !== undefined && classIndex !== -1 ? classIndex + 1 : null;

  console.log(`   Input UUID: ${testClassUuid}`);
  console.log(`   Found at index: ${classIndex}`);
  console.log(`   Numeric class_id: ${numericClassId}`);

  if (numericClassId) {
    const matchingDevice = devices?.find(d => d.class_id === numericClassId);
    if (matchingDevice) {
      console.log(`   ✅ Device found: ${matchingDevice.device_id}`);
    } else {
      console.log(`   ❌ No device with class_id ${numericClassId}`);
      console.log(`   Available class_ids: ${devices?.map(d => d.class_id).join(', ')}`);
    }
  }

  // Show what should work
  console.log('\n💡 Expected Mapping:');
  console.log('   Kelas 7A (index 0) → class_id 1');
  console.log('   Kelas 8B (index 1) → class_id 2');
  console.log('   Kelas 9C (index 2) → class_id 3');

  console.log('\n🔧 Actual Device class_ids:');
  devices?.forEach(device => {
    const matchingClass = classes?.find((c, i) => (i + 1) === device.class_id);
    console.log(`   class_id ${device.class_id} → ${matchingClass?.name || 'NOT FOUND'}`);
  });
}

debug().catch(console.error);
