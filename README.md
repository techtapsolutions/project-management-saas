# 🚀 Project Management SaaS

> A modern project management application similar to Smartsheet, built with Next.js, Express.js, and PostgreSQL.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/5xxFru?referralCode=alpaca)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/project-management-saas)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## ✨ Features

### 🏢 **Multi-Tenant Architecture**
- Organization-based workspaces
- Role-based access control (RBAC)
- User management and invitations
- SSO integration support

### 📊 **Project Management**
- Create and manage projects
- Hierarchical task system with subtasks
- Task assignments and dependencies
- Progress tracking and analytics

### 📋 **Interactive Kanban Boards**
- Drag-and-drop task management
- Custom columns and workflows
- Real-time collaboration
- Advanced filtering and search

### 📈 **Analytics Dashboard**
- Project overview widgets
- Team performance metrics
- Upcoming deadlines tracking
- Real-time activity feeds

### 🔒 **Enterprise Security**
- JWT authentication with refresh tokens
- Granular permissions system
- Audit logging
- Rate limiting and security headers

### 🎨 **Modern UI/UX**
- Responsive design
- Dark mode support
- Accessible components
- Professional interface

## 🚀 **Quick Deploy (2 minutes)**

### **Option 1: Railway (Easiest)**
1. Click: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/5xxFru?referralCode=alpaca)
2. Connect GitHub account
3. Deploy automatically with database included
4. **Cost:** $5/month (includes $5 free credit)

### **Option 2: Vercel + Supabase (FREE)**
1. **Database:** Create account at [supabase.com](https://supabase.com)
2. **Frontend:** [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/project-management-saas)
3. **Backend:** Deploy API separately to Vercel
4. **Cost:** Completely FREE

### **Option 3: Local Docker**
```bash
git clone [your-repo-url]
cd project-management-saas
echo "DB_PASSWORD=password123" > .env
echo "JWT_SECRET=your-32-character-secret-key" >> .env
echo "JWT_REFRESH_SECRET=different-32-character-key" >> .env
docker-compose up --build -d
```

## 💻 **Local Development**

### **Prerequisites**
- Node.js 18+
- PostgreSQL 14+
- npm/yarn

### **Setup**
```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Set up database
npm run db:generate
npm run db:push

# Start development servers
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Database: localhost:5432

## 🏗️ **Architecture**

```
├── apps/
│   ├── web/              # Next.js 14 frontend
│   └── api/              # Express.js backend
├── packages/
│   ├── ui/               # Shared UI components
│   ├── shared/           # Common utilities
│   └── database/         # Prisma schema
```

### **Tech Stack**
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Express.js, TypeScript, Prisma ORM
- **Database:** PostgreSQL
- **Authentication:** JWT with refresh tokens
- **UI:** Custom component library with Radix UI
- **Deployment:** Docker, Vercel, Railway, Render

## 📚 **Documentation**

- [📖 Setup Guide](./SETUP.md) - Detailed setup instructions
- [🚀 Deployment Guide](./DEPLOYMENT.md) - All deployment options
- [💰 Cheap Deployment](./CHEAP_DEPLOYMENT.md) - FREE deployment options
- [⚡ One-Click Deploy](./ONE_CLICK_DEPLOY.md) - Instant deployment buttons

## 🎯 **Core Features Implemented**

### ✅ **Authentication & Users**
- User registration and login
- JWT authentication with refresh tokens
- Role-based access control
- Organization management
- User invitations

### ✅ **Project Management**
- Project CRUD operations
- Team member management
- Project progress tracking
- File uploads and sharing

### ✅ **Task Management**
- Create, assign, and track tasks
- Hierarchical task structure
- Task dependencies
- Comments and collaboration
- Time tracking support

### ✅ **Kanban Boards**
- Drag-and-drop functionality
- Custom columns
- Task filtering and search
- Real-time updates

### ✅ **Interactive Dashboard**
- Project overview widgets
- Task statistics
- Team performance charts
- Activity feeds
- Deadline tracking

### 🚧 **Coming Soon**
- Gantt charts with timeline view
- Advanced notifications (email, Slack)
- Calendar integration
- Mobile app
- Advanced reporting

## 🔧 **API Endpoints**

### **Authentication**
```
POST /api/auth/register     # Register user
POST /api/auth/login        # Login user
POST /api/auth/refresh      # Refresh token
POST /api/auth/logout       # Logout user
```

### **Projects**
```
GET    /api/projects        # List projects
POST   /api/projects        # Create project
GET    /api/projects/:id    # Get project
PUT    /api/projects/:id    # Update project
DELETE /api/projects/:id    # Delete project
```

### **Tasks**
```
GET    /api/tasks           # List tasks
POST   /api/tasks           # Create task
GET    /api/tasks/:id       # Get task
PUT    /api/tasks/:id       # Update task
DELETE /api/tasks/:id       # Delete task
```

## 🔒 **Security Features**

- ✅ JWT authentication with secure refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Zod schemas
- ✅ SQL injection protection (Prisma ORM)
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Security headers (Helmet.js)
- ✅ Password hashing with bcrypt
- ✅ Audit logging

## 📊 **Database Schema**

The application uses a comprehensive PostgreSQL schema supporting:
- Multi-tenant organizations
- User management with RBAC
- Projects and hierarchical tasks
- File management
- Comments and collaboration
- Time tracking
- Audit logging

See [`packages/database/prisma/schema.prisma`](packages/database/prisma/schema.prisma) for the complete schema.

## 🎨 **UI Components**

Built with a custom component library featuring:
- **Design System:** Consistent styling with Tailwind CSS
- **Accessibility:** WCAG compliant components
- **Dark Mode:** System preference detection
- **Responsive:** Mobile-first design
- **Icons:** Lucide React icons
- **Animations:** Smooth transitions and micro-interactions

## 🚀 **Performance**

- **Optimized Bundle:** Code splitting and tree shaking
- **Database:** Efficient queries with Prisma
- **Caching:** Redis support for sessions and caching
- **CDN:** Global content delivery via Vercel/Railway
- **Images:** Automatic optimization and WebP conversion

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ **Support**

- 📖 Check the [documentation](./docs/)
- 🐛 [Report bugs](../../issues)
- 💬 [Start a discussion](../../discussions)
- 📧 Email: support@yourproject.com

## 🌟 **Roadmap**

### **Phase 1: Core Features** ✅
- [x] Authentication and RBAC
- [x] Project and task management
- [x] Kanban boards
- [x] Interactive dashboard

### **Phase 2: Advanced Features** 🚧
- [ ] Gantt charts
- [ ] Advanced notifications
- [ ] Calendar integration
- [ ] Time tracking UI

### **Phase 3: Integrations** 📋
- [ ] Slack integration
- [ ] Email notifications
- [ ] GitHub integration
- [ ] API webhooks

### **Phase 4: Mobile & Enterprise** 🔮
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Custom integrations
- [ ] Enterprise SSO

---

**Ready to deploy your own project management platform?**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/5xxFru?referralCode=alpaca)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/project-management-saas)