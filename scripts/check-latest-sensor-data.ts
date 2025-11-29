/**
 * Check latest sensor data for class_id 1
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

async function checkLatest() {
  console.log('📊 Latest Sensor Data for Kelas 7A\n');
  console.log('='.repeat(60));

  // Get devices for class_id 1
  const { data: devices } = await supabase
    .from('iot_devices')
    .select('*')
    .eq('class_id', 1);

  console.log('\n📡 Devices for class_id 1:');
  devices?.forEach(device => {
    console.log(`   ${device.id} - ${device.device_id}`);
  });

  // Get latest data for each device
  for (const device of devices || []) {
    console.log(`\n📊 Latest data for device ${device.device_id}:`);
    
    const { data: sensorData } = await supabase
      .from('iot_sensor_data')
      .select('*')
      .eq('device_id', device.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (sensorData && sensorData.length > 0) {
      sensorData.forEach((data, index) => {
        console.log(`\n   ${index + 1}. Created: ${data.created_at}`);
        console.log(`      Temp: ${data.temperature}°C`);
        console.log(`      Humidity: ${data.humidity}%`);
        console.log(`      Gas: ${data.gas_analog}`);
        console.log(`      Light: ${data.light_analog}`);
        console.log(`      Sound: ${data.sound_analog}`);
      });
    } else {
      console.log('   No data found');
    }
  }

  // Show what API will return
  console.log('\n\n🌐 What API Returns (first device):');
  if (devices && devices.length > 0) {
    const { data: apiData } = await supabase
      .from('iot_sensor_data')
      .select('*')
      .eq('device_id', devices[0].id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log(JSON.stringify(apiData, null, 2));
  }
}

checkLatest().catch(console.error);
