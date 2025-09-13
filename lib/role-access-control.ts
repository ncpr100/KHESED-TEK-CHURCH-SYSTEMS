
/**
 * Role-Based Access Control for UI Components
 * Granular control over interface elements based on church hierarchy
 * Updated: September 1, 2025
 */

export type ChurchRole = 'SUPER_ADMIN' | 'ADMIN_IGLESIA' | 'PASTOR' | 'LIDER' | 'MIEMBRO'

export interface TabAccess {
  id: string
  label: string
  description: string
  icon: string
  requiredRole: ChurchRole[]
  permissions: string[]
}

export interface RoleConfiguration {
  role: ChurchRole
  priority: number
  displayName: string
  description: string
  allowedTabs: string[]
  restrictedActions: string[]
  emergencyOverride?: boolean
}

// Church hierarchy with granular access controls
export const CHURCH_ROLES: Record<ChurchRole, RoleConfiguration> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    priority: 100,
    displayName: 'Super Administrador',
    description: 'Acceso completo al sistema y configuración global',
    allowedTabs: ['overview', 'permissions', 'roles', 'assignments', 'system', 'audit'],
    restrictedActions: [], // No restrictions
    emergencyOverride: true
  },
  
  ADMIN_IGLESIA: {
    role: 'ADMIN_IGLESIA',
    priority: 80,
    displayName: 'Administrador de Iglesia',
    description: 'Gestión completa de la iglesia y usuarios',
    allowedTabs: ['overview', 'roles', 'assignments', 'church-settings'],
    restrictedActions: ['system-permissions', 'platform-access'],
    emergencyOverride: false
  },
  
  PASTOR: {
    role: 'PASTOR',
    priority: 60,
    displayName: 'Pastor',
    description: 'Supervisión ministerial y gestión pastoral',
    allowedTabs: ['overview', 'ministry-roles', 'pastoral-access'],
    restrictedActions: ['user-management', 'system-settings', 'financial-access'],
    emergencyOverride: false
  },
  
  LIDER: {
    role: 'LIDER',
    priority: 40,
    displayName: 'Líder de Ministerio',
    description: 'Gestión de ministerios específicos y equipos',
    allowedTabs: ['overview', 'team-management'],
    restrictedActions: ['role-creation', 'permission-assignment', 'church-settings'],
    emergencyOverride: false
  },
  
  MIEMBRO: {
    role: 'MIEMBRO',
    priority: 20,
    displayName: 'Miembro',
    description: 'Acceso básico de consulta y participación',
    allowedTabs: ['overview'],
    restrictedActions: ['all-management', 'configuration', 'user-data'],
    emergencyOverride: false
  }
}

// Tab definitions with role-based access
export const PERMISSION_TABS: TabAccess[] = [
  {
    id: 'overview',
    label: 'Resumen',
    description: 'Vista general del sistema de permisos',
    icon: 'BarChart3',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'],
    permissions: ['permissions.read']
  },
  {
    id: 'permissions',
    label: 'Permisos',
    description: 'Gestión de permisos del sistema',
    icon: 'Key',
    requiredRole: ['SUPER_ADMIN'],
    permissions: ['permissions.manage']
  },
  {
    id: 'roles',
    label: 'Roles',
    description: 'Configuración de roles organizacionales',
    icon: 'Shield',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA'],
    permissions: ['roles.manage']
  },
  {
    id: 'assignments',
    label: 'Asignaciones',
    description: 'Asignación de roles a usuarios',
    icon: 'Users',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA'],
    permissions: ['user_roles.manage']
  },
  {
    id: 'ministry-roles',
    label: 'Roles Ministeriales',
    description: 'Gestión de roles específicos del ministerio',
    icon: 'Heart',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'],
    permissions: ['ministry_roles.manage']
  },
  {
    id: 'team-management',
    label: 'Gestión de Equipos',
    description: 'Administración de equipos ministeriales',
    icon: 'UserCheck',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
    permissions: ['teams.manage']
  },
  {
    id: 'church-settings',
    label: 'Configuración Iglesia',
    description: 'Ajustes específicos de la congregación',
    icon: 'Settings',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA'],
    permissions: ['church.settings']
  },
  {
    id: 'pastoral-access',
    label: 'Acceso Pastoral',
    description: 'Configuraciones y permisos pastorales',
    icon: 'BookOpen',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'],
    permissions: ['pastoral.access']
  },
  {
    id: 'system',
    label: 'Sistema',
    description: 'Configuración avanzada del sistema',
    icon: 'Cog',
    requiredRole: ['SUPER_ADMIN'],
    permissions: ['system.manage']
  },
  {
    id: 'audit',
    label: 'Auditoría',
    description: 'Registro de cambios y actividad',
    icon: 'FileText',
    requiredRole: ['SUPER_ADMIN'],
    permissions: ['audit.read']
  }
]

