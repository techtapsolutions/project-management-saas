import { Permission, ResourceType, ActionType, SystemRoles } from '../types/auth'

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  userPermissions: Permission[],
  resource: ResourceType,
  action: ActionType,
  context?: Record<string, any>
): boolean {
  return userPermissions.some(permission => {
    // Check if permission matches resource and action
    if (permission.resource !== resource && permission.resource !== '*') {
      return false
    }
    
    if (permission.action !== action && permission.action !== '*') {
      return false
    }

    // Check conditions if they exist
    if (permission.conditions && context) {
      return evaluateConditions(permission.conditions, context)
    }

    return true
  })
}

/**
 * Evaluate permission conditions against context
 */
function evaluateConditions(
  conditions: Record<string, any>,
  context: Record<string, any>
): boolean {
  for (const [key, value] of Object.entries(conditions)) {
    const contextValue = context[key]
    
    if (Array.isArray(value)) {
      if (!value.includes(contextValue)) {
        return false
      }
    } else if (value !== contextValue) {
      return false
    }
  }
  
  return true
}

/**
 * Get default permissions for system roles
 */
export function getSystemRolePermissions(role: string): Permission[] {
  switch (role) {
    case SystemRoles.ORGANIZATION_ADMIN:
      return [
        { resource: '*', action: '*' }, // Full access
      ]
    
    case SystemRoles.PROJECT_MANAGER:
      return [
        { resource: 'project', action: '*' },
        { resource: 'task', action: '*' },
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'invite' },
        { resource: 'file', action: '*' },
        { resource: 'comment', action: '*' },
        { resource: 'meeting', action: '*' },
        { resource: 'risk', action: '*' },
        { resource: 'issue', action: '*' },
        { resource: 'board', action: '*' },
        { resource: 'report', action: 'read' },
      ]
    
    case SystemRoles.TEAM_MEMBER:
      return [
        { resource: 'project', action: 'read' },
        { resource: 'task', action: '*', conditions: { assignedTo: 'self' } },
        { resource: 'task', action: 'read' },
        { resource: 'user', action: 'read' },
        { resource: 'file', action: 'read' },
        { resource: 'file', action: 'create' },
        { resource: 'comment', action: '*' },
        { resource: 'meeting', action: 'read' },
        { resource: 'risk', action: 'read' },
        { resource: 'issue', action: 'read' },
        { resource: 'issue', action: 'create' },
        { resource: 'board', action: 'read' },
      ]
    
    case SystemRoles.VIEWER:
      return [
        { resource: 'project', action: 'read' },
        { resource: 'task', action: 'read' },
        { resource: 'user', action: 'read' },
        { resource: 'file', action: 'read' },
        { resource: 'comment', action: 'read' },
        { resource: 'meeting', action: 'read' },
        { resource: 'risk', action: 'read' },
        { resource: 'issue', action: 'read' },
        { resource: 'board', action: 'read' },
        { resource: 'report', action: 'read' },
      ]
    
    default:
      return []
  }
}

/**
 * Create a permission object
 */
export function createPermission(
  resource: ResourceType,
  action: ActionType,
  conditions?: Record<string, any>
): Permission {
  return {
    resource,
    action,
    ...(conditions && { conditions }),
  }
}

/**
 * Check if user can access organization
 */
export function canAccessOrganization(
  userOrganizations: string[],
  organizationId: string
): boolean {
  return userOrganizations.includes(organizationId)
}

/**
 * Check if user can access project based on project membership
 */
export function canAccessProject(
  userProjects: string[],
  projectId: string
): boolean {
  return userProjects.includes(projectId)
}

/**
 * Filter permissions based on context
 */
export function filterPermissions(
  permissions: Permission[],
  resource?: ResourceType,
  action?: ActionType
): Permission[] {
  return permissions.filter(permission => {
    if (resource && permission.resource !== resource && permission.resource !== '*') {
      return false
    }
    
    if (action && permission.action !== action && permission.action !== '*') {
      return false
    }
    
    return true
  })
}