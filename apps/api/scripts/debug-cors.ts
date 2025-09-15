#!/usr/bin/env node

/**
 * CORS Debugging Script for Railway Deployment
 * Run this to test CORS configuration and environment variables
 */

import { config } from '../src/config'

console.log('========================================')
console.log('     CORS CONFIGURATION DEBUG INFO      ')
console.log('========================================\n')

// 1. Environment Variables
console.log('📦 Environment Variables:')
console.log('------------------------')
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`PORT: ${process.env.PORT}`)
console.log(`ALLOWED_ORIGINS (raw): ${process.env.ALLOWED_ORIGINS}`)
console.log()

// 2. Parsed Configuration
console.log('⚙️ Parsed Configuration:')
console.log('------------------------')
console.log(`Environment: ${config.env}`)
console.log(`Port: ${config.port}`)
console.log(`Allowed Origins: ${JSON.stringify(config.cors.allowedOrigins, null, 2)}`)
console.log()

// 3. Origin Validation Tests
console.log('🧪 Origin Validation Tests:')
console.log('---------------------------')

const testOrigins = [
  'https://projectmgmt-web-production.up.railway.app',
  'https://projectmgmt-web-production.up.railway.app/',
  'https://projectmgmt-api-production.up.railway.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://evil-site.com',
  null,
  undefined
]

testOrigins.forEach(origin => {
  const originStr = origin === null ? 'null' : origin === undefined ? 'undefined' : origin
  
  if (!origin) {
    console.log(`✅ ${originStr}: ALLOWED (no origin)`)
  } else {
    const isAllowed = config.cors.allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || 
             origin === allowedOrigin.replace(/\/$/, '') ||
             origin.replace(/\/$/, '') === allowedOrigin.replace(/\/$/, '')
    })
    
    if (isAllowed) {
      console.log(`✅ ${originStr}: ALLOWED`)
    } else {
      console.log(`❌ ${originStr}: BLOCKED`)
    }
  }
})

console.log()

// 4. Recommendations
console.log('💡 Recommendations:')
console.log('-------------------')

if (!process.env.ALLOWED_ORIGINS) {
  console.log('⚠️ ALLOWED_ORIGINS is not set! Using defaults.')
  console.log('   Set it in Railway dashboard to:')
  console.log('   https://projectmgmt-web-production.up.railway.app,https://projectmgmt-api-production.up.railway.app')
} else if (!process.env.ALLOWED_ORIGINS.includes('https://projectmgmt-web-production.up.railway.app')) {
  console.log('⚠️ Production frontend URL not in ALLOWED_ORIGINS!')
  console.log('   Add: https://projectmgmt-web-production.up.railway.app')
}

if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️ NODE_ENV is not set to "production"')
}

console.log('\n========================================')
console.log('         END OF DEBUG REPORT            ')
console.log('========================================')

// 5. Test actual CORS headers
console.log('\n📡 Testing CORS Headers:')
console.log('------------------------')

import express from 'express'
import cors from 'cors'

const testApp = express()

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    
    const isAllowed = config.cors.allowedOrigins.some(allowedOrigin => {
      return origin === allowedOrigin || 
             origin === allowedOrigin.replace(/\/$/, '') ||
             origin.replace(/\/$/, '') === allowedOrigin.replace(/\/$/, '')
    })
    
    callback(null, isAllowed)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
}

testApp.use(cors(corsOptions))
testApp.options('*', cors(corsOptions))

testApp.get('/test', (req, res) => {
  res.json({ success: true })
})

const testPort = 9999
const server = testApp.listen(testPort, () => {
  console.log(`Test server running on port ${testPort}`)
  
  // Simulate requests
  setTimeout(() => {
    console.log('\nSimulating preflight request...')
    
    // Close server after tests
    setTimeout(() => {
      server.close()
      process.exit(0)
    }, 1000)
  }, 100)
})