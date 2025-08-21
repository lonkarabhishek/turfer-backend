# Turfer Backend API

Backend API for the Turfer turf booking application.

## Features

- User authentication (signup/login)
- Turf management and search
- Booking system
- Game organization
- Review system
- SQLite database with seed data

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env`)
4. Start development server:
   ```bash
   npm run dev
   ```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

- `GET /health` - Health check
- `GET /api/turfs` - Get turfs with search/filter
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- And more...

## Environment Variables

- `DATABASE_URL` - SQLite database path
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins
- `PORT` - Server port (default: 3001)

## Deployment

This API is designed to be deployed on Railway, Render, or similar platforms.