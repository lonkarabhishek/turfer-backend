#!/bin/bash

echo "🔧 Starting TapTurf backend..."
echo "📊 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"
echo "🌍 Environment: $NODE_ENV"
echo "🚪 Port: $PORT"
echo "💾 Database URL: $DATABASE_URL"
echo "📁 Working directory: $(pwd)"
echo "📂 Files in directory:"
ls -la

echo "🗃️ Checking dist directory:"
if [ -d "dist" ]; then
  echo "✅ dist directory exists"
  ls -la dist/
else
  echo "❌ dist directory missing - running build..."
  npm run build
fi

echo "🚀 Starting server..."
exec npm start