const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create database
const db = new sqlite3.Database('./database.sqlite');

// Read and execute schema
const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema into individual statements
const statements = schema.split(';').filter(stmt => stmt.trim());

// Execute each statement
db.serialize(() => {
  statements.forEach(statement => {
    if (statement.trim()) {
      db.run(statement + ';', (err) => {
        if (err) {
          console.error('Error executing statement:', err.message);
          console.log('Statement:', statement.substring(0, 100) + '...');
        }
      });
    }
  });
  
  // Insert some basic seed data
  console.log('✅ Database schema initialized');
  
  // Create admin user
  const adminId = 'admin-' + Date.now();
  db.run(`INSERT INTO users (id, email, password, name, role, is_verified) 
          VALUES (?, ?, ?, ?, ?, ?)`, 
         [adminId, 'admin@tapturf.in', 'hashed_password', 'Admin User', 'admin', 1], 
         function(err) {
    if (err) {
      console.error('Error creating admin user:', err.message);
    } else {
      console.log('✅ Admin user created');
    }
  });
  
  // Add a test turf
  const turfId = 'turf-' + Date.now();
  db.run(`INSERT INTO turfs (id, owner_id, name, address, sports, amenities, price_per_hour, operating_hours, contact_info, is_active) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
         [turfId, adminId, 'Test Sports Complex', 'Test Address, Nashik', '["football", "cricket"]', '["parking", "wifi"]', 500, '{}', '{"phone": "1234567890"}', 1], 
         function(err) {
    if (err) {
      console.error('Error creating test turf:', err.message);
    } else {
      console.log('✅ Test turf created');
    }
  });
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Database initialization complete!');
    }
  });
});