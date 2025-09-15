import { Request, Response, NextFunction } from 'express'

/**
 * Debug middleware to log CORS-related information
 * This helps diagnose CORS issues in production
 */
export function corsDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.get('Origin')
  const method = req.method
  const path = req.path
  
  // Log preflight requests
  if (method === 'OPTIONS') {
    console.log(`🔍 CORS Preflight Request:`, {
      origin,
      method,
      path,
      requestedMethod: req.get('Access-Control-Request-Method'),
      requestedHeaders: req.get('Access-Control-Request-Headers'),
      allowedOrigins: process.env.ALLOWED_ORIGINS,
    })
  }
  
  // Log actual requests with origin
  if (origin) {
    console.log(`🔍 CORS Request:`, {
      origin,
      method,
      path,
      headers: {
        'content-type': req.get('Content-Type'),
        'authorization': req.get('Authorization') ? 'present' : 'absent',
      }
    })
  }
  
  // Add debugging headers (only in development/staging)
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG_CORS === 'true') {
    res.setHeader('X-CORS-Debug-Origin', origin || 'no-origin')
    res.setHeader('X-CORS-Debug-Method', method)
    res.setHeader('X-CORS-Debug-Allowed', process.env.ALLOWED_ORIGINS || 'not-set')
  }
  
  next()
}

/**
 * Fallback CORS handler for when the main CORS middleware fails
 * This ensures basic CORS headers are always set
 */
export function corsFallbackHandler(req: Request, res: Response, next: NextFunction) {
  const origin = req.get('Origin')
  
  // Only apply fallback if headers haven't been set
  if (origin && !res.getHeader('Access-Control-Allow-Origin')) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      const normalizedAllowed = allowedOrigin.trim().replace(/\/$/, '')
      const normalizedOrigin = origin.replace(/\/$/, '')
      return normalizedOrigin === normalizedAllowed
    })
    
    if (isAllowed) {
      console.log(`⚠️ CORS Fallback: Setting headers for ${origin}`)
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Access-Control-Allow-Credentials', 'true')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Max-Age', '86400')
        return res.sendStatus(204)
      }
    }
  }
  
  next()
}