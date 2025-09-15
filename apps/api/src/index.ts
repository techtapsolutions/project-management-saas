import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { errorHandler } from './middleware/error-handler'
import { notFoundHandler } from './middleware/not-found'

// Import routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import organizationRoutes from './routes/organizations'
import projectRoutes from './routes/projects'
import taskRoutes from './routes/tasks'

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

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