#!/bin/bash

echo "🚀 UniNest Setup Script"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed or not in PATH."
    echo "   Please install PostgreSQL 14+ first:"
    echo "   - macOS: brew install postgresql@14"
    echo "   - Or download from: https://www.postgresql.org/download/"
    echo ""
    echo "   After installation, make sure 'psql' and 'createdb' commands are available."
    echo "   You may need to add PostgreSQL to your PATH."
    echo ""
    read -p "Press Enter to continue anyway (you'll need to set up PostgreSQL manually)..."
else
    echo "✅ PostgreSQL detected"
fi

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install

echo ""
echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install

echo ""
echo "🔧 Setting up Environment Files..."
cd ../backend
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Backend .env file created"
    echo "   Please edit backend/.env with your database and API credentials"
else
    echo "⚠️  Backend .env file already exists"
fi

cd ../frontend
if [ ! -f .env.local ]; then
    cp env.local.example .env.local
    echo "✅ Frontend .env.local file created"
    echo "   Please edit frontend/.env.local with your API configuration"
else
    echo "⚠️  Frontend .env.local file already exists"
fi

echo ""
echo "🗄️  Database Setup Instructions:"
echo "   1. Create a PostgreSQL database:"
echo "      createdb uninest"
echo "   2. Run the database schema:"
echo "      psql -d uninest -f backend/config/database.sql"
echo ""
echo "🚀 Starting the Application:"
echo "   1. Backend: cd backend && npm run dev"
echo "   2. Frontend: cd frontend && npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000"
echo "   - API Health: http://localhost:5000/health"
echo ""
echo "✅ Setup complete! Follow the instructions above to get started."
