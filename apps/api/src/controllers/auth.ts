import { Request, Response } from 'express'
import { validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma, SystemRoles } from '@projectmgmt/database'
import { 
  AuthResponse, 
  JWTPayload, 
  getSystemRolePermissions,
  sanitizeSlug 
} from '@projectmgmt/shared'
import { config } from '../config'
import { createError } from '../middleware/error-handler'
import { AuthenticatedRequest } from '../middleware/auth'

export async function register(req: Request, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { firstName, lastName, email, password, organizationName } = req.body

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw createError('Email address already exists', 409)
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds)

  // Create organization slug
  const organizationSlug = sanitizeSlug(organizationName)
  if (!organizationSlug) {
    throw createError('Invalid organization name', 400)
  }

  // Check if organization slug already exists
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  })

  if (existingOrg) {
    throw createError('Organization name already taken', 409)
  }

  // Create user, organization, and admin role in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create organization
    const organization = await tx.organization.create({
      data: {
        name: organizationName,
        slug: organizationSlug,
        description: `${organizationName} workspace`,
      },
    })

    // Create user
    const user = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        emailVerified: false,
        isActive: true,
      },
    })

    // Create user password
    await tx.userPassword.create({
      data: {
        userId: user.id,
        passwordHash,
      },
    })

    // Create admin role
    const adminRole = await tx.role.create({
      data: {
        organizationId: organization.id,
        name: SystemRoles.ORGANIZATION_ADMIN,
        description: 'Full access to organization',
        permissions: { permissions: getSystemRolePermissions(SystemRoles.ORGANIZATION_ADMIN) },
        isSystemRole: true,
      },
    })

    // Add user to organization with admin role
    await tx.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        roleId: adminRole.id,
        status: 'active',
      },
    })

    return { user, organization, role: adminRole }
  })

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    userId: result.user.id,
    email: result.user.email,
    organizationId: result.organization.id,
    roleId: result.role.id,
    permissions: getSystemRolePermissions(SystemRoles.ORGANIZATION_ADMIN).map(p => `${p.resource}:${p.action}`),
  })

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: result.user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  const response: AuthResponse = {
    user: {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      avatarUrl: result.user.avatarUrl,
      title: result.user.title,
      timezone: result.user.timezone,
      locale: result.user.locale,
      emailVerified: result.user.emailVerified,
      isActive: result.user.isActive,
      createdAt: result.user.createdAt.toISOString(),
      updatedAt: result.user.updatedAt.toISOString(),
    },
    organizations: [{
      id: result.organization.id,
      name: result.organization.name,
      slug: result.organization.slug,
      logoUrl: result.organization.logoUrl,
      role: SystemRoles.ORGANIZATION_ADMIN,
      permissions: getSystemRolePermissions(SystemRoles.ORGANIZATION_ADMIN).map(p => `${p.resource}:${p.action}`),
    }],
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: response,
  })
}

export async function login(req: Request, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { email, password } = req.body

  // Find user with password
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
      organizations: {
        include: {
          organization: true,
          role: true,
        },
        where: {
          status: 'active',
        },
      },
    },
  })

  if (!user || !user.password) {
    throw createError('Invalid email or password', 401)
  }

  if (!user.isActive) {
    throw createError('Account is inactive', 401)
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password.passwordHash)
  if (!isValidPassword) {
    throw createError('Invalid email or password', 401)
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  // Get user's first active organization (they can switch later)
  const primaryOrg = user.organizations[0]
  if (!primaryOrg) {
    throw createError('No active organization found', 403)
  }

  const permissions = (primaryOrg.role.permissions as any)?.permissions || []
  const permissionStrings = permissions.map((p: any) => `${p.resource}:${p.action}`)

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    userId: user.id,
    email: user.email,
    organizationId: primaryOrg.organizationId,
    roleId: primaryOrg.roleId,
    permissions: permissionStrings,
  })

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  })

  const response: AuthResponse = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      title: user.title,
      timezone: user.timezone,
      locale: user.locale,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    organizations: user.organizations.map(org => ({
      id: org.organization.id,
      name: org.organization.name,
      slug: org.organization.slug,
      logoUrl: org.organization.logoUrl,
      role: org.role.name,
      permissions: permissionStrings,
    })),
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  }

  res.json({
    success: true,
    message: 'Login successful',
    data: response,
  })
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (token) {
    // Add token to blacklist or handle token invalidation
    // For now, we'll just remove refresh tokens
    await prisma.refreshToken.deleteMany({
      where: {
        userId: req.user!.id,
      },
    })
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  })
}

