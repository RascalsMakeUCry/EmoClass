// Script untuk testing cron jobs
// Run: npx tsx scripts/test-cron-jobs.ts

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

const CRON_SECRET = process.env.CRON_SECRET;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!CRON_SECRET) {
  console.error('❌ CRON_SECRET not found in .env.local');
  console.log('   Add: CRON_SECRET=your-random-secret-key');
  process.exit(1);
}

async function testCronJob(name: string, path: string) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   URL: ${BASE_URL}${path}`);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Failed (${response.status}):`, data.error || data.message);
      return false;
    }

    console.log('✅ Success!');
    console.log('   Response:', JSON.stringify(data, null, 2));
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testAllCronJobs() {
  console.log('🔔 Testing Cron Jobs\n');
  console.log('Base URL:', BASE_URL);
  console.log('CRON_SECRET:', CRON_SECRET ? '✅ Set' : '❌ Not set');

  const jobs = [
    { name: 'Daily Summary', path: '/api/cron/daily-summary' },
    { name: 'Weekly Summary', path: '/api/cron/weekly-summary' },
    { name: 'Check Missing Check-ins', path: '/api/cron/check-missing-checkins' },
  ];

  const results: { [key: string]: boolean } = {};

  for (const job of jobs) {
    results[job.name] = await testCronJob(job.name, job.path);
  }

  // Summary
  console.log('\n\n📊 Test Summary:');
  console.log('═══════════════════════════════════════');
  
  let passCount = 0;
  let failCount = 0;

  Object.entries(results).forEach(([name, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${passed ? 'PASSED' : 'FAILED'}`);
    if (passed) passCount++;
    else failCount++;
  });

  console.log('═══════════════════════════════════════');
  console.log(`Total: ${passCount + failCount} | Passed: ${passCount} | Failed: ${failCount}`);

  if (failCount === 0) {
    console.log('\n🎉 All cron jobs working correctly!');
  } else {
    console.log('\n⚠️  Some cron jobs failed. Check the errors above.');
  }

  // Instructions
  console.log('\n📝 Next Steps:');
  console.log('1. Make sure your dev server is running: npm run dev');
  console.log('2. Check that CRON_SECRET matches in .env.local');
  console.log('3. For production, deploy to Vercel with vercel.json');
  console.log('4. Verify cron jobs in Vercel Dashboard → Settings → Cron Jobs');
}

// Run tests
testAllCronJobs().catch(console.error);
