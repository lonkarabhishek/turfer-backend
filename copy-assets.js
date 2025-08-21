const fs = require('fs');
const path = require('path');

// Create dist/database directory if it doesn't exist
const distDbDir = path.join(__dirname, 'dist', 'database');
if (!fs.existsSync(distDbDir)) {
  fs.mkdirSync(distDbDir, { recursive: true });
}

// Copy SQL files
const srcDbDir = path.join(__dirname, 'src', 'database');
const filesToCopy = fs.readdirSync(srcDbDir).filter(file => 
  file.endsWith('.sql') || file.endsWith('.json')
);

filesToCopy.forEach(file => {
  const srcPath = path.join(srcDbDir, file);
  const destPath = path.join(distDbDir, file);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${file} to dist/database/`);
});

console.log('✅ Database assets copied successfully');