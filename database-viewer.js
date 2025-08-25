const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');
const path = require('path');

// Database connection
const dbPath = process.env.DATABASE_URL || './database.sqlite';
const db = new sqlite3.Database(dbPath);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to run queries
function runQuery(query) {
  return new Promise((resolve, reject) => {
    if (query.trim().toLowerCase().startsWith('select')) {
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } else {
      db.run(query, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes, lastID: this.lastID });
        }
      });
    }
  });
}

// Helper function to show tables
function showTables() {
  return runQuery("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;");
}

// Helper function to describe table structure
function describeTable(tableName) {
  return runQuery(`PRAGMA table_info(${tableName});`);
}

// Helper function to show table data with limit
function showTableData(tableName, limit = 10) {
  return runQuery(`SELECT * FROM ${tableName} LIMIT ${limit};`);
}

// Main CLI loop
async function startCLI() {
  console.log('🗄️  Database Viewer CLI Started');
  console.log('📊 Database:', dbPath);
  console.log('\nCommands:');
  console.log('  .tables          - Show all tables');
  console.log('  .desc <table>    - Describe table structure');
  console.log('  .show <table>    - Show first 10 rows of table');
  console.log('  .count <table>   - Count rows in table');
  console.log('  .quit            - Exit');
  console.log('  Or type any SQL query...\n');

  function prompt() {
    rl.question('sqlite> ', async (input) => {
      const command = input.trim();
      
      if (command === '.quit' || command === 'exit') {
        console.log('Goodbye!');
        db.close();
        rl.close();
        return;
      }
      
      if (command === '.tables') {
        try {
          const tables = await showTables();
          console.log('\nTables:');
          tables.forEach(table => console.log(`  - ${table.name}`));
          console.log('');
        } catch (err) {
          console.error('Error:', err.message);
        }
      } else if (command.startsWith('.desc ')) {
        const tableName = command.substring(6);
        try {
          const columns = await describeTable(tableName);
          console.log(`\nTable: ${tableName}`);
          console.log('Columns:');
          columns.forEach(col => {
            const pk = col.pk ? ' (PRIMARY KEY)' : '';
            const notnull = col.notnull ? ' NOT NULL' : '';
            console.log(`  - ${col.name}: ${col.type}${notnull}${pk}`);
          });
          console.log('');
        } catch (err) {
          console.error('Error:', err.message);
        }
      } else if (command.startsWith('.show ')) {
        const tableName = command.substring(6);
        try {
          const rows = await showTableData(tableName);
          console.log(`\nFirst 10 rows from ${tableName}:`);
          console.table(rows);
        } catch (err) {
          console.error('Error:', err.message);
        }
      } else if (command.startsWith('.count ')) {
        const tableName = command.substring(7);
        try {
          const result = await runQuery(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`\nRows in ${tableName}: ${result[0].count}`);
        } catch (err) {
          console.error('Error:', err.message);
        }
      } else if (command) {
        try {
          const result = await runQuery(command);
          if (Array.isArray(result)) {
            console.log('\nResult:');
            console.table(result);
          } else {
            console.log('\nQuery executed successfully');
            console.log('Changes:', result.changes);
            if (result.lastID) console.log('Last Insert ID:', result.lastID);
          }
        } catch (err) {
          console.error('Error:', err.message);
        }
      }
      
      prompt();
    });
  }
  
  prompt();
}

startCLI().catch(console.error);