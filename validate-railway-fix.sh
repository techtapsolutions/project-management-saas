#!/bin/bash

# Railway Service Validation Script
# This script validates that the Railway services are correctly configured

echo "🔍 Railway Service Validation"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get URLs from user or use defaults
read -p "Enter your API service URL (or press Enter for default): " API_URL
API_URL=${API_URL:-https://projectmgmt-api-production.up.railway.app}

read -p "Enter your Web service URL (or press Enter for default): " WEB_URL
WEB_URL=${WEB_URL:-https://projectmgmt-web-production.up.railway.app}

echo ""
echo "Testing configuration:"
echo "API URL: $API_URL"
echo "Web URL: $WEB_URL"
echo ""

# Test 1: API Health Check
echo "📍 Test 1: API Health Check"
echo "Testing: $API_URL/health"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/health" 2>/dev/null)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q '"status".*"ok"'; then
        echo -e "${GREEN}✓ Health check returns valid JSON${NC}"
    else
        echo -e "${RED}✗ Health check returned HTML instead of JSON${NC}"
        echo "This means the API service is serving the frontend!"
        echo "Response preview:"
        echo "$BODY" | head -5
    fi
else
    echo -e "${RED}✗ Health check failed with HTTP $HTTP_CODE${NC}"
fi

echo ""

# Test 2: API Root Endpoint
echo "📍 Test 2: API Root Endpoint"
echo "Testing: $API_URL/"
ROOT_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$API_URL/" 2>/dev/null)
HTTP_CODE=$(echo "$ROOT_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$ROOT_RESPONSE" | grep -v "HTTP_CODE:")

if [ "$HTTP_CODE" = "200" ]; then
    if echo "$BODY" | grep -q '"message".*"ProjectMgmt API"'; then
        echo -e "${GREEN}✓ API root returns correct response${NC}"
    else
        echo -e "${RED}✗ API root is not returning API response${NC}"
    fi
else
    echo -e "${RED}✗ API root failed with HTTP $HTTP_CODE${NC}"
fi

echo ""

# Test 3: Check for Next.js on API
echo "📍 Test 3: Checking if API is serving Next.js"
if curl -s "$API_URL/" | grep -q "_next\|Next.js\|__NEXT_DATA__"; then
    echo -e "${RED}✗ CRITICAL: API service is serving Next.js frontend!${NC}"
    echo "The services are not properly separated."
else
    echo -e "${GREEN}✓ API is not serving Next.js${NC}"
fi

echo ""

# Test 4: Web App Check
echo "📍 Test 4: Web Application Check"
echo "Testing: $WEB_URL/"
WEB_RESPONSE=$(curl -s -I "$WEB_URL/" 2>/dev/null | head -1)
if echo "$WEB_RESPONSE" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Web application is accessible${NC}"
else
    echo -e "${RED}✗ Web application returned: $WEB_RESPONSE${NC}"
fi

echo ""

# Test 5: CORS Preflight
echo "📍 Test 5: CORS Preflight Check"
echo "Testing CORS from Web to API..."
CORS_RESPONSE=$(curl -s -X OPTIONS \
    -H "Origin: $WEB_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -I "$API_URL/api/auth/login" 2>/dev/null)

if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
    echo -e "${GREEN}✓ CORS headers are present${NC}"
    echo "$CORS_RESPONSE" | grep -i "access-control" | head -3
else
    echo -e "${YELLOW}⚠ CORS headers might not be configured${NC}"
fi

echo ""
echo "=================================="
echo "📊 Validation Summary"
echo "=================================="
echo ""

# Summary
if curl -s "$API_URL/health" | grep -q '"status".*"ok"' && \
   ! curl -s "$API_URL/" | grep -q "_next"; then
    echo -e "${GREEN}✅ SUCCESS: Services are properly separated!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update environment variables in Railway dashboard"
    echo "2. Test registration/login functionality"
    echo "3. Monitor for any CORS errors"
else
    echo -e "${RED}❌ FAILURE: Services are not properly configured${NC}"
    echo ""
    echo "Required actions:"
    echo "1. Check 'Root Directory' setting in Railway dashboard"
    echo "   - API service: apps/api"
    echo "   - Web service: apps/web"
    echo "2. Clear build cache for both services"
    echo "3. Redeploy both services"
    echo "4. Ensure railway.toml is not in root directory"
fi

echo ""
echo "For detailed instructions, see RAILWAY_SERVICE_ROUTING_FIX.md"