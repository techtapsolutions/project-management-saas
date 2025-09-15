#!/bin/bash

# Railway Deployment Script for Project Management SaaS
# This script helps set up the project for Railway deployment

set -e

echo "🚂 Railway Deployment Setup Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "railway.toml" ]; then
    echo "❌ Error: railway.toml not found. Please run this script from the project root directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
else
    echo "✅ Git repository already initialized"
fi

# Generate JWT secrets
echo ""
echo "🔑 Generating JWT secrets..."
echo "=================================="
echo "Copy these values and add them to your Railway API service environment variables:"
echo ""
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI not found. To install it, run:"
    echo "   npm install -g @railway/cli"
    echo ""
    echo "After installation, you can:"
    echo "1. Login: railway login"
    echo "2. Link to project: railway link"
    echo "3. Deploy database schema: cd packages/database && railway run npx prisma db push"
    echo ""
else
    echo "✅ Railway CLI is installed"
    
    # Check if user is logged in
    if railway whoami &> /dev/null; then
        echo "✅ You're logged in to Railway"
        
        # Ask if they want to deploy database schema
        echo ""
        read -p "🗄️  Do you want to deploy the database schema now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📊 Deploying database schema..."
            cd packages/database
            railway run npx prisma db push
            cd ../..
            echo "✅ Database schema deployed successfully!"
        fi
    else
        echo "⚠️  You're not logged in to Railway. Run 'railway login' first."
    fi
fi

# Check if all necessary files are present
echo ""
echo "📋 Checking deployment files..."
echo "=================================="

required_files=(
    "railway.toml"
    "RAILWAY_SETUP.md" 
    "railway-env.md"
    "RAILWAY_CHECKLIST.md"
    "apps/api/Dockerfile"
    "apps/web/Dockerfile"
    ".dockerignore"
    "packages/database/prisma/schema.prisma"
)

all_present=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        all_present=false
    fi
done

if [ "$all_present" = true ]; then
    echo ""
    echo "🎉 All deployment files are present!"
else
    echo ""
    echo "⚠️  Some files are missing. Please ensure all required files are present."
    exit 1
fi

# Stage files for git
echo ""
echo "📝 Staging files for git..."
git add .

# Check git status
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    echo "📊 Files ready to commit:"
    git diff --staged --name-only
    echo ""
    
    read -p "💾 Do you want to commit these changes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git commit -m "feat: add Railway deployment configuration

- Add railway.toml with multi-service configuration
- Add comprehensive deployment guides and checklists  
- Add Dockerfiles for both web and API services
- Add environment variable documentation
- Add deployment scripts and helpers"
        echo "✅ Changes committed successfully!"
    fi
fi

echo ""
echo "🚀 Next Steps:"
echo "=================================="
echo "1. Push to GitHub:"
echo "   git remote add origin https://github.com/yourusername/project-management-saas.git"
echo "   git push -u origin main"
echo ""
echo "2. Create Railway project:"
echo "   - Go to https://railway.app"
echo "   - Create project from GitHub repo"
echo "   - Add PostgreSQL database service"
echo ""
echo "3. Set environment variables:"
echo "   - Use the JWT secrets generated above"
echo "   - Follow the guide in RAILWAY_SETUP.md"
echo ""
echo "4. Deploy database schema:"
echo "   cd packages/database && railway run npx prisma db push"
echo ""
echo "5. Check RAILWAY_CHECKLIST.md for complete deployment verification"
echo ""
echo "📚 Documentation files:"
echo "   - RAILWAY_SETUP.md: Step-by-step setup guide"
echo "   - railway-env.md: Environment variable reference"
echo "   - RAILWAY_CHECKLIST.md: Deployment verification checklist"
echo ""
echo "🎯 Your project is ready for Railway deployment!"