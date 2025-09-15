import { Router } from 'express'
import { body, param } from 'express-validator'
import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
} from '../controllers/projects'
import { authenticateToken, requireOrganization, requirePermissions } from '../middleware/auth'
import { asyncHandler } from '../middleware/error-handler'

const router = Router()

// All project routes require authentication and organization context
router.use(authenticateToken)
router.use(requireOrganization)

// Get projects
router.get('/', asyncHandler(getProjects))

// Create project
router.post('/', [
  body('name')
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 100 })
    .withMessage('Project name must not exceed 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
], requirePermissions(['project:create']), asyncHandler(createProject))

// Get project details
router.get('/:id', [
  param('id').isUUID().withMessage('Project ID must be a valid UUID'),
], requirePermissions(['project:read']), asyncHandler(getProject))

// Update project
router.put('/:id', [
  param('id').isUUID().withMessage('Project ID must be a valid UUID'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['active', 'on_hold', 'completed', 'archived'])
    .withMessage('Status must be one of: active, on_hold, completed, archived'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be one of: low, medium, high, critical'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('budget')
    .optional()
    .isNumeric()
    .withMessage('Budget must be a number'),
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
], requirePermissions(['project:update']), asyncHandler(updateProject))

// Delete project
router.delete('/:id', [
  param('id').isUUID().withMessage('Project ID must be a valid UUID'),
], requirePermissions(['project:delete']), asyncHandler(deleteProject))

// Project member management
router.get('/:id/members', [
  param('id').isUUID().withMessage('Project ID must be a valid UUID'),
], requirePermissions(['project:read']), asyncHandler(getProjectMembers))

router.post('/:id/members', [
  param('id').isUUID().withMessage('Project ID must be a valid UUID'),
  body('userId').isUUID().withMessage('User ID must be a valid UUID'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'member', 'viewer'])
    .withMessage('Role must be one of: admin, manager, member, viewer'),
], requirePermissions(['project:manage']), asyncHandler(addProjectMember))

router.delete('/:id/members/:userId', [
  param('id').isUUID().withMessage('Project ID must be a valid UUID'),
  param('userId').isUUID().withMessage('User ID must be a valid UUID'),
], requirePermissions(['project:manage']), asyncHandler(removeProjectMember))

router.put('/:id/members/:userId/role', [
  param('id').isUUID().withMessage('Project ID must be a valid UUID'),
  param('userId').isUUID().withMessage('User ID must be a valid UUID'),
  body('role')
    .isIn(['admin', 'manager', 'member', 'viewer'])
    .withMessage('Role must be one of: admin, manager, member, viewer'),
], requirePermissions(['project:manage']), asyncHandler(updateProjectMemberRole))

export default router