# Railway Deployment Fix Guide

## Issues Fixed

1. ✅ **CORS Error**: Updated API to allow Railway frontend domain
2. ✅ **Wrong API URL**: Created production environment files pointing to Railway API
3. ✅ **Missing Pages**: Created `/forgot-password`, `/terms`, and `/privacy` pages
4. ✅ **Environment Configuration**: Created proper production environment files

## Files Created/Modified

### Created Files:
- `apps/api/.env.production` - API production environment template
- `apps/web/.env.production` - Web app production environment  
- `railway-env.toml` - Railway-specific environment configuration
- `apps/web/src/app/auth/forgot-password/page.tsx` - Forgot password page
- `apps/web/src/app/terms/page.tsx` - Terms of service page
- `apps/web/src/app/privacy/page.tsx` - Privacy policy page

### Modified Files:
- `apps/api/src/index.ts` - Enhanced CORS configuration to properly handle multiple origins

## Railway Environment Variables to Set

### For API Service (projectmgmt-api)

**Required Variables:**
```bash
# Database (auto-provided by Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (auto-provided by Railway Redis if you add it)
REDIS_URL=${{Redis.REDIS_URL}}

# JWT Secrets (generate these)
JWT_SECRET=<generate with: openssl rand -hex 32>
JWT_REFRESH_SECRET=<generate with: openssl rand -hex 32>
SESSION_SECRET=<generate with: openssl rand -hex 32>

# CORS Configuration
ALLOWED_ORIGINS=https://projectmgmt-web-production.up.railway.app,https://projectmgmt-api-production.up.railway.app

# Email Configuration (use your SMTP provider)
EMAIL_FROM=noreply@yourapp.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**Optional Variables:**
```bash
# Already set in code/config
NODE_ENV=production
PORT=3001
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=info
LOG_FORMAT=combined
BCRYPT_ROUNDS=12
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
```

### For Web Service (projectmgmt-web)

**Required Variables:**
```bash
# API URL - Update this with your actual Railway API service URL
NEXT_PUBLIC_API_URL=https://projectmgmt-api-production.up.railway.app

# App URL - This should match your Railway web service URL
NEXT_PUBLIC_APP_URL=https://projectmgmt-web-production.up.railway.app

# App Name
NEXT_PUBLIC_APP_NAME=ProjectMgmt

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

## Deployment Steps

### 1. Generate Secrets
```bash
# Generate JWT secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For JWT_REFRESH_SECRET  
openssl rand -hex 32  # For SESSION_SECRET
```

### 2. Update Railway Services

#### API Service:
1. Go to your Railway project dashboard
2. Click on the API service
3. Go to "Variables" tab
4. Add all required environment variables listed above
5. Make sure to replace placeholder values with actual values

#### Web Service:
1. Click on the Web service
2. Go to "Variables" tab
3. Add the web environment variables
4. **IMPORTANT**: Update `NEXT_PUBLIC_API_URL` with your actual Railway API service URL
   - You can find this in your API service settings under "Domains"
   - It should look like: `https://your-api-service.up.railway.app`

### 3. Get Actual Railway URLs

Your Railway services will have auto-generated URLs. You need to:

1. **Find your API URL**:
   - Go to API service → Settings → Domains
   - Copy the generated URL (e.g., `https://projectmgmt-api-xxxxx.up.railway.app`)

2. **Find your Web URL**:
   - Go to Web service → Settings → Domains
   - Copy the generated URL (e.g., `https://projectmgmt-web-xxxxx.up.railway.app`)

3. **Update Environment Variables**:
   - In API service, update `ALLOWED_ORIGINS` to include both URLs
   - In Web service, update `NEXT_PUBLIC_API_URL` to point to your API URL
   - In Web service, update `NEXT_PUBLIC_APP_URL` to your Web URL

### 4. Database Setup

If you haven't already:
1. Add a PostgreSQL database to your Railway project
2. The `DATABASE_URL` will be automatically available to your services
3. Run database migrations:
   ```bash
   railway run --service=api npm run db:push
   ```

### 5. Redis Setup (Optional but Recommended)

1. Add a Redis database to your Railway project
2. The `REDIS_URL` will be automatically available

### 6. Redeploy Services

After setting all environment variables:
1. Trigger a redeploy of both services
2. Monitor the deployment logs for any errors
3. Once deployed, test the registration flow

## Testing the Fix

1. **Visit your web app**: `https://your-web-service.up.railway.app`
2. **Try to register**: Click on Register and create a new account
3. **Check for CORS errors**: Open browser console (F12) and look for any CORS errors
4. **Verify API calls**: Network tab should show successful API calls to your Railway API

## Troubleshooting

### If CORS errors persist:

1. **Verify environment variables are set**:
   ```bash
   railway variables --service=api
   ```

2. **Check that ALLOWED_ORIGINS includes your frontend URL**:
   - Must include the full URL with https://
   - No trailing slashes
   - Multiple origins separated by commas

3. **Ensure API is using the updated code**:
   - The API should be using the enhanced CORS configuration
   - Redeploy if necessary

### If API calls fail:

1. **Verify NEXT_PUBLIC_API_URL**:
   - Must point to your Railway API service
   - Not to Render or localhost
   - Include https:// but no trailing slash

2. **Check API service is running**:
   - View API service logs in Railway dashboard
   - Ensure it's listening on the correct port

### If registration still fails:

1. **Check database connection**:
   - Ensure PostgreSQL is provisioned
   - DATABASE_URL is correctly set
   - Database migrations have been run

2. **Verify JWT secrets are set**:
   - All three secrets must be present
   - They should be long, random strings

## Success Indicators

✅ No CORS errors in browser console
✅ Registration form submits successfully
✅ User can create account and login
✅ No 404 errors for /forgot-password or /terms
✅ API responds to health check at /health

## Next Steps

After successful deployment:
1. Set up email provider for password reset functionality
2. Configure custom domain if desired
3. Set up monitoring and error tracking
4. Enable SSL certificate (Railway provides this automatically)
5. Configure backup strategy for database

## Support

If issues persist after following this guide:
1. Check Railway deployment logs for both services
2. Verify all environment variables are correctly set
3. Ensure the latest code is deployed (force redeploy if needed)
4. Check browser console and network tab for specific error messages