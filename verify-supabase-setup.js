const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hwfsbpzercuoshodmnuf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZnNicHplcmN1b3Nob2RtbnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjMxODMsImV4cCI6MjA3MTYzOTE4M30.XCWCIZ2B3UxvaMbmLyCntkxTCnjfeobW7PTblpqfwbo';

async function verifySupabaseSetup() {
  console.log('🔍 COMPREHENSIVE SUPABASE SETUP VERIFICATION');
  console.log('='.repeat(50));
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('📊 Project URL:', supabaseUrl);
  console.log('🔑 Using anon key:', supabaseKey.substring(0, 50) + '...');
  console.log('');

  // Test 1: Basic Connection
  console.log('🧪 TEST 1: Basic Connection');
  try {
    // Try a simple query that should work
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .single();
    
    if (error) {
      console.log('❌ Connection Error:', error.message);
      console.log('📋 Error Code:', error.code);
      
      if (error.code === 'PGRST301') {
        console.log('🔒 Row Level Security is blocking access');
        console.log('💡 Solution: Disable RLS or update policies');
      }
    } else {
      console.log('✅ Basic connection works');
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
  
  console.log('');

  // Test 2: Check table existence and RLS status
  console.log('🧪 TEST 2: Table Structure & RLS Status');
  const tables = ['users', 'turfs', 'games', 'bookings', 'reviews'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === 'PGRST106' || error.code === '42P01') {
          console.log(`❌ Table '${table}' does not exist`);
        } else if (error.code === 'PGRST301') {
          console.log(`🔒 Table '${table}' exists but RLS is blocking access`);
        } else {
          console.log(`⚠️  Table '${table}' - Error: ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${table}' - accessible, ${data?.length || 0} rows returned`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}' - Exception:`, err.message);
    }
  }
  
  console.log('');

  // Test 3: Try inserting test data
  console.log('🧪 TEST 3: Write Operations');
  try {
    const testUser = {
      id: 'test-' + Date.now(),
      email: 'test-' + Date.now() + '@example.com',
      password: 'hashed-password',
      name: 'Test User',
      role: 'user',
      is_verified: true
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([testUser])
      .select();
    
    if (error) {
      console.log('❌ Write operation failed:', error.message);
      console.log('📋 Error Code:', error.code);
    } else {
      console.log('✅ Write operation successful');
      // Clean up
      await supabase.from('users').delete().eq('id', testUser.id);
    }
  } catch (err) {
    console.log('❌ Write operation exception:', err.message);
  }
  
  console.log('');
  console.log('🎯 RECOMMENDATIONS:');
  
  // Show direct SQL to run in dashboard
  console.log('');
  console.log('📋 Run this SQL in Supabase SQL Editor:');
  console.log('-'.repeat(40));
  console.log(`
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'turfs', 'games', 'bookings', 'reviews');

-- Disable RLS for development (TEMPORARY)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE turfs DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;  
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Add test data
INSERT INTO users (id, email, password, name, phone, role, is_verified) VALUES
('test-user-1', 'user@tapturf.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test User', '1234567890', 'user', true),
('test-owner-1', 'owner@tapturf.in', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Test Owner', '1234567891', 'owner', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO turfs (id, owner_id, name, address, sports, amenities, images, price_per_hour, operating_hours, contact_info, rating, total_reviews, is_active) VALUES
('test-turf-1', 'test-owner-1', 'Test Cricket Ground', 'Test Address, Mumbai', '["Cricket"]', '["Parking", "Cafeteria"]', '[]', 800, '{}', '{}', 4.5, 10, true)
ON CONFLICT (id) DO NOTHING;
`);
  console.log('-'.repeat(40));
  console.log('');
  console.log('🌐 Go to: https://supabase.com/dashboard/project/hwfsbpzercuoshodmnuf/sql');
}

verifySupabaseSetup().catch(console.error);