import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { errorHandler } from './middleware/error-handler'
import { notFoundHandler } from './middleware/not-found'
import { corsDebugMiddleware, corsFallbackHandler } from './middleware/cors-debug'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import organizationRoutes from './routes/organizations'
import projectRoutes from './routes/projects'
import taskRoutes from './routes/tasks'
import corsTestRoutes from './routes/cors-test'

const app = express()

// Log CORS configuration on startup for debugging
console.log('🔧 CORS Configuration:', {
  allowedOrigins: config.cors.allowedOrigins,
  environment: config.env,
  rawEnv: process.env.ALLOWED_ORIGINS
})

// Configure CORS with robust settings for Railway
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Log every CORS request for debugging
    console.log(`CORS request from origin: ${origin || 'no-origin'}`)
    
    // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
    if (!origin) {
      return callback(null, true)
    }
    
    // Check if the origin is in the allowed list
    const isAllowed = config.cors.allowedOrigins.some(allowedOrigin => {
      // Exact match or remove trailing slash for comparison
      return origin === allowedOrigin || 
             origin === allowedOrigin.replace(/\/$/, '') ||
             origin.replace(/\/$/, '') === allowedOrigin.replace(/\/$/, '')
    })
    
    if (isAllowed) {
      console.log(`✅ CORS allowed for origin: ${origin}`)
      callback(null, true)
    } else {
      console.error(`❌ CORS blocked for origin: ${origin}`)
      console.error(`Allowed origins: ${config.cors.allowedOrigins.join(', ')}`)
      callback(new Error(`CORS: Origin ${origin} not allowed`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// Add CORS debug middleware first (for logging)
app.use(corsDebugMiddleware)

// Apply CORS middleware first, before any other middleware
app.use(cors(corsOptions))

// Handle preflight requests explicitly for all routes
app.options('*', cors(corsOptions))

// Add fallback CORS handler for Railway edge cases
app.use(corsFallbackHandler)

// Security middleware (after CORS to ensure headers are set)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
app.use(morgan(config.logging.format))

// Root redirect - prevent unnecessary redirects
app.get('/', (req, res) => {
  res.json({ 
    message: 'ProjectMgmt API', 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      organizations: '/api/organizations',
      projects: '/api/projects',
      tasks: '/api/tasks'
    }
  })
})

// Health check with CORS debugging info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: config.cors.allowedOrigins,
      requestOrigin: req.headers.origin || 'no-origin'
    }
  })
})

// CORS test routes (for debugging)
app.use('/api/cors', corsTestRoutes)

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

const port = config.port || 3001

app.listen(port, () => {
  console.log(`🚀 API server running on port ${port}`)
  console.log(`📊 Environment: ${config.env}`)
})

export default app