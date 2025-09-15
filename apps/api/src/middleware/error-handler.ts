import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@projectmgmt/database'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function errorHandler(
  err: AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Default error
  let statusCode = 500
  let message = 'Internal server error'
  let errors: any[] = []

  // Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400
    message = 'Validation failed'
    errors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
    }))
  }
  
  // Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409
        message = 'Resource already exists'
        break
      case 'P2025':
        statusCode = 404
        message = 'Resource not found'
        break
      case 'P2003':
        statusCode = 400
        message = 'Invalid foreign key constraint'
        break
      default:
        statusCode = 400
        message = 'Database error'
    }
  }
  
  // Custom application errors
  else if (err.statusCode) {
    statusCode = err.statusCode
    message = err.message
  }
  
  // Unexpected errors
  else {
    console.error('Unexpected error:', err)
  }

  // Log error in production
  if (process.env.NODE_ENV === 'production') {
    console.error({
      statusCode,
      message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    })
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export function createError(message: string, statusCode: number = 500): AppError {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}