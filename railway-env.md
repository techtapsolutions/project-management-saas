# Railway Environment Variables Configuration

## Required Environment Variables for Railway Deployment

### 🔧 API Service Environment Variables

Add these to your Railway API service:

```bash
# Environment
NODE_ENV=production
PORT=3001

# Database (Railway auto-generates DATABASE_URL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secrets (generate with commands below)
JWT_SECRET=your-generated-jwt-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=${{web.url}}

# Optional: Email Configuration
EMAIL_FROM=noreply@yourapp.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 🌐 Web Service Environment Variables

Add these to your Railway Web service:

```bash
# Environment
NODE_ENV=production

# API Configuration
NEXT_PUBLIC_API_URL=${{api.url}}

# App Configuration
NEXT_PUBLIC_APP_NAME=ProjectMgmt
NEXT_PUBLIC_APP_URL=${{web.url}}

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

## 🔑 Generate JWT Secrets

Run these commands in your terminal to generate secure secrets:

```bash
# Generate JWT Secret (copy the output)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate Refresh Secret (copy the output) 
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate Session Secret (copy the output)
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Railway Service References

Railway provides these automatic variables you can reference:

- `${{Postgres.DATABASE_URL}}` - Auto-generated PostgreSQL connection string
- `${{api.url}}` - Auto-generated API service URL
- `${{web.url}}` - Auto-generated Web service URL

## 📝 Quick Setup Steps

1. **Add Database**: Railway will auto-detect and create PostgreSQL
2. **Set API Variables**: Copy the API environment variables above
3. **Set Web Variables**: Copy the Web environment variables above  
4. **Generate Secrets**: Run the JWT generation commands
5. **Deploy**: Railway will handle the rest!

## 🔧 Service Configuration

Railway will automatically:
- Create PostgreSQL database with backups
- Generate DATABASE_URL
- Provide HTTPS URLs for both services
- Handle service-to-service communication
- Set up proper networking between web and API

Your app will be available at:
- **Frontend**: `https://web-production-xxxx.up.railway.app`
- **Backend**: `https://api-production-xxxx.up.railway.app`