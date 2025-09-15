#!/bin/bash

# Railway Service Routing Fix Script
# This script fixes the issue where the API service is serving the Next.js frontend

echo "🔧 Railway Service Routing Fix"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}This script will help you fix the Railway deployment where the API service is serving the frontend.${NC}"
echo ""

# Step 1: Check Railway CLI
echo "📍 Step 1: Checking Railway CLI installation..."
if command -v railway &> /dev/null; then
    echo -e "${GREEN}✓ Railway CLI is installed${NC}"
else
    echo -e "${RED}✗ Railway CLI is not installed${NC}"
    echo "Please install it with: brew install railway"
    exit 1
fi

# Step 2: Login check
echo ""
echo "📍 Step 2: Checking Railway login status..."
if railway whoami &> /dev/null; then
    echo -e "${GREEN}✓ Logged in to Railway${NC}"
else
    echo -e "${YELLOW}Please login to Railway:${NC}"
    railway login
fi

# Step 3: Project selection
echo ""
echo "📍 Step 3: Selecting Railway project..."
echo "Please select your project when prompted:"
railway link

# Step 4: Configure services
echo ""
echo "📍 Step 4: Configuring Railway services..."
echo ""
echo -e "${YELLOW}IMPORTANT: You need to configure TWO separate services in Railway:${NC}"
echo ""
echo "SERVICE 1: API Service"
echo "----------------------"
echo "1. In Railway dashboard, create/select your API service"
echo "2. Go to Settings → Source"
echo "3. Set the following:"
echo "   - Root Directory: apps/api"
echo "   - Config Path: nixpacks.toml (or leave empty to use default)"
echo ""
echo "SERVICE 2: Web Service"
echo "----------------------"
echo "1. In Railway dashboard, create/select your Web service"
echo "2. Go to Settings → Source"
echo "3. Set the following:"
echo "   - Root Directory: apps/web"
echo "   - Config Path: nixpacks.toml (or leave empty to use default)"
echo ""

# Step 5: Environment Variables
echo "📍 Step 5: Setting up environment variables..."
echo ""
echo -e "${YELLOW}For API Service, set these variables in Railway:${NC}"
echo ""
cat << 'EOF'
# Required (replace with your values):
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=<generate with: openssl rand -hex 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -hex 32>
SESSION_SECRET=<generate with: openssl rand -hex 32>
ALLOWED_ORIGINS=https://projectmgmt-web-production.up.railway.app
EMAIL_FROM=noreply@yourapp.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Auto-configured:
NODE_ENV=production
PORT=3001
EOF

echo ""
echo -e "${YELLOW}For Web Service, set these variables:${NC}"
echo ""
cat << 'EOF'
NEXT_PUBLIC_API_URL=https://projectmgmt-api-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://projectmgmt-web-production.up.railway.app
NEXT_PUBLIC_APP_NAME=ProjectMgmt
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
EOF

echo ""
echo "📍 Step 6: Deploy services..."
echo ""
echo -e "${YELLOW}Option A: Deploy via Railway Dashboard${NC}"
echo "1. Go to each service in Railway dashboard"
echo "2. Click 'Deploy' or trigger a redeploy"
echo ""
echo -e "${YELLOW}Option B: Deploy via CLI${NC}"
echo "For API service:"
echo "  railway up --service api"
echo ""
echo "For Web service:"
echo "  railway up --service web"
echo ""

# Step 7: Verify deployment
echo "📍 Step 7: Verification checklist..."
echo ""
echo "After deployment, verify:"
echo "[ ] API health check works: curl https://your-api-url.railway.app/health"
echo "[ ] API returns JSON, not HTML"
echo "[ ] Web app loads without CORS errors"
echo "[ ] Registration/login functionality works"
echo ""

echo -e "${GREEN}✅ Configuration complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update the environment variables in Railway dashboard"
echo "2. Ensure both services have different domains"
echo "3. Redeploy both services"
echo "4. Test the /health endpoint on your API service"
echo ""
echo "If the API is still serving the frontend after following these steps:"
echo "1. Check that 'Root Directory' is set correctly for each service"
echo "2. Ensure no railway.toml exists in the root (we've backed it up)"
echo "3. Force a clean rebuild by clicking 'Clear Build Cache' in Railway settings"