// Helper functions for role-based access control
export function hasTabAccess(userRole: ChurchRole, tabId: string): boolean {
  const tab = PERMISSION_TABS.find(t => t.id === tabId)
  if (!tab) return false
  
  return tab.requiredRole.includes(userRole)
}

export function getAccessibleTabs(userRole: ChurchRole): TabAccess[] {
  return PERMISSION_TABS.filter(tab => tab.requiredRole.includes(userRole))
}

export function getRoleConfiguration(role: ChurchRole): RoleConfiguration | null {
  return CHURCH_ROLES[role] || null
}

export function hasActionPermission(userRole: ChurchRole, action: string): boolean {
  const roleConfig = CHURCH_ROLES[userRole]
  if (!roleConfig) return false
  
  // SUPER_ADMIN bypasses all restrictions
  if (userRole === 'SUPER_ADMIN') return true
  
  return !roleConfig.restrictedActions.includes(action)
}

export function getRoleHierarchy(): ChurchRole[] {
  return Object.entries(CHURCH_ROLES)
    .sort(([,a], [,b]) => b.priority - a.priority)
    .map(([role]) => role as ChurchRole)
}

export function canManageRole(managerRole: ChurchRole, targetRole: ChurchRole): boolean {
  const managerConfig = CHURCH_ROLES[managerRole]
  const targetConfig = CHURCH_ROLES[targetRole]
  
  if (!managerConfig || !targetConfig) return false
  
  // Can only manage roles with lower priority
  return managerConfig.priority > targetConfig.priority
}

// Button configuration for different roles
export interface ActionButton {
  id: string
  label: string
  variant: 'default' | 'outline' | 'secondary' | 'destructive'
  icon: string
  action: string
  requiredRole: ChurchRole[]
  confirmRequired?: boolean
  description: string
}

export const ROLE_ACTION_BUTTONS: ActionButton[] = [
  {
    id: 'create-permission',
    label: 'Crear Permiso',
    variant: 'default',
    icon: 'Plus',
    action: 'permissions.create',
    requiredRole: ['SUPER_ADMIN'],
    description: 'Crear nuevo permiso del sistema'
  },
  {
    id: 'create-role',
    label: 'Crear Rol',
    variant: 'default',
    icon: 'Shield',
    action: 'roles.create',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA'],
    description: 'Crear nuevo rol organizacional'
  },
  {
    id: 'assign-role',
    label: 'Asignar Rol',
    variant: 'outline',
    icon: 'UserPlus',
    action: 'user_roles.assign',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA'],
    description: 'Asignar rol a usuario'
  },
  {
    id: 'manage-ministry',
    label: 'Gestionar Ministerio',
    variant: 'outline',
    icon: 'Heart',
    action: 'ministry.manage',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'],
    description: 'Administrar roles ministeriales'
  },
  {
    id: 'manage-team',
    label: 'Gestionar Equipo',
    variant: 'outline',
    icon: 'Users',
    action: 'team.manage',
    requiredRole: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
    description: 'Administrar equipos de trabajo'
  },
  {
    id: 'view-audit',
    label: 'Ver Auditoría',
    variant: 'secondary',
    icon: 'FileText',
    action: 'audit.read',
    requiredRole: ['SUPER_ADMIN'],
    confirmRequired: false,
    description: 'Consultar registro de actividad'
  },
  {
    id: 'emergency-override',
    label: 'Anulación de Emergencia',
    variant: 'destructive',
    icon: 'AlertTriangle',
    action: 'system.emergency_override',
    requiredRole: ['SUPER_ADMIN'],
    confirmRequired: true,
    description: 'Anular restricciones en situaciones de emergencia'
  }
]

export function getActionButtons(userRole: ChurchRole): ActionButton[] {
  return ROLE_ACTION_BUTTONS.filter(button => button.requiredRole.includes(userRole))
}