export async function refreshToken(req: Request, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { refreshToken } = req.body

  // Verify refresh token
  let payload: JWTPayload
  try {
    payload = jwt.verify(refreshToken, config.jwtRefreshSecret) as JWTPayload
  } catch (error) {
    throw createError('Invalid refresh token', 401)
  }

  if (payload.type !== 'refresh') {
    throw createError('Invalid token type', 401)
  }

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findFirst({
    where: {
      token: refreshToken,
      userId: payload.userId,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!storedToken) {
    throw createError('Invalid or expired refresh token', 401)
  }

  // Verify user still exists and is active
  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      isActive: true,
    },
    include: {
      organizations: {
        include: {
          organization: true,
          role: true,
        },
        where: {
          status: 'active',
          organizationId: payload.organizationId,
        },
      },
    },
  })

  if (!user || user.organizations.length === 0) {
    throw createError('User not found or access revoked', 401)
  }

  const org = user.organizations[0]
  const permissions = (org.role.permissions as any)?.permissions || []
  const permissionStrings = permissions.map((p: any) => `${p.resource}:${p.action}`)

  // Generate new tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    organizationId: org.organizationId,
    roleId: org.roleId,
    permissions: permissionStrings,
  })

  // Remove old refresh token and store new one
  await prisma.$transaction([
    prisma.refreshToken.delete({
      where: { id: storedToken.id },
    }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    }),
  ])

  res.json({
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: 15 * 60,
    },
  })
}

export async function forgotPassword(req: Request, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { email } = req.body

  const user = await prisma.user.findUnique({
    where: { email },
  })

  // Always return success to prevent email enumeration
  res.json({
    success: true,
    message: 'If an account with that email exists, we\'ve sent a password reset link.',
  })

  if (!user) return

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

  // Store reset token (you might want a separate table for this)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      settings: {
        ...((user.settings as any) || {}),
        passwordResetToken: resetTokenHash,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    },
  })

  // Send email (implement email service)
  // await emailService.sendPasswordReset(user.email, resetToken)
}

export async function resetPassword(req: Request, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { token, password } = req.body

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const user = await prisma.user.findFirst({
    where: {
      settings: {
        path: ['passwordResetToken'],
        equals: tokenHash,
      },
    },
    include: {
      password: true,
    },
  })

  if (!user) {
    throw createError('Invalid or expired reset token', 400)
  }

  const settings = user.settings as any
  if (!settings?.passwordResetExpires || new Date() > new Date(settings.passwordResetExpires)) {
    throw createError('Invalid or expired reset token', 400)
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds)

  // Update password and clear reset token
  await prisma.$transaction([
    prisma.userPassword.upsert({
      where: { userId: user.id },
      update: { passwordHash },
      create: {
        userId: user.id,
        passwordHash,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        settings: {
          ...settings,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      },
    }),
    // Invalidate all refresh tokens
    prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    }),
  ])

  res.json({
    success: true,
    message: 'Password reset successfully',
  })
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400)
  }

  const { currentPassword, newPassword } = req.body
  const userId = req.user!.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      password: true,
    },
  })

  if (!user || !user.password) {
    throw createError('User not found', 404)
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password.passwordHash)
  if (!isValidPassword) {
    throw createError('Current password is incorrect', 400)
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds)

  // Update password
  await prisma.userPassword.update({
    where: { userId },
    data: { passwordHash },
  })

  res.json({
    success: true,
    message: 'Password changed successfully',
  })
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.query

  if (!token) {
    throw createError('Verification token is required', 400)
  }

  // Implement email verification logic
  res.json({
    success: true,
    message: 'Email verified successfully',
  })
}

function generateTokens(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>) {
  const accessTokenPayload: JWTPayload = {
    ...payload,
    type: 'access',
  }

  const refreshTokenPayload: JWTPayload = {
    userId: payload.userId,
    email: payload.email,
    type: 'refresh',
  }

  const accessToken = jwt.sign(accessTokenPayload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  })

  const refreshToken = jwt.sign(refreshTokenPayload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  })

  return { accessToken, refreshToken }
}