#!/bin/bash

echo "🚀 UniNest Render Deployment Script"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ] || [ ! -f "backend/package.json" ]; then
    print_error "Please run this script from the UniNest project root directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not initialized. Please run 'git init' first."
    exit 1
fi

# Check if remote origin is set
if ! git remote get-url origin >/dev/null 2>&1; then
    print_warning "No remote origin set. Please set up your GitHub repository first."
    echo ""
    echo "To set up your repository:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/uninest.git"
    echo "3. Run this script again"
    echo ""
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Auto-commit before Render deployment: $(date)"
    print_success "Changes committed"
else
    print_status "No uncommitted changes found"
fi

# Check if we need to push
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/$CURRENT_BRANCH 2>/dev/null || echo "none")

if [ "$LOCAL_COMMIT" != "$REMOTE_COMMIT" ]; then
    print_status "Pushing changes to GitHub..."
    git push origin $CURRENT_BRANCH
    
    if [ $? -eq 0 ]; then
        print_success "Successfully pushed to GitHub!"
        echo ""
        echo "🎉 Your code is now on GitHub!"
        echo ""
        echo "📱 Next steps for Render deployment:"
        echo ""
        echo "🗄️  Step 1: Create PostgreSQL Database"
        echo "   1. Go to https://render.com"
        echo "   2. Sign up with GitHub"
        echo "   3. Click 'New +' → 'PostgreSQL'"
        echo "   4. Name: uninest-database"
        echo "   5. Database: uninest"
        echo "   6. Click 'Create Database'"
        echo ""
        echo "🖥️  Step 2: Deploy Backend"
        echo "   1. Click 'New +' → 'Web Service'"
        echo "   2. Connect your GitHub repository"
        echo "   3. Root Directory: backend"
        echo "   4. Build Command: npm install"
        echo "   5. Start Command: npm start"
        echo "   6. Set environment variables (see RENDER_DEPLOYMENT.md)"
        echo ""
        echo "📱 Step 3: Deploy Frontend"
        echo "   1. Click 'New +' → 'Static Site'"
        echo "   2. Connect your GitHub repository"
        echo "   3. Root Directory: frontend"
        echo "   4. Build Command: npm install && npm run build"
        echo "   5. Publish Directory: .next"
        echo "   6. Set environment variables"
        echo ""
        echo "📚 See RENDER_DEPLOYMENT.md for detailed instructions"
    else
        print_error "Failed to push to GitHub. Please check your credentials and try again."
        exit 1
    fi
else
    print_success "Your local repository is up to date with GitHub"
    echo ""
    echo "📱 To deploy to Render:"
    echo "1. Go to https://render.com"
    echo "2. Follow the steps in RENDER_DEPLOYMENT.md"
fi

echo ""
print_status "Render deployment script completed successfully!"
echo ""
echo "🔗 Your Render services will be available at:"
echo "   - Frontend: https://your-frontend-service-name.onrender.com"
echo "   - Backend: https://your-backend-service-name.onrender.com"
echo "   - Database: Managed by Render"
