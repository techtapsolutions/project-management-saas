import { z } from 'zod'

const configSchema = z.object({
  env: z.enum(['development', 'test', 'production']).default('development'),
  port: z.number().default(3001),
  
  // Database
  databaseUrl: z.string(),
  
  // JWT
  jwtSecret: z.string(),
  jwtRefreshSecret: z.string(),
  jwtExpiresIn: z.string().default('15m'),
  jwtRefreshExpiresIn: z.string().default('7d'),
  
  // CORS
  cors: z.object({
    allowedOrigins: z.array(z.string()).default(['http://localhost:3000']),
  }),
  
  // Email
  email: z.object({
    from: z.string().email(),
    smtp: z.object({
      host: z.string(),
      port: z.number(),
      secure: z.boolean().default(true),
      auth: z.object({
        user: z.string(),
        pass: z.string(),
      }),
    }),
  }),
  
  // File Storage
  storage: z.object({
    provider: z.enum(['local', 's3']).default('local'),
    local: z.object({
      uploadDir: z.string().default('./uploads'),
    }),
    s3: z.object({
      bucket: z.string().optional(),
      region: z.string().optional(),
      accessKeyId: z.string().optional(),
      secretAccessKey: z.string().optional(),
    }),
  }),
  
  // Redis
  redis: z.object({
    url: z.string(),
  }),
  
  // Logging
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    format: z.enum(['combined', 'common', 'dev']).default('dev'),
  }),
  
  // Security
  security: z.object({
    bcryptRounds: z.number().default(12),
    sessionSecret: z.string(),
  }),
})

const rawConfig = {
  env: process.env.NODE_ENV,
  port: process.env.PORT ? parseInt(process.env.PORT) : undefined,
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  
  // CORS
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || undefined,
  },
  
  // Email
  email: {
    from: process.env.EMAIL_FROM!,
    smtp: {
      host: process.env.SMTP_HOST!,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    },
  },
  
  // File Storage
  storage: {
    provider: process.env.STORAGE_PROVIDER,
    local: {
      uploadDir: process.env.UPLOAD_DIR,
    },
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL!,
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL,
    format: process.env.LOG_FORMAT,
  },
  
  // Security
  security: {
    bcryptRounds: process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS) : undefined,
    sessionSecret: process.env.SESSION_SECRET!,
  },
}

export const config = configSchema.parse(rawConfig)