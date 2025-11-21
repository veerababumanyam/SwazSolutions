#!/bin/bash

# Camera Updates SQLite Integration Setup Script
echo "🚀 Setting up Camera Updates with SQLite database..."

# Navigate to backend directory
cd "$(dirname "$0")/backend"

echo "📦 Installing dependencies..."
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "📊 Database tables will be created automatically on first run."
echo ""
echo "To start the server:"
echo "  cd backend"
echo "  npm start"
echo ""
echo "Or from root:"
echo "  npm run server"
