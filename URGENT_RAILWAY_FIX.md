# 🚨 URGENT RAILWAY FIX - Manual Configuration Required

## Current Issues:
1. ❌ API service config error: `deploy.restartPolicyType: Invalid input`
2. ❌ Web service can't find `@projectmgmt/shared` package
3. ❌ Both services serving frontend instead of proper applications

## 🔧 **IMMEDIATE FIX - Railway Dashboard Configuration**

### **Step 1: API Service Configuration**

**Go to Railway Dashboard → API Service → Settings → Source:**

1. **Root Directory**: Leave **EMPTY** (not `apps/api`)
2. **Config Path**: `apps/api/nixpacks.toml`
3. **Delete ALL environment variables** temporarily
4. **Redeploy**

### **Step 2: Web Service Configuration**

**Go to Railway Dashboard → Web Service → Settings → Source:**

1. **Root Directory**: Leave **EMPTY** (not `apps/web`) 
2. **Config Path**: `apps/web/nixpacks.toml`
3. **Delete ALL environment variables** temporarily
4. **Redeploy**

### **Step 3: Wait for Clean Deploy**

Let both services deploy without any environment variables first. This will:
- Use the nixpacks.toml configurations properly
- Build from the monorepo root (fixing package dependencies)
- Deploy the correct applications

### **Step 4: Add Environment Variables Back**

**Only AFTER both services deploy successfully, add back:**

**API Service Variables:**
```bash
DATABASE_URL=postgresql://postgres:TzQvaYFJAYJAcoQBvuZJeqrvJTjRIaIh@interchange.proxy.rlwy.net:14649/railway
JWT_SECRET=ada81d8f4a173decb6c2619bb571c05e6659c0fb2d4f270db098ad2a71c7f37a
JWT_REFRESH_SECRET=ba5e9d3cf090649842b50303b4f2f99205f2508491b0f2a8682186e52fcded95
SESSION_SECRET=37b6ac8d9ff9eaed1a9089b5cf6e195da39e0032232ac0846eb4a9fc9b20869d
ALLOWED_ORIGINS=https://projectmgmt-web-production.up.railway.app
EMAIL_FROM=noreply@projectmgmt.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
REDIS_URL=redis://localhost:6379
```

**Web Service Variables:**
```bash
NEXT_PUBLIC_API_URL=https://projectmgmt-api-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://projectmgmt-web-production.up.railway.app
NEXT_PUBLIC_APP_NAME=ProjectMgmt
```

## 🎯 **Why This Will Work:**

1. **Empty Root Directory** = Railway builds from repository root
2. **nixpacks.toml Config Path** = Uses our monorepo-aware build configs
3. **Clean deployment first** = No config conflicts
4. **Environment variables after** = Apps can start properly

## ✅ **Success Indicators:**

After Step 3, you should see:
- ✅ API health endpoint returns JSON: `curl https://projectmgmt-api-production.up.railway.app/health`
- ✅ Web service loads properly (no 404s)
- ✅ No more "package not found" errors in logs

**DO THIS NOW** - The current configuration is cached and needs to be cleared by following these exact steps.