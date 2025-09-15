import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '@projectmgmt/database'
import { JWTPayload } from '@projectmgmt/shared'
import { config } from '../config'
import { createError } from './error-handler'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    organizationId?: string
    roleId?: string
    permissions?: string[]
  }
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      throw createError('Access token required', 401)
    }

    const payload = jwt.verify(token, config.jwtSecret) as JWTPayload

    if (payload.type !== 'access') {
      throw createError('Invalid token type', 401)
    }

    // Verify user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: payload.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    })

    if (!user) {
      throw createError('User not found or inactive', 401)
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
      organizationId: payload.organizationId,
      roleId: payload.roleId,
      permissions: payload.permissions,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError('Invalid token', 401)
    }
    next(error)
  }
}

export async function requireOrganization(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.organizationId) {
      throw createError('Organization context required', 403)
    }

    // Verify user is still a member of the organization
    const membership = await prisma.organizationUser.findFirst({
      where: {
        userId: req.user.id,
        organizationId: req.user.organizationId,
        status: 'active',
      },
      include: {
        role: {
          select: {
            permissions: true,
          },
        },
      },
    })

    if (!membership) {
      throw createError('Access denied to organization', 403)
    }

    next()
  } catch (error) {
    next(error)
  }
}

export function requirePermissions(permissions: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.permissions) {
        throw createError('Insufficient permissions', 403)
      }

      const userPermissions = req.user.permissions
      const hasAllPermissions = permissions.every(permission =>
        userPermissions.includes(permission) || userPermissions.includes('*')
      )

      if (!hasAllPermissions) {
        throw createError('Insufficient permissions', 403)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as JWTPayload
    req.user = {
      id: payload.userId,
      email: payload.email,
      organizationId: payload.organizationId,
      roleId: payload.roleId,
      permissions: payload.permissions,
    }
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }

  next()
}