import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address')

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const slugSchema = z.string()
  .min(3, 'Slug must be at least 3 characters')
  .max(50, 'Slug must be at most 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional()

export const urlSchema = z.string().url('Invalid URL format').optional()

export const timezoneSchema = z.string()
  .regex(/^[A-Za-z_]+\/[A-Za-z_]+$/, 'Invalid timezone format')

export const localeSchema = z.string()
  .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid locale format')

// Date validation helpers
export const futureDateSchema = z.date().refine(
  (date) => date > new Date(),
  { message: 'Date must be in the future' }
)

export const pastDateSchema = z.date().refine(
  (date) => date < new Date(),
  { message: 'Date must be in the past' }
)

// Validation utilities
export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success
}

export function validatePassword(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

export function validateSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

export function validateAndSanitizeSlug(input: string): string | null {
  const sanitized = sanitizeSlug(input)
  return validateSlug(sanitized) ? sanitized : null
}

// File validation
export const fileValidationSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z.number().max(50 * 1024 * 1024, 'File size cannot exceed 50MB'), // 50MB limit
  type: z.string().min(1, 'File type is required'),
})

export const imageFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const documentFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
]

export function isValidImageFile(mimeType: string): boolean {
  return imageFileTypes.includes(mimeType)
}

export function isValidDocumentFile(mimeType: string): boolean {
  return documentFileTypes.includes(mimeType)
}

export function isValidFileType(mimeType: string): boolean {
  return isValidImageFile(mimeType) || isValidDocumentFile(mimeType)
}

// Generic validation helper
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return {
      success: false,
      errors: result.error.errors.map(err => err.message)
    }
  }
}