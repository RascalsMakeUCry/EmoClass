/**
 * Debug Script: Test Supabase Realtime Connection
 * 
 * Script ini untuk memastikan Supabase Realtime berfungsi dengan baik
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealtimeConnection() {
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║         Debug: Supabase Realtime Connection Test                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log();
  
  console.log('📡 Testing Realtime connection...');
  console.log('Supabase URL:', supabaseUrl);
  console.log();

  // Test 1: Subscribe to users table changes
  console.log('🔍 Test 1: Subscribing to users table changes...');
  
  const channel = supabase
    .channel('test-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
      },
      (payload) => {
        console.log('✅ Realtime event received!');
        console.log('Event type:', payload.eventType);
        console.log('Payload:', JSON.stringify(payload, null, 2));
      }
    )
    .subscribe((status) => {
      console.log('📊 Subscription status:', status);
      
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to Realtime!');
        console.log();
        console.log('💡 Now try updating a user in another terminal:');
        console.log('   npx tsx scripts/test-account-deactivation.ts');
        console.log();
        console.log('⏳ Listening for changes... (Press Ctrl+C to stop)');
      } else if (status === 'CHANNEL_ERROR') {
        console.log('❌ Failed to subscribe to Realtime');
        console.log('   Possible causes:');
        console.log('   1. Realtime not enabled in Supabase');
        console.log('   2. Network connection issues');
        console.log('   3. Invalid credentials');
      }
    });

  // Keep the script running
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping Realtime listener...');
    supabase.removeChannel(channel);
    process.exit(0);
  });
}

testRealtimeConnection().catch(console.error);
