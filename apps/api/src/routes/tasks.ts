import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
  getTaskComments,
  createTaskComment,
} from '../controllers/tasks'
import { authenticateToken, requireOrganization, requirePermissions } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()

// All task routes require authentication and organization context
router.use(authenticateToken)
router.use(requireOrganization)

// Get tasks
router.get('/', asyncHandler(getTasks))

// Create task
router.post('/', [
  body('projectId').isUUID().withMessage('Project ID must be a valid UUID'),
  body('parentId').optional().isUUID().withMessage('Parent ID must be a valid UUID'),
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title must not exceed 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('estimatedHours')
    .optional()
    .isNumeric()
    .withMessage('Estimated hours must be a number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('assignedUserIds')
    .optional()
    .isArray()
    .withMessage('Assigned user IDs must be an array'),
  body('assignedUserIds.*')
    .optional()
    .isUUID()
    .withMessage('Each assigned user ID must be a valid UUID'),
], requirePermissions(['task:create']), asyncHandler(createTask))

// Get task details
router.get('/:id', [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
], requirePermissions(['task:read']), asyncHandler(getTask))

// Update task
router.put('/:id', [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'done', 'blocked'])
    .withMessage('Status must be one of: todo, in_progress, review, done, blocked'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('estimatedHours')
    .optional()
    .isNumeric()
    .withMessage('Estimated hours must be a number'),
  body('actualHours')
    .optional()
    .isNumeric()
    .withMessage('Actual hours must be a number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
], requirePermissions(['task:update']), asyncHandler(updateTask))

// Delete task
router.delete('/:id', [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
], requirePermissions(['task:delete']), asyncHandler(deleteTask))

// Task assignment
router.post('/:id/assign', [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
  body('userId').isUUID().withMessage('User ID must be a valid UUID'),
  body('role')
    .optional()
    .isIn(['assignee', 'reviewer', 'observer'])
    .withMessage('Role must be one of: assignee, reviewer, observer'),
], requirePermissions(['task:assign']), asyncHandler(assignTask))

router.delete('/:id/assign/:userId', [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
  param('userId').isUUID().withMessage('User ID must be a valid UUID'),
], requirePermissions(['task:assign']), asyncHandler(unassignTask))

// Task comments
router.get('/:id/comments', [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
], requirePermissions(['task:read']), asyncHandler(getTaskComments))

router.post('/:id/comments', [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  body('parentId')
    .optional()
    .isUUID()
    .withMessage('Parent comment ID must be a valid UUID'),
], requirePermissions(['comment:create']), asyncHandler(createTaskComment))

export default router