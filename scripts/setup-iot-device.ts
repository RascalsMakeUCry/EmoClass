/**
 * Setup script untuk register IoT device ke database
 * Run: npm run setup:iot
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
function loadEnvFile() {
  try {
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
  } catch (error) {
    console.error('❌ Error loading .env.local file');
    process.exit(1);
  }
}

const env = loadEnvFile();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  console.log('🔧 IoT Device Setup Script\n');
  console.log('=' .repeat(60));

  // Get all classes
  console.log('\n📚 Fetching classes from database...');
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('id, name')
    .order('name');

  if (classError || !classes || classes.length === 0) {
    console.error('❌ Error: Tidak ada kelas di database');
    console.log('\n💡 Tip: Buat kelas dulu di Admin Dashboard');
    process.exit(1);
  }

  console.log(`✅ Ditemukan ${classes.length} kelas:\n`);
  console.log('   Note: class_id di iot_devices menggunakan angka 1, 2, 3...\n');
  classes.forEach((cls, index) => {
    console.log(`   ${index + 1}. ${cls.name} (class_id: ${index + 1})`);
  });

  // Check existing devices
  const { data: existingDevices } = await supabase
    .from('iot_devices')
    .select('device_id, class_id, classes(name)');

  if (existingDevices && existingDevices.length > 0) {
    console.log('\n📡 IoT Devices yang sudah terdaftar:\n');
    existingDevices.forEach((device, index) => {
      console.log(`   ${index + 1}. ${device.device_id} → ${(device.classes as any)?.name || 'Unknown'}`);
    });
  } else {
    console.log('\n📡 Belum ada IoT device terdaftar');
  }

  // Prompt for input
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n' + '='.repeat(60));
  console.log('📝 Register IoT Device Baru\n');

  readline.question('Device ID (contoh: ESP32-7A-001): ', async (deviceId: string) => {
    if (!deviceId.trim()) {
      console.log('❌ Device ID tidak boleh kosong');
      readline.close();
      process.exit(1);
    }

    readline.question(`Pilih kelas (1-${classes.length}): `, async (classChoice: string) => {
      const choice = parseInt(classChoice);

      if (choice < 1 || choice > classes.length) {
        console.log('❌ Pilihan tidak valid');
        readline.close();
        process.exit(1);
      }

      const selectedClass = classes[choice - 1];

      console.log('\n🚀 Registering device...');
      console.log(`   Device ID: ${deviceId.trim()}`);
      console.log(`   Class: ${selectedClass.name}`);
      console.log(`   class_id: ${choice} (numeric)`);

      // iot_devices.class_id is int2 (1, 2, 3...), not UUID
      const { data, error } = await supabase
        .from('iot_devices')
        .insert({
          device_id: deviceId.trim(),
          class_id: choice, // Use numeric index (1, 2, 3...)
        })
        .select()
        .single();

      if (error) {
        console.error('\n❌ Error:', error.message);
        if (error.code === '23505') {
          console.log('💡 Device ID sudah terdaftar. Gunakan ID yang berbeda.');
        }
        readline.close();
        process.exit(1);
      }

      console.log('\n✅ Device berhasil didaftarkan!');
      console.log(`   UUID: ${data.id}`);
      console.log('\n💡 Next steps:');
      console.log('   1. Run: npm run test:environment');
      console.log('   2. Pilih scenario untuk insert test data');
      console.log('   3. Buka Teacher Dashboard dan pilih kelas:', selectedClass.name);

      readline.close();
      process.exit(0);
    });
  });
}

main().catch(console.error);
