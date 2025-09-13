
import { db } from './db'

// Recursos disponibles en el sistema
export const RESOURCES = {
  MEMBERS: 'members',
  VOLUNTEERS: 'volunteers',
  DONATIONS: 'donations',
  EVENTS: 'events',
  SERMONS: 'sermons',
  COMMUNICATIONS: 'communications',
  REPORTS: 'reports',
  SETTINGS: 'settings',
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  ANALYTICS: 'analytics',
  SOCIAL_MEDIA: 'social_media',
  MARKETING: 'marketing',
  WEBSITE_BUILDER: 'website_builder',
} as const

// Acciones disponibles
export const ACTIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE: 'manage', // Incluye todas las acciones
} as const

// Tipos para TypeScript
export type Resource = typeof RESOURCES[keyof typeof RESOURCES]
export type Action = typeof ACTIONS[keyof typeof ACTIONS]

// Estructura de contexto para evaluación de permisos
export interface PermissionContext {
  userId: string
  churchId?: string
  resourceId?: string
  conditions?: Record<string, any>
}

// Verificar si un usuario tiene un permiso específico
export async function hasPermission(
  userId: string,
  resource: Resource,
  action: Action,
  context?: PermissionContext
): Promise<boolean> {
  try {
    // Obtener usuario con roles y permisos
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          where: { isActive: true },
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userPermissions: {
          where: { granted: true },
          include: {
            permission: true
          }
        }
      }
    })

    if (!user) return false

    // Verificar si es SUPER_ADMIN (acceso total)
    if (user.role === 'SUPER_ADMIN') {
      return true
    }

    // Verificar permisos directos del usuario
    const directPermission = user.userPermissions?.find((up: any) => 
      up.permission.resource === resource && 
      up.permission.action === action &&
      up.permission.isActive
    )

    if (directPermission) {
      return evaluateConditions(directPermission.conditions, context)
    }

    // Verificar permisos a través de roles
    for (const userRole of user.userRoles || []) {
      if (!userRole.role || !userRole.role.isActive) continue
      
      const rolePermission = userRole.role.rolePermissions.find((rp: any) => 
        rp.permission?.resource === resource && 
        rp.permission?.action === action &&
        rp.permission?.isActive
      )

      if (rolePermission) {
        const hasRolePermission = evaluateConditions(rolePermission.conditions, context)
        if (hasRolePermission) return true
      }
    }

    return false
  } catch (error) {
    console.error('Error checking permission:', error)
    return false
  }
}

// Evaluar condiciones de permisos (JSON)
function evaluateConditions(
  conditions: string | null,
  context?: PermissionContext
): boolean {
  if (!conditions) return true
  if (!context) return true

  try {
    const parsedConditions = JSON.parse(conditions)
    
    // Ejemplo de evaluación de condiciones
    // Esto se puede extender según las necesidades específicas
    if (parsedConditions.churchId && context.churchId) {
      return parsedConditions.churchId === context.churchId
    }

    if (parsedConditions.ownResource && context.resourceId && context.userId) {
      // Verificar si el usuario es propietario del recurso
      return parsedConditions.ownResource === true
    }

    return true
  } catch {
    return true
  }
}

// Obtener todos los permisos de un usuario
export async function getUserPermissions(userId: string): Promise<{
  directPermissions: Array<{
    resource: string
    action: string
    conditions?: string
  }>
  rolePermissions: Array<{
    resource: string
    action: string
    conditions?: string
    roleName: string
  }>
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        where: { isActive: true },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      },
      userPermissions: {
        where: { granted: true },
        include: {
          permission: true
        }
      }
    }
  })

  if (!user) {
    return { directPermissions: [], rolePermissions: [] }
  }

  const directPermissions = user.userPermissions?.map((up: any) => ({
    resource: up.permission.resource,
    action: up.permission.action,
    conditions: up.conditions || up.permission.conditions
  })) || []

  const rolePermissions = user.userRoles?.flatMap((ur: any) =>
    ur.role?.rolePermissions
      ?.filter((rp: any) => rp.permission?.isActive)
      ?.map((rp: any) => ({
        resource: rp.permission.resource,
        action: rp.permission.action,
        conditions: rp.conditions || rp.permission.conditions,
        roleName: ur.role.name
      })) || []
  ) || []

  return { directPermissions, rolePermissions }
}

// Permisos por defecto para cada rol básico
export const DEFAULT_ROLE_PERMISSIONS = {
  SUPER_ADMIN: '*', // Acceso total
  ADMIN_IGLESIA: [
    { resource: RESOURCES.MEMBERS, action: ACTIONS.MANAGE },
    { resource: RESOURCES.VOLUNTEERS, action: ACTIONS.MANAGE },
    { resource: RESOURCES.DONATIONS, action: ACTIONS.MANAGE },
    { resource: RESOURCES.EVENTS, action: ACTIONS.MANAGE },
    { resource: RESOURCES.SERMONS, action: ACTIONS.MANAGE },
    { resource: RESOURCES.COMMUNICATIONS, action: ACTIONS.MANAGE },
    { resource: RESOURCES.REPORTS, action: ACTIONS.READ },
    { resource: RESOURCES.ANALYTICS, action: ACTIONS.READ },
    { resource: RESOURCES.SOCIAL_MEDIA, action: ACTIONS.MANAGE },
    { resource: RESOURCES.MARKETING, action: ACTIONS.MANAGE },
    { resource: RESOURCES.WEBSITE_BUILDER, action: ACTIONS.MANAGE },
    { resource: RESOURCES.USERS, action: ACTIONS.WRITE },
    { resource: RESOURCES.ROLES, action: ACTIONS.WRITE },
    { resource: RESOURCES.SETTINGS, action: ACTIONS.WRITE },
  ],
  PASTOR: [
    { resource: RESOURCES.MEMBERS, action: ACTIONS.READ },
    { resource: RESOURCES.VOLUNTEERS, action: ACTIONS.READ },
    { resource: RESOURCES.DONATIONS, action: ACTIONS.READ },
    { resource: RESOURCES.EVENTS, action: ACTIONS.WRITE },
    { resource: RESOURCES.SERMONS, action: ACTIONS.MANAGE },
    { resource: RESOURCES.COMMUNICATIONS, action: ACTIONS.WRITE },
    { resource: RESOURCES.REPORTS, action: ACTIONS.READ },
    { resource: RESOURCES.ANALYTICS, action: ACTIONS.READ },
  ],
  LIDER: [
    { resource: RESOURCES.MEMBERS, action: ACTIONS.READ },
    { resource: RESOURCES.VOLUNTEERS, action: ACTIONS.READ },
    { resource: RESOURCES.EVENTS, action: ACTIONS.READ },
    { resource: RESOURCES.SERMONS, action: ACTIONS.READ },
    { resource: RESOURCES.COMMUNICATIONS, action: ACTIONS.READ },
  ],
  MIEMBRO: [
    { resource: RESOURCES.EVENTS, action: ACTIONS.READ },
    { resource: RESOURCES.SERMONS, action: ACTIONS.READ },
  ],
} as const
