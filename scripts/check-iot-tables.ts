/**
 * Check IoT tables structure
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

async function main() {
  console.log('🔍 Checking IoT Tables Structure\n');

  // Check iot_devices
  console.log('📋 Table: iot_devices');
  const { data: devices, error: devError } = await supabase
    .from('iot_devices')
    .select('*')
    .limit(1);

  if (devError) {
    console.log('❌ Error:', devError.message);
  } else {
    console.log('✅ Table exists');
    if (devices && devices.length > 0) {
      console.log('Sample data:', JSON.stringify(devices[0], null, 2));
    } else {
      console.log('No data yet');
    }
  }

  // Check iot_sensor_data
  console.log('\n📋 Table: iot_sensor_data');
  const { data: sensors, error: sensError } = await supabase
    .from('iot_sensor_data')
    .select('*')
    .limit(1);

  if (sensError) {
    console.log('❌ Error:', sensError.message);
  } else {
    console.log('✅ Table exists');
    if (sensors && sensors.length > 0) {
      console.log('Sample data:', JSON.stringify(sensors[0], null, 2));
    } else {
      console.log('No data yet');
    }
  }

  // Check classes
  console.log('\n📋 Table: classes');
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('*')
    .limit(3);

  if (classError) {
    console.log('❌ Error:', classError.message);
  } else {
    console.log('✅ Table exists');
    console.log('Classes:', classes);
  }
}

main().catch(console.error);
