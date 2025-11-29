/**
 * Test script untuk Environment Alert Card
 * 
 * Script ini membantu insert test data ke iot_sensor_data
 * untuk testing berbagai kondisi lingkungan
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
    console.log('💡 Make sure .env.local exists in project root');
    process.exit(1);
  }
}

const env = loadEnvFile();
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Test scenarios
const scenarios = {
  normal: {
    name: '✅ Kondisi Normal (Semua Aman)',
    data: {
      temperature: 25,
      humidity: 50,
      gas_analog: 800,
      gas_digital: 0,
      light_analog: 2000,
      light_digital: 1,
      sound_analog: 1000,
      sound_digital: 0,
    }
  },
  hot: {
    name: '🌡️ Suhu Panas (Warning)',
    data: {
      temperature: 32,
      humidity: 50,
      gas_analog: 800,
      gas_digital: 0,
      light_analog: 2000,
      light_digital: 1,
      sound_analog: 1000,
      sound_digital: 0,
    }
  },
  extreme_hot: {
    name: '🔥 Suhu Sangat Panas (Danger)',
    data: {
      temperature: 36,
      humidity: 50,
      gas_analog: 800,
      gas_digital: 0,
      light_analog: 2000,
      light_digital: 1,
      sound_analog: 1000,
      sound_digital: 0,
    }
  },
  bad_air: {
    name: '⚠️ Kualitas Udara Buruk (Danger)',
    data: {
      temperature: 28,
      humidity: 50,
      gas_analog: 2100,
      gas_digital: 1,
      light_analog: 2000,
      light_digital: 1,
      sound_analog: 1000,
      sound_digital: 0,
    }
  },
  noisy: {
    name: '🔊 Kelas Berisik (Danger)',
    data: {
      temperature: 26,
      humidity: 50,
      gas_analog: 800,
      gas_digital: 0,
      light_analog: 2000,
      light_digital: 1,
      sound_analog: 2100,
      sound_digital: 1,
    }
  },
  dark: {
    name: '🌙 Ruangan Gelap (Warning)',
    data: {
      temperature: 26,
      humidity: 50,
      gas_analog: 800,
      gas_digital: 0,
      light_analog: 800,
      light_digital: 0,
      sound_analog: 1000,
      sound_digital: 0,
    }
  },
  humid: {
    name: '💧 Sangat Lembap (Danger)',
    data: {
      temperature: 28,
      humidity: 88,
      gas_analog: 800,
      gas_digital: 0,
      light_analog: 2000,
      light_digital: 1,
      sound_analog: 1000,
      sound_digital: 0,
    }
  },
  multiple_issues: {
    name: '🚨 Multiple Issues (Danger)',
    data: {
      temperature: 34,
      humidity: 80,
      gas_analog: 1800,
      gas_digital: 1,
      light_analog: 900,
      light_digital: 0,
      sound_analog: 1900,
      sound_digital: 1,
    }
  },
};

async function getFirstDevice() {
  // iot_devices.class_id is int2 (1, 2, 3...), not UUID
  // So we can't join with classes table directly
  const { data, error } = await supabase
    .from('iot_devices')
    .select('id, device_id, class_id')
    .limit(1)
    .single();

  if (error || !data) {
    console.error('❌ Error: Tidak ada IoT device di database');
    console.log('\n💡 Tip: Pastikan sudah ada data di tabel iot_devices');
    console.log('   Contoh insert:');
    console.log('   INSERT INTO iot_devices (device_id, class_id)');
    console.log('   VALUES (\'ESP32-TEST-001\', 1);');
    console.log('\nOr run: npm run setup:iot');
    return null;
  }

  // Get class name separately
  const { data: classes } = await supabase
    .from('classes')
    .select('name')
    .order('name');

  const className = classes && data.class_id <= classes.length 
    ? classes[data.class_id - 1].name 
    : 'Unknown';

  return { ...data, className };
}

async function insertTestData(deviceId: string, scenario: typeof scenarios.normal) {
  const { error } = await supabase
    .from('iot_sensor_data')
    .insert({
      device_id: deviceId,
      ...scenario.data,
    });

  if (error) {
    console.error('❌ Error inserting data:', error.message);
    return false;
  }

  return true;
}

async function main() {
  console.log('🧪 Environment Alert Card - Test Script\n');
  console.log('=' .repeat(60));

  // Get first device
  console.log('\n📡 Mencari IoT device...');
  const device = await getFirstDevice();
  
  if (!device) {
    process.exit(1);
  }

  console.log(`✅ Device ditemukan:`);
  console.log(`   ID: ${device.id}`);
  console.log(`   Device ID: ${device.device_id}`);
  console.log(`   Class: ${device.className} (class_id: ${device.class_id})`);

  // Show menu
  console.log('\n' + '='.repeat(60));
  console.log('📋 Pilih Scenario untuk Test:\n');
  
  const scenarioKeys = Object.keys(scenarios);
  scenarioKeys.forEach((key, index) => {
    console.log(`   ${index + 1}. ${scenarios[key as keyof typeof scenarios].name}`);
  });
  console.log(`   0. Exit`);

  // Get user input
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('\n👉 Pilih nomor (0-8): ', async (answer: string) => {
    const choice = parseInt(answer);

    if (choice === 0) {
      console.log('\n👋 Bye!');
      readline.close();
      process.exit(0);
    }

    if (choice < 1 || choice > scenarioKeys.length) {
      console.log('❌ Pilihan tidak valid');
      readline.close();
      process.exit(1);
    }

    const scenarioKey = scenarioKeys[choice - 1] as keyof typeof scenarios;
    const scenario = scenarios[scenarioKey];

    console.log(`\n🚀 Inserting: ${scenario.name}`);
    console.log('📊 Data:', JSON.stringify(scenario.data, null, 2));

    const success = await insertTestData(device.id, scenario);

    if (success) {
      console.log('\n✅ Data berhasil diinsert!');
      console.log('\n💡 Sekarang buka Teacher Dashboard dan pilih kelas:');
      console.log(`   ${device.className}`);
      console.log('\n   Environment Alert Card akan update dalam 10 detik');
      console.log('   atau refresh halaman untuk update langsung.');
    }

    readline.close();
    process.exit(0);
  });
}

main().catch(console.error);
