import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from 'dotenv';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Import routes
import authRoutes from './routes/auth';
import turfRoutes from './routes/turfs';
import bookingRoutes from './routes/bookings';
import gameRoutes from './routes/games';

// Import database connection
import SupabaseConnection from './database/supabase';

// Load environment variables
config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Initialize database
try {
  console.log('🔧 Initializing Supabase connection...');
  SupabaseConnection.getInstance();
  console.log('✅ Supabase connection established');
} catch (error) {
  console.error('❌ Supabase initialization failed:', error);
  console.log('⚠️ Server will start anyway but database operations will fail');
}

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

const rateLimiterMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later'
    });
  }
};

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5175',
      'https://www.tapturf.in',
      'https://tapturf.in',
      'https://turfer-3kczypujz-abhisheks-projects-dabd8858.vercel.app',
      'https://turfer-git-main-abhisheks-projects-dabd8858.vercel.app'
    ];
    
    // Allow any Vercel deployment domain
    if (origin.includes('.vercel.app') || origin.includes('tapturf.in')) {
      console.log('✅ CORS allowed for:', origin);
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for:', origin);
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked for:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimiterMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint - respond immediately for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Turf booking API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    node_version: process.version
  });
});

// Simple ping endpoint
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'TapTurf Backend API',
    version: '1.0.9',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      turfs: '/api/turfs',
      games: '/api/games',
      bookings: '/api/bookings'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/games', gameRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status((err as any).status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 API endpoints available at http://0.0.0.0:${PORT}/api`);
  console.log(`💚 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🌍 External URL: ${process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : 'Not available'}`);
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;