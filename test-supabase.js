const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hwfsbpzercuoshodmnuf.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3ZnNicHplcmN1b3Nob2RtbnVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjMxODMsImV4cCI6MjA3MTYzOTE4M30.XCWCIZ2B3UxvaMbmLyCntkxTCnjfeobW7PTblpqfwbo';

async function testSupabase() {
  console.log('🧪 Testing Supabase connection and tables...');
  console.log('📊 Supabase URL:', supabaseUrl);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const tables = ['users', 'turfs', 'games', 'bookings', 'reviews'];
  
  for (const table of tables) {
    try {
      console.log(`🔍 Testing ${table} table...`);
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === 'PGRST106') {
          console.log(`❌ Table '${table}' does not exist`);
        } else if (error.code === '42P01') {
          console.log(`❌ Table '${table}' does not exist (PostgreSQL error)`);
        } else {
          console.log(`❌ Error accessing '${table}':`, error.message);
        }
      } else {
        console.log(`✅ Table '${table}' exists (${count || 0} rows)`);
      }
    } catch (err) {
      console.log(`❌ Exception testing '${table}':`, err.message);
    }
  }
  
  console.log('');
  console.log('🎯 Next steps:');
  console.log('1. If tables don\'t exist, run the migration SQL in Supabase dashboard');
  console.log('2. Test the backend with: npm run build && npm start');
  console.log('3. Deploy to Railway after successful local testing');
}

testSupabase().catch(console.error);