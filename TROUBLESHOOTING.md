# UniNest Troubleshooting Guide

This guide helps resolve common issues during setup and development.

## 🚨 Common Issues & Solutions

### 1. **PostgreSQL Not Found**

#### Problem
```bash
zsh: command not found: createdb
zsh: command not found: psql
```

#### Solutions

**Option A: Install with Homebrew (Recommended)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Add to PATH (add this to your ~/.zshrc file)
echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Option B: Use Postgres.app**
1. Download [Postgres.app](https://postgresapp.com/)
2. Install and launch the application
3. It will automatically add PostgreSQL commands to your PATH

**Option C: Manual PATH Addition**
```bash
# Find PostgreSQL installation
find /usr/local -name "psql" 2>/dev/null
find /opt/homebrew -name "psql" 2>/dev/null

# Add to PATH (replace with actual path)
export PATH="/path/to/postgresql/bin:$PATH"
```

### 2. **Frontend Directory Issues**

#### Problem
```bash
cd: no such file or directory: frontend
```

#### Solution
```bash
# Check current directory
pwd
ls -la

# Navigate to project root
cd /Users/chakradarreddy/uninest

# Verify directories exist
ls -la
```

### 3. **Node.js Version Issues**

#### Problem
```bash
Error: Node.js version 18+ is required
```

#### Solution
```bash
# Check current version
node --version

# Install Node.js 18+ with Homebrew
brew install node@18

# Or download from https://nodejs.org/
```

### 4. **Database Connection Issues**

#### Problem
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

#### Solutions

**Start PostgreSQL Service**
```bash
# Homebrew
brew services start postgresql@14

# Postgres.app
# Just launch the application

# Manual
pg_ctl -D /usr/local/var/postgres start
```

**Check PostgreSQL Status**
```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Check port
lsof -i :5432
```

**Create Database User**
```bash
# Create a user (if needed)
createuser -s postgres

# Or connect as superuser
psql postgres
```

### 5. **Environment Variable Issues**

#### Problem
```bash
Error: JWT_SECRET is not defined
```

#### Solution
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your values

# Frontend
cd frontend
cp env.local.example .env.local
# Edit .env.local with your values
```

### 6. **Port Already in Use**

#### Problem
```bash
Error: listen EADDRINUSE: address already in use :::5000
```

#### Solution
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### 7. **Dependency Installation Issues**

#### Problem
```bash
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path package.json
```

#### Solution
```bash
# Make sure you're in the right directory
pwd
ls package.json

# If package.json doesn't exist, you're in the wrong directory
cd /Users/chakradarreddy/uninest/backend
npm install

cd ../frontend
npm install
```

### 8. **TypeScript Compilation Errors**

#### Problem
```bash
Type error: Cannot find module '@/components/...'
```

#### Solution
```bash
# Check tsconfig.json paths
cat frontend/tsconfig.json

# Make sure you're using the correct import syntax
import Component from '@/components/Component'

# Restart TypeScript server in your editor
```

## 🔧 Quick Fix Commands

### Reset Everything
```bash
# Stop all services
brew services stop postgresql@14

# Remove node_modules
rm -rf backend/node_modules frontend/node_modules

# Clear npm cache
npm cache clean --force

# Reinstall everything
./setup.sh
```

### Database Reset
```bash
# Drop and recreate database
dropdb uninest
createdb uninest
psql -d uninest -f backend/config/database.sql
```

### Environment Reset
```bash
# Remove environment files
rm backend/.env frontend/.env.local

# Recreate them
cp backend/env.example backend/.env
cp frontend/env.local.example frontend/.env.local
```

## 📱 Development Workflow

### 1. **Start Backend First**
```bash
cd backend
npm run dev
```

### 2. **Start Frontend Second**
```bash
cd frontend
npm run dev
```

### 3. **Check Health**
- Backend: http://localhost:5000/health
- Frontend: http://localhost:3000

## 🆘 Getting Help

### Check Logs
```bash
# Backend logs
cd backend
npm run dev

# Frontend logs
cd frontend
npm run dev
```

### Common Debug Points
1. **Database**: Is PostgreSQL running? Can you connect?
2. **Ports**: Are ports 3000 and 5000 available?
3. **Environment**: Are all required variables set?
4. **Dependencies**: Are all packages installed?

### Still Stuck?
1. Check the [main README.md](README.md)
2. Review [backend/README.md](backend/README.md)
3. Review [frontend/README.md](frontend/README.md)
4. Create an issue with:
   - Your operating system
   - Node.js version
   - Error messages
   - Steps to reproduce

## 🎯 Success Checklist

- [ ] PostgreSQL is running and accessible
- [ ] Database 'uninest' exists
- [ ] Database schema is loaded
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:5000/health
- [ ] Authentication works (login/register)
- [ ] Can browse apartments
- [ ] Can add to wishlist

---

**Remember**: Always start with the backend first, then the frontend. The frontend depends on the backend API being available.
