// API Routes
export const API_ROUTES = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    CHANGE_PASSWORD: '/api/auth/change-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  
  // Organizations
  ORGANIZATIONS: {
    LIST: '/api/organizations',
    CREATE: '/api/organizations',
    GET: '/api/organizations/:id',
    UPDATE: '/api/organizations/:id',
    DELETE: '/api/organizations/:id',
    MEMBERS: '/api/organizations/:id/members',
    ROLES: '/api/organizations/:id/roles',
    INVITATIONS: '/api/organizations/:id/invitations',
  },
  
  // Projects
  PROJECTS: {
    LIST: '/api/projects',
    CREATE: '/api/projects',
    GET: '/api/projects/:id',
    UPDATE: '/api/projects/:id',
    DELETE: '/api/projects/:id',
    MEMBERS: '/api/projects/:id/members',
    TASKS: '/api/projects/:id/tasks',
    FILES: '/api/projects/:id/files',
    RISKS: '/api/projects/:id/risks',
    ISSUES: '/api/projects/:id/issues',
    BOARDS: '/api/projects/:id/boards',
  },
  
  // Tasks
  TASKS: {
    LIST: '/api/tasks',
    CREATE: '/api/tasks',
    GET: '/api/tasks/:id',
    UPDATE: '/api/tasks/:id',
    DELETE: '/api/tasks/:id',
    ASSIGN: '/api/tasks/:id/assign',
    COMMENTS: '/api/tasks/:id/comments',
    FILES: '/api/tasks/:id/files',
    TIME_ENTRIES: '/api/tasks/:id/time-entries',
  },
  
  // Users
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    NOTIFICATIONS: '/api/users/notifications',
    PREFERENCES: '/api/users/preferences',
  },
} as const

// Status Constants
export const PROJECT_STATUSES = {
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const

export const TASK_STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  DONE: 'done',
  BLOCKED: 'blocked',
} as const

export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
} as const

export const INVITATION_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const

// Color Constants
export const PRIORITY_COLORS = {
  [PRIORITIES.LOW]: '#10B981', // green
  [PRIORITIES.MEDIUM]: '#F59E0B', // yellow
  [PRIORITIES.HIGH]: '#EF4444', // red
  [PRIORITIES.CRITICAL]: '#7C2D12', // dark red
} as const

export const STATUS_COLORS = {
  [TASK_STATUSES.TODO]: '#6B7280', // gray
  [TASK_STATUSES.IN_PROGRESS]: '#3B82F6', // blue
  [TASK_STATUSES.REVIEW]: '#F59E0B', // yellow
  [TASK_STATUSES.DONE]: '#10B981', // green
  [TASK_STATUSES.BLOCKED]: '#EF4444', // red
} as const

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
} as const

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
} as const

// Notification Types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_DUE: 'task_due',
  PROJECT_UPDATE: 'project_update',
  MEETING_REMINDER: 'meeting_reminder',
  RISK_ESCALATION: 'risk_escalation',
  ISSUE_CREATED: 'issue_created',
  COMMENT_ADDED: 'comment_added',
  FILE_UPLOADED: 'file_uploaded',
} as const

// Time Zones
export const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'UTC',
] as const

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email address already exists',
  ORGANIZATION_NOT_FOUND: 'Organization not found',
  PROJECT_NOT_FOUND: 'Project not found',
  TASK_NOT_FOUND: 'Task not found',
  USER_NOT_FOUND: 'User not found',
} as const