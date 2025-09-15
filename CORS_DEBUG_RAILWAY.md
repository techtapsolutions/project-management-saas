# CORS Debugging Guide for Railway Deployment

## Issue Summary
The CORS error occurs when the browser blocks requests from `https://projectmgmt-web-production.up.railway.app` to `https://projectmgmt-api-production.up.railway.app`.

## Fixes Applied

### 1. Enhanced CORS Configuration (`apps/api/src/index.ts`)
- Added comprehensive CORS options with proper origin validation
- Implemented debug logging for CORS requests
- Added explicit preflight handling
- Configured proper headers and credentials

### 2. CORS Debug Middleware (`apps/api/src/middleware/cors-debug.ts`)
- Created debug middleware to log all CORS-related information
- Added fallback handler for edge cases
- Provides detailed logging for troubleshooting

### 3. Error Handler Updates (`apps/api/src/middleware/error-handler.ts`)
- Ensures CORS headers are preserved even on error responses
- Added specific handling for CORS-related errors
- Logs origin information for debugging

### 4. Test Endpoints (`apps/api/src/routes/cors-test.ts`)
- Added `/api/cors/test` endpoints for debugging
- Created `/api/cors/debug` endpoint to check configuration

## Deployment Steps

### Step 1: Verify Environment Variables in Railway

1. Go to your Railway dashboard
2. Select the API service
3. Go to Variables tab
4. Ensure these variables are set EXACTLY as shown (no trailing slashes):

```env
ALLOWED_ORIGINS=https://projectmgmt-web-production.up.railway.app,https://projectmgmt-api-production.up.railway.app
NODE_ENV=production
PORT=3001
```

**Important**: 
- NO spaces after commas in ALLOWED_ORIGINS
- NO trailing slashes on URLs
- Both frontend and API URLs should be included

### Step 2: Deploy the Updated Code

```bash
# Commit the changes
git add .
git commit -m "Fix CORS configuration for Railway deployment"
git push origin main
```

Railway should automatically deploy the changes.

### Step 3: Test CORS Configuration

After deployment, test these endpoints in order:

#### A. Test Health Endpoint
```bash
curl https://projectmgmt-api-production.up.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T...",
  "cors": {
    "allowedOrigins": ["https://projectmgmt-web-production.up.railway.app", ...],
    "requestOrigin": "no-origin"
  }
}
```

#### B. Test CORS Debug Endpoint
```bash
curl https://projectmgmt-api-production.up.railway.app/api/cors/debug \
  -H "Origin: https://projectmgmt-web-production.up.railway.app"
```

This will show you the current CORS configuration and whether the origin is allowed.

#### C. Test Preflight Request
```bash
curl -X OPTIONS https://projectmgmt-api-production.up.railway.app/api/auth/register \
  -H "Origin: https://projectmgmt-web-production.up.railway.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Look for these headers in the response:
- `Access-Control-Allow-Origin: https://projectmgmt-web-production.up.railway.app`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD`

#### D. Test Actual POST Request
```bash
curl -X POST https://projectmgmt-api-production.up.railway.app/api/cors/test \
  -H "Origin: https://projectmgmt-web-production.up.railway.app" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}' \
  -v
```

### Step 4: Check Railway Logs

In Railway dashboard:
1. Go to your API service
2. Click on "View Logs"
3. Look for lines starting with:
   - `🔧 CORS Configuration:` - Shows startup configuration
   - `🔍 CORS Request:` - Shows incoming requests
   - `✅ CORS allowed for origin:` - Successful CORS validation
   - `❌ CORS blocked for origin:` - Failed CORS validation

### Step 5: Browser Testing

1. Open browser developer tools (F12)
2. Go to Network tab
3. Try to register on your frontend
4. Look for the preflight OPTIONS request
5. Check the response headers

## Debugging Checklist

If CORS still fails, check:

- [ ] Environment variables are set correctly in Railway (no typos, no trailing slashes)
- [ ] API service has redeployed after changes
- [ ] No proxy/CDN is stripping CORS headers (Railway doesn't do this by default)
- [ ] Frontend is using correct API URL (check NEXT_PUBLIC_API_URL)
- [ ] Browser cache is cleared (try incognito mode)
- [ ] No browser extensions are blocking requests

## Advanced Debugging

### Run Debug Script Locally
```bash
cd apps/api
ALLOWED_ORIGINS=https://projectmgmt-web-production.up.railway.app,https://projectmgmt-api-production.up.railway.app npm run debug:cors
```

This will show you exactly how the CORS configuration is being parsed.

### Enable Debug Mode in Production
Add this environment variable in Railway:
```env
DEBUG_CORS=true
```

This will add extra debugging headers to responses:
- `X-CORS-Debug-Origin`
- `X-CORS-Debug-Method`
- `X-CORS-Debug-Allowed`

## Railway-Specific Considerations

1. **Health Checks**: Railway uses `/health` endpoint. Our configuration includes CORS info there.

2. **Environment Variables**: Railway injects variables at runtime. The debug endpoints will show if they're being loaded correctly.

3. **Build Process**: Ensure the build completes successfully. Check Railway logs for any build errors.

4. **Port Configuration**: Railway assigns a PORT automatically. We're reading it from `process.env.PORT`.

## If Everything Else Fails

As a last resort, you can temporarily allow all origins (NOT recommended for production):

```typescript
// In apps/api/src/index.ts
const corsOptions: cors.CorsOptions = {
  origin: true, // Allow all origins
  credentials: true,
  // ... rest of options
}
```

**Important**: This is only for testing. Revert to restricted origins once you identify the issue.

## Support Resources

- Railway Discord: https://discord.gg/railway
- Railway Docs on Environment Variables: https://docs.railway.app/guides/variables
- CORS Specification: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

## Next Steps After Fix

1. Remove debug endpoints (`/api/cors/*`) from production
2. Disable DEBUG_CORS environment variable
3. Consider adding rate limiting to prevent CORS bypass attempts
4. Set up monitoring for CORS errors