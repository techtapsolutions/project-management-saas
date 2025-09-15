# 🚨 CRITICAL FIX: Railway API Service Routing Issue

## Problem Summary
The Railway API service URL (`https://projectmgmt-api-production.up.railway.app`) is incorrectly serving the Next.js frontend instead of the Express.js API, causing all API calls to fail with 404 errors.

## Root Cause
**Conflicting Railway configuration files** at the root level are overriding service-specific configurations, causing both services to deploy the same application (the web frontend).

### Problematic Files (Now Backed Up)
- `/railway.toml` - Was pointing to web app build/start commands
- `/railway.json` - Had generic dev commands
- `/railway-docker.toml` - Was pointing to web Dockerfile

## ✅ Solution Applied

### 1. Configuration Files Created/Modified

#### Created Service-Specific Configurations:
- `/railway-api.toml` - API-specific Railway config
- `/railway-web.toml` - Web-specific Railway config
- `/apps/api/nixpacks.toml` - API build configuration
- `/railway.json` - Proper multi-service configuration

#### Backed Up Conflicting Files:
- `railway.toml` → `railway.toml.backup`
- `railway.json` → `railway.json.backup` (before recreation)
- `railway-docker.toml` → `railway-docker.toml.backup`

### 2. Railway Dashboard Configuration Required

You MUST configure the following in your Railway dashboard:

#### **API Service Configuration:**
1. Go to your API service in Railway
2. Navigate to **Settings → Source**
3. Configure:
   - **Root Directory**: `apps/api`
   - **Config Path**: Leave empty (will use nixpacks.toml)
4. Go to **Variables** tab and add:

```bash
# Database (auto-linked if you have Railway PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (auto-linked if you have Railway Redis)
REDIS_URL=${{Redis.REDIS_URL}}

# Security (REQUIRED - Generate these!)
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# CORS - Update with your actual Railway web URL
ALLOWED_ORIGINS=https://projectmgmt-web-production.up.railway.app

# Email (Required for registration)
EMAIL_FROM=noreply@yourapp.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Port
PORT=3001
NODE_ENV=production
```

#### **Web Service Configuration:**
1. Go to your Web service in Railway
2. Navigate to **Settings → Source**
3. Configure:
   - **Root Directory**: `apps/web`
   - **Config Path**: Leave empty (will use nixpacks.toml)
4. Go to **Variables** tab and add:

```bash
# Update with your actual Railway API URL!
NEXT_PUBLIC_API_URL=https://projectmgmt-api-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://projectmgmt-web-production.up.railway.app
NEXT_PUBLIC_APP_NAME=ProjectMgmt
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
PORT=3000
NODE_ENV=production
```

## 🚀 Deployment Steps

### Option 1: Via Railway Dashboard (Recommended)
1. Go to each service in Railway dashboard
2. Click **"Redeploy"** or trigger a new deployment
3. Monitor deployment logs for any errors

### Option 2: Via Railway CLI
```bash
# Link to your project
railway link

# Deploy API service
railway up --service api

# Deploy Web service  
railway up --service web
```

### Option 3: Force Clean Rebuild
If services are still mixed up:
1. Go to each service → Settings
2. Click **"Clear Build Cache"**
3. Trigger a redeploy

## 🧪 Verification Steps

### 1. Test API Health Endpoint
```bash
# Should return JSON, not HTML
curl https://projectmgmt-api-production.up.railway.app/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-09-15T...",
  "cors": {
    "allowedOrigins": [...],
    "requestOrigin": "..."
  }
}
```

### 2. Check API Root
```bash
# Should return API info, not Next.js 404
curl https://projectmgmt-api-production.up.railway.app/

# Expected response:
{
  "message": "ProjectMgmt API",
  "status": "ok",
  "endpoints": {...}
}
```

### 3. Verify in Browser Console
1. Open https://projectmgmt-web-production.up.railway.app
2. Open DevTools (F12) → Network tab
3. Try to register/login
4. API calls should succeed without CORS errors

## 🔍 Troubleshooting

### If API Still Shows Frontend:

1. **Verify Root Directory Setting**
   - Must be `apps/api` for API service
   - Must be `apps/web` for Web service
   - This is CRITICAL - Railway uses this to determine what to build

2. **Check Build Logs**
   ```bash
   # In Railway dashboard, check deployment logs
   # API logs should show: "Building entry: src/index.ts"
   # Web logs should show: "Creating an optimized production build..."
   ```

3. **Ensure Separate Domains**
   - API and Web MUST have different Railway domains
   - Check Settings → Domains for each service

4. **Clear and Rebuild**
   - Settings → Clear Build Cache
   - Then redeploy

### If CORS Errors Persist:

1. **Update ALLOWED_ORIGINS in API service**
   - Must include full Web service URL
   - No trailing slashes
   - Comma-separated for multiple origins

2. **Verify Environment Variables**
   ```bash
   railway variables --service api
   ```

### If Build Fails:

1. **Check Node Version**
   - Both services require Node 18+
   - Specified in nixpacks.toml

2. **Database Connection**
   - Ensure PostgreSQL is provisioned
   - DATABASE_URL is set correctly

## 📋 Quick Checklist

- [ ] Root directories set correctly in Railway dashboard
- [ ] Environment variables configured for both services
- [ ] Old railway.toml files backed up/removed
- [ ] Services have different domains
- [ ] Build cache cleared if needed
- [ ] Services redeployed after changes
- [ ] API /health endpoint returns JSON
- [ ] No CORS errors in browser console
- [ ] Registration/login working

## 🛠 File Structure

```
project-management-saas/
├── apps/
│   ├── api/
│   │   ├── nixpacks.toml      # API build config
│   │   ├── railway.json       # API service config
│   │   └── src/
│   └── web/
│       ├── nixpacks.toml      # Web build config
│       └── src/
├── railway.json               # Multi-service config
├── railway-api.toml          # API-specific config
├── railway-web.toml          # Web-specific config
└── *.backup                  # Backed up conflicting files
```

## 💡 Key Insights

1. **Railway prioritizes root configuration** over service-specific configs
2. **Root Directory setting is crucial** for monorepo deployments
3. **Each service needs its own domain** in Railway
4. **Clear build cache** helps resolve persistent routing issues
5. **Environment variables** must be set per service, not globally

## 📞 Support

If issues persist after following this guide:
1. Check Railway status page for outages
2. Review deployment logs for both services
3. Verify all environment variables are set
4. Ensure latest code is pushed to repository
5. Contact Railway support with service IDs and error logs

---

**Last Updated**: 2025-09-15
**Issue Status**: FIXED (pending deployment)
**Critical Files**: All configuration files have been updated and conflicting files backed up