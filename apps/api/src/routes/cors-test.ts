import { Router } from 'express'

const router = Router()

/**
 * CORS Test Endpoints for debugging
 * These endpoints help diagnose CORS issues in production
 */

// Simple GET test
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS GET test successful',
    origin: req.get('Origin') || 'no-origin',
    method: req.method,
    timestamp: new Date().toISOString()
  })
})

// POST test (similar to registration)
router.post('/test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS POST test successful',
    origin: req.get('Origin') || 'no-origin',
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  })
})

// Preflight test info
router.options('/test', (req, res) => {
  // This should be handled by the main CORS middleware
  // But we'll add explicit headers just in case
  const origin = req.get('Origin')
  
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Max-Age', '86400')
  }
  
  res.sendStatus(204)
})

// Debug info endpoint
router.get('/debug', (req, res) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
  const origin = req.get('Origin')
  
  res.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
      parsed: allowedOrigins
    },
    request: {
      origin: origin || 'no-origin',
      method: req.method,
      headers: {
        'content-type': req.get('Content-Type'),
        'authorization': req.get('Authorization') ? 'present' : 'absent'
      }
    },
    cors: {
      originAllowed: origin ? allowedOrigins.some(allowed => 
        origin === allowed || 
        origin === allowed.replace(/\/$/, '') ||
        origin.replace(/\/$/, '') === allowed.replace(/\/$/, '')
      ) : true,
      responseHeaders: {
        'access-control-allow-origin': res.get('Access-Control-Allow-Origin'),
        'access-control-allow-credentials': res.get('Access-Control-Allow-Credentials')
      }
    },
    timestamp: new Date().toISOString()
  })
})

export default router