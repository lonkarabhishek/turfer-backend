const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.ADMIN_PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const dbPath = process.env.DATABASE_URL || './database.sqlite';
const db = new sqlite3.Database(dbPath);

// Serve the admin interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>TapTurf Database Admin</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #333; text-align: center; }
        .section { 
            background: white; 
            margin: 20px 0; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .tabs {
            display: flex;
            margin-bottom: 20px;
        }
        .tab {
            padding: 10px 20px;
            background: #e0e0e0;
            border: none;
            cursor: pointer;
            margin-right: 5px;
            border-radius: 4px 4px 0 0;
        }
        .tab.active {
            background: #007bff;
            color: white;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd; 
        }
        th { background: #f8f9fa; font-weight: 600; }
        tr:hover { background: #f8f9fa; }
        .query-input {
            width: 100%;
            height: 120px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #0056b3;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .table-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        .table-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            cursor: pointer;
            border: 1px solid #dee2e6;
        }
        .table-card:hover {
            background: #e9ecef;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏟️ TapTurf Database Admin</h1>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('overview')">Overview</button>
            <button class="tab" onclick="showTab('tables')">Tables</button>
            <button class="tab" onclick="showTab('query')">SQL Query</button>
        </div>

        <div id="overview" class="tab-content active">
            <div class="section">
                <h2>Database Statistics</h2>
                <div class="stats" id="stats"></div>
            </div>
        </div>

        <div id="tables" class="tab-content">
            <div class="section">
                <h2>Database Tables</h2>
                <div class="table-list" id="tableList"></div>
                <div id="tableData"></div>
            </div>
        </div>

        <div id="query" class="tab-content">
            <div class="section">
                <h2>Execute SQL Query</h2>
                <textarea class="query-input" id="queryInput" placeholder="Enter your SQL query here...
Examples:
SELECT * FROM users LIMIT 10;
SELECT COUNT(*) FROM games;
SELECT name, email FROM users WHERE role = 'owner';
UPDATE users SET name = 'New Name' WHERE id = 'user-id';"></textarea>
                <br><br>
                <button onclick="executeQuery()">Execute Query</button>
                <div id="queryResult"></div>
            </div>
        </div>
    </div>

    <script>
        let currentTable = null;

        function showTab(tabName) {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            if (tabName === 'overview') loadStats();
            if (tabName === 'tables') loadTables();
        }

        async function loadStats() {
            try {
                const response = await fetch('/api/stats');
                const stats = await response.json();
                
                const statsHtml = Object.entries(stats).map(([key, value]) => 
                    \`<div class="stat-card">
                        <div class="stat-number">\${value}</div>
                        <div class="stat-label">\${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                    </div>\`
                ).join('');
                
                document.getElementById('stats').innerHTML = statsHtml;
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        async function loadTables() {
            try {
                const response = await fetch('/api/tables');
                const tables = await response.json();
                
                const tablesHtml = tables.map(table => 
                    \`<div class="table-card" onclick="loadTableData('\${table.name}')">
                        <h3>\${table.name}</h3>
                        <p>Click to view data</p>
                    </div>\`
                ).join('');
                
                document.getElementById('tableList').innerHTML = tablesHtml;
            } catch (error) {
                console.error('Error loading tables:', error);
            }
        }

        async function loadTableData(tableName) {
            try {
                const response = await fetch(\`/api/table/\${tableName}\`);
                const data = await response.json();
                
                if (data.length === 0) {
                    document.getElementById('tableData').innerHTML = \`
                        <div class="section">
                            <h3>\${tableName}</h3>
                            <p>No data found in this table.</p>
                        </div>
                    \`;
                    return;
                }
                
                const headers = Object.keys(data[0]);
                const tableHtml = \`
                    <div class="section">
                        <h3>\${tableName} (\${data.length} rows shown)</h3>
                        <table>
                            <thead>
                                <tr>\${headers.map(h => \`<th>\${h}</th>\`).join('')}</tr>
                            </thead>
                            <tbody>
                                \${data.map(row => 
                                    \`<tr>\${headers.map(h => \`<td>\${row[h] || ''}</td>\`).join('')}</tr>\`
                                ).join('')}
                            </tbody>
                        </table>
                    </div>
                \`;
                
                document.getElementById('tableData').innerHTML = tableHtml;
            } catch (error) {
                console.error('Error loading table data:', error);
            }
        }

        async function executeQuery() {
            const query = document.getElementById('queryInput').value.trim();
            if (!query) return;

            try {
                const response = await fetch('/api/query', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });

                const result = await response.json();
                
                if (!response.ok) {
                    document.getElementById('queryResult').innerHTML = \`
                        <div class="error">Error: \${result.error}</div>
                    \`;
                    return;
                }

                let resultHtml = '<div class="success">Query executed successfully!</div>';
                
                if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                    const headers = Object.keys(result.data[0]);
                    resultHtml += \`
                        <table>
                            <thead>
                                <tr>\${headers.map(h => \`<th>\${h}</th>\`).join('')}</tr>
                            </thead>
                            <tbody>
                                \${result.data.map(row => 
                                    \`<tr>\${headers.map(h => \`<td>\${row[h] || ''}</td>\`).join('')}</tr>\`
                                ).join('')}
                            </tbody>
                        </table>
                    \`;
                } else if (result.changes !== undefined) {
                    resultHtml += \`<p>Rows affected: \${result.changes}</p>\`;
                }

                document.getElementById('queryResult').innerHTML = resultHtml;
            } catch (error) {
                document.getElementById('queryResult').innerHTML = \`
                    <div class="error">Network error: \${error.message}</div>
                \`;
            }
        }

        // Load initial data
        loadStats();
    </script>
</body>
</html>
  `);
});

// API Routes
app.get('/api/tables', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/table/:name', (req, res) => {
  const tableName = req.params.name;
  // Sanitize table name to prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }
  
  db.all(`SELECT * FROM ${tableName} LIMIT 100`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = {};
    
    const queries = {
      totalUsers: "SELECT COUNT(*) as count FROM users",
      totalTurfs: "SELECT COUNT(*) as count FROM turfs", 
      totalGames: "SELECT COUNT(*) as count FROM games",
      totalBookings: "SELECT COUNT(*) as count FROM bookings",
      totalReviews: "SELECT COUNT(*) as count FROM reviews",
      activeGames: "SELECT COUNT(*) as count FROM games WHERE status = 'open'",
      verifiedUsers: "SELECT COUNT(*) as count FROM users WHERE is_verified = 1"
    };
    
    for (const [key, query] of Object.entries(queries)) {
      await new Promise((resolve, reject) => {
        db.get(query, (err, row) => {
          if (err) reject(err);
          else {
            stats[key] = row.count;
            resolve();
          }
        });
      });
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/query', (req, res) => {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  // Basic safety check - prevent dangerous operations in production
  const dangerousKeywords = ['drop', 'delete', 'truncate', 'alter'];
  const queryLower = query.toLowerCase().trim();
  
  if (process.env.NODE_ENV === 'production' && 
      dangerousKeywords.some(keyword => queryLower.includes(keyword))) {
    return res.status(403).json({ error: 'Dangerous queries are not allowed in production' });
  }
  
  if (queryLower.startsWith('select')) {
    db.all(query, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ data: rows });
      }
    });
  } else {
    db.run(query, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ changes: this.changes, lastID: this.lastID });
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🗄️  Database Admin running at http://localhost:${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
});