# Project Management SaaS - Setup Guide

This guide will help you set up and run your project management SaaS application similar to Smartsheet.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 14+
- Redis 6+ (optional for caching and sessions)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

#### Backend API (.env in apps/api/)
```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/projectmgmt_dev?schema=public"

# JWT Secrets (generate strong secrets)
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# Email (optional for now)
EMAIL_FROM="noreply@yourapp.com"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

#### Frontend Web App (.env.local in apps/web/)
```bash
cd apps/web
cp .env.example .env.local
```

Edit `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="ProjectMgmt"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up Database

#### Create PostgreSQL Database
```bash
createdb projectmgmt_dev
```

#### Generate Prisma Client and Push Schema
```bash
npm run db:generate
npm run db:push
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts:
- Frontend at http://localhost:3000
- Backend API at http://localhost:3001

## 🏗️ Project Structure

```
project-management-saas/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   └── api/              # Express.js backend (port 3001)
├── packages/
│   ├── ui/               # Shared UI components
│   ├── shared/           # Common types and utilities
│   └── database/         # Prisma schema and client
├── infrastructure/       # Docker and deployment configs
└── docs/                # Documentation
```

## 🎯 Features Implemented

### ✅ Core Foundation
- **Multi-tenant Architecture**: Organization-based data isolation
- **Authentication**: JWT with refresh tokens and RBAC
- **Database Schema**: Comprehensive PostgreSQL schema with Prisma
- **API**: RESTful endpoints with validation and error handling

### ✅ User & Organization Management
- **User Registration/Login**: Secure authentication with role-based access
- **Organizations**: Multi-tenant workspaces with member management
- **Roles & Permissions**: Granular permission system (Admin, Manager, Member, Viewer)

### ✅ Project Management
- **Projects**: Create, update, manage projects with status tracking
- **Tasks**: Hierarchical task system with assignments and dependencies
- **Comments**: Real-time collaboration with comment threads
- **File Management**: Secure file uploads and sharing

### ✅ Interactive Dashboard
- **Widgets**: Projects overview, task statistics, team performance
- **Charts**: Visual representations with Recharts
- **Real-time Updates**: Live activity feeds and progress tracking

### ✅ Kanban Boards
- **Drag & Drop**: Full drag-and-drop functionality with @dnd-kit
- **Custom Columns**: Create and manage board columns
- **Task Cards**: Rich task cards with priority, due dates, assignees
- **Filters**: Search and filter tasks by various criteria

### 🚧 In Development
- **Gantt Charts**: Timeline visualization with dependencies
- **Notifications**: Email, Slack, and in-app notification system
- **Advanced Analytics**: Detailed reporting and insights

### 📋 Roadmap Features
- **Calendar Integration**: Meeting scheduling and milestone tracking
- **Time Tracking**: Task-level time entries and reporting
- **Risk Management**: Risk register with scoring and mitigation
- **API Integrations**: Slack, Microsoft Teams, GitHub, etc.
- **Mobile App**: React Native mobile application

## 🔧 Development Commands

### Root Commands (run from project root)
- `npm run dev` - Start all development servers
- `npm run build` - Build all packages and apps
- `npm run lint` - Run linting across all packages
- `npm run clean` - Clean all build artifacts

### Database Commands
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Individual App Commands
```bash
# Frontend
cd apps/web
npm run dev        # Start Next.js dev server
npm run build      # Build for production
npm run lint       # Run ESLint

# Backend
cd apps/api
npm run dev        # Start Express dev server with watch
npm run build      # Build TypeScript
npm run start      # Start production server
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user and organization
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🎨 UI Components

The application uses a custom component library built on:
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Lucide React**: Beautiful icons
- **@dnd-kit**: Drag and drop functionality

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions system
- **Input Validation**: Zod schema validation on all inputs
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Secure cross-origin request handling

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Build all packages: `npm run build`
2. Set up production database
3. Run database migrations: `npm run db:migrate`
4. Start API server: `cd apps/api && npm start`
5. Start web server: `cd apps/web && npm start`

## 🤝 Contributing

1. Create feature branches from `main`
2. Follow TypeScript and ESLint conventions
3. Write tests for new features
4. Update documentation as needed
5. Submit pull requests for review

## 📞 Support

For questions or issues:
- Check the documentation in `/docs/`
- Review the API documentation
- Create an issue in the repository

## 🗂️ Database Schema

The application uses a comprehensive multi-tenant database schema supporting:
- **Organizations & Users**: Multi-tenant user management
- **Projects & Tasks**: Hierarchical project structure
- **Roles & Permissions**: Flexible RBAC system
- **Files & Comments**: Collaboration features
- **Time Tracking**: Task-level time entries
- **Audit Logging**: Complete activity tracking

See `packages/database/prisma/schema.prisma` for the complete schema definition.