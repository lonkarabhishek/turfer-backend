const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🚀 Simple server starting...');
console.log('📊 Port:', PORT);
console.log('🌍 Environment:', process.env.NODE_ENV);

// Middleware
app.use(cors());
app.use(express.json());

// Simple endpoints
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.json({
    message: 'Simple TapTurf Backend',
    status: 'running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  console.log('Health endpoint hit');
  res.json({
    success: true,
    message: 'Simple server is healthy',
    port: PORT
  });
});

app.get('/ping', (req, res) => {
  console.log('Ping endpoint hit');
  res.send('pong');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  process.exit(0);
});