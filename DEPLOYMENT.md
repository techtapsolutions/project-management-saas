# 🚀 Deployment Guide

This guide covers multiple deployment options for your project management SaaS application.

## 🎯 **Quick Deployment Options**

### **Option 1: Docker Compose (Recommended for Testing)**

**Perfect for: Local testing, development, small teams**

1. **Prerequisites**: Docker and Docker Compose installed

2. **Set up environment variables**:
   ```bash
   echo "DB_PASSWORD=your_secure_password_here" > .env
   echo "JWT_SECRET=your_super_secret_jwt_key_here" >> .env
   echo "JWT_REFRESH_SECRET=your_super_secret_refresh_key_here" >> .env
   ```

3. **Deploy with one command**:
   ```bash
   docker-compose up --build -d
   ```

4. **Access your app**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Database: localhost:5432

### **Option 2: Vercel + PlanetScale (Recommended for Production)**

**Perfect for: Production use, automatic scaling, global CDN**

#### Step 1: Database Setup (PlanetScale)
1. Sign up at [PlanetScale](https://planetscale.com)
2. Create a new database called `projectmgmt`
3. Get your connection string

#### Step 2: Frontend Deployment (Vercel)
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app
   ```

#### Step 3: Backend Deployment (Vercel)
1. Deploy the API as a separate Vercel project
2. Set environment variables:
   ```
   DATABASE_URL=your_planetscale_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   ```

### **Option 3: Railway (Easiest All-in-One)**

**Perfect for: Quick deployment, automatic database setup**

1. Push your code to GitHub
2. Go to [Railway](https://railway.app) and connect your repository
3. Railway will automatically:
   - Set up PostgreSQL database
   - Build and deploy your apps
   - Provide public URLs

## 🏗️ **Manual Cloud Deployment**

### **AWS Deployment**

#### Prerequisites
- AWS CLI configured
- Docker installed

#### Database Setup (RDS)
```bash
# Create PostgreSQL RDS instance
aws rds create-db-instance \
  --db-instance-identifier projectmgmt-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username projectmgmt \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

#### Container Deployment (ECS)
```bash
# Build and push to ECR
aws ecr create-repository --repository-name projectmgmt-api
docker build -t projectmgmt-api apps/api/
docker tag projectmgmt-api:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/projectmgmt-api:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/projectmgmt-api:latest
```

### **Google Cloud Platform**

#### Database Setup (Cloud SQL)
```bash
gcloud sql instances create projectmgmt-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1
```

#### App Deployment (Cloud Run)
```bash
# Deploy API
gcloud run deploy projectmgmt-api \
  --image gcr.io/PROJECT_ID/projectmgmt-api \
  --platform managed \
  --region us-central1

# Deploy Frontend
gcloud run deploy projectmgmt-web \
  --image gcr.io/PROJECT_ID/projectmgmt-web \
  --platform managed \
  --region us-central1
```

## 🔧 **Environment Variables Reference**

### Backend API (.env)
```env
# Required
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=different-super-secret-refresh-key-minimum-32-characters

# Optional
NODE_ENV=production
PORT=3001
REDIS_URL=redis://localhost:6379
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend Web (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=ProjectMgmt
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📊 **Post-Deployment Setup**

### 1. Database Migration
```bash
# Run this after first deployment
npm run db:migrate
```

### 2. Create First Admin User
Visit your deployed app and register - the first user becomes an organization admin.

### 3. Configure Email (Optional)
Set up SMTP credentials in your environment variables for:
- Password reset emails
- User invitations
- Notification emails

## 🔒 **Security Checklist**

### Production Deployment Must-Haves:
- [ ] Strong JWT secrets (32+ characters)
- [ ] HTTPS enabled (SSL certificate)
- [ ] Database connection over SSL
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Regular backups configured

### Recommended Security Additions:
- [ ] Web Application Firewall (WAF)
- [ ] DDoS protection
- [ ] Security headers (Helmet.js configured)
- [ ] Regular security scans
- [ ] Monitor for vulnerabilities

## 📈 **Scaling Considerations**

### When you need to scale:

1. **Database Scaling**:
   - Read replicas for read-heavy workloads
   - Connection pooling (PgBouncer)
   - Database sharding for large datasets

2. **Application Scaling**:
   - Horizontal pod autoscaling
   - Load balancers
   - Redis for session storage
   - CDN for static assets

3. **Monitoring & Observability**:
   - Application performance monitoring (APM)
   - Log aggregation
   - Error tracking (Sentry)
   - Uptime monitoring

## 🆘 **Troubleshooting**

### Common Issues:

1. **Database Connection Fails**:
   ```bash
   # Test connection
   psql $DATABASE_URL -c "SELECT version();"
   ```

2. **JWT Issues**:
   - Ensure secrets are at least 32 characters
   - Check secret consistency across deployments

3. **CORS Errors**:
   - Verify ALLOWED_ORIGINS includes your frontend domain
   - Check protocol (http vs https)

4. **Build Failures**:
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build
   ```

## 🎯 **Quick Start Commands**

### Local Development
```bash
npm run setup
npm run dev
```

### Docker Deployment
```bash
docker-compose up --build -d
```

### Production Build Test
```bash
npm run build
npm run db:migrate
```

## 📞 **Support & Monitoring**

### Health Check Endpoints:
- API: `GET /health`
- Frontend: Available at root URL

### Monitoring Setup:
Consider setting up:
- Uptime monitoring (UptimeRobot, Pingdom)
- Error tracking (Sentry)
- Performance monitoring (DataDog, New Relic)
- Log aggregation (LogRocket, Papertrail)

---

**Need help with deployment?** 
- Check the logs: `docker-compose logs -f`
- Verify environment variables are set correctly
- Test database connectivity first
- Ensure all required ports are open