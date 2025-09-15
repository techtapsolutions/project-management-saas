import { z } from 'zod'

// User Authentication Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  organizationName: z.string().min(1, 'Organization name is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
})

// Types
export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>

// Auth Response Types
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
  title?: string
  timezone: string
  locale: string
  emailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthOrganization {
  id: string
  name: string
  slug: string
  logoUrl?: string
  role: string
  permissions: string[]
}

export interface AuthResponse {
  user: AuthUser
  organizations: AuthOrganization[]
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// JWT Payload
export interface JWTPayload {
  userId: string
  email: string
  organizationId?: string
  roleId?: string
  permissions?: string[]
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

// Permission System
export interface Permission {
  resource: string
  action: string
  conditions?: Record<string, any>
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: Permission[]
  isSystemRole: boolean
}

// RBAC Constants
export const Resources = {
  ORGANIZATION: 'organization',
  PROJECT: 'project',
  TASK: 'task',
  USER: 'user',
  ROLE: 'role',
  FILE: 'file',
  COMMENT: 'comment',
  MEETING: 'meeting',
  RISK: 'risk',
  ISSUE: 'issue',
  BOARD: 'board',
  REPORT: 'report',
} as const

export const Actions = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  MANAGE: 'manage',
  INVITE: 'invite',
  ASSIGN: 'assign',
} as const

export type ResourceType = typeof Resources[keyof typeof Resources]
export type ActionType = typeof Actions[keyof typeof Actions]

// System Roles
export const SystemRoles = {
  ORGANIZATION_ADMIN: 'organization_admin',
  PROJECT_MANAGER: 'project_manager',
  TEAM_MEMBER: 'team_member',
  VIEWER: 'viewer',
} as const

export type SystemRoleType = typeof SystemRoles[keyof typeof SystemRoles]