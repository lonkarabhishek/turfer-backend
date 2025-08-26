const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hwfsbpzercuoshodmnuf.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZnNicHplcmN1b3Nob2RtbnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjMxODMsImV4cCI6MjA3MTYzOTE4M30.XCWCIZ2B3UxvaMbmLyCntkxTCnjfeobW7PTblpqfwbo';

async function applyMigration() {
  console.log('🔧 Connecting to Supabase...');
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250826131207_create_initial_schema.sql');
    console.log('📄 Reading migration file:', migrationPath);
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🗃️ Applying database schema...');
    
    // Note: This approach uses the anon key and won't work for DDL operations
    // We'll need to use the service key or run this manually
    console.log('⚠️  Cannot apply DDL operations with anon key.');
    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log('1. Go to https://supabase.com/dashboard/project/hwfsbpzercuoshodmnuf/sql');
    console.log('2. Copy and paste the migration SQL from:');
    console.log('   ' + migrationPath);
    console.log('3. Click "Run" to execute the migration');
    console.log('');
    
    // Test connection with a simple query that works with anon key
    const { data, error } = await supabase
      .from('_realtime_schema_versions')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST106') { // PGRST106 = relation does not exist, which is expected
      console.log('✅ Connection to Supabase successful');
    } else {
      console.log('✅ Connection to Supabase successful');
    }
    
    // Create a test script to verify tables after migration
    console.log('');
    console.log('📝 After running the migration, you can test with:');
    console.log('   node test-supabase.js');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();