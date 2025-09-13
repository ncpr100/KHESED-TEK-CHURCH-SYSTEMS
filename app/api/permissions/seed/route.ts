
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { RESOURCES, ACTIONS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions'

// POST /api/permissions/seed - Inicializar permisos y roles del sistema
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN puede inicializar el sistema
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const result = await db.$transaction(async (prisma) => {
      // 1. Crear permisos básicos para todos los recursos
      const permissions = []
      for (const resource of Object.values(RESOURCES)) {
        for (const action of Object.values(ACTIONS)) {
          const permission = await prisma.permission.upsert({
            where: {
              resource_action: { resource, action }
            },
            update: {},
            create: {
              name: `${resource}.${action}`,
              description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
              resource,
              action,
            }
          })
          permissions.push(permission)
        }
      }

      // 2. Crear roles del sistema
      const systemRoles = []
      
      for (const [roleName, rolePermissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
        if (roleName === 'SUPER_ADMIN') continue // SUPER_ADMIN no necesita rol específico
        
        const role = await prisma.role.upsert({
          where: {
            name_churchId: { 
              name: roleName, 
              churchId: null as any
            }
          },
          update: {},
          create: {
            name: roleName,
            description: `Rol del sistema: ${roleName}`,
            isSystem: true,
            priority: getRolePriority(roleName),
          }
        })
        
        systemRoles.push(role)

        // 3. Asignar permisos a roles
        if (Array.isArray(rolePermissions)) {
          for (const perm of rolePermissions) {
            const permission = permissions.find(p => 
              p.resource === perm.resource && p.action === perm.action
            )
            if (permission) {
              await prisma.rolePermission.upsert({
                where: {
                  roleId_permissionId: {
                    roleId: role.id,
                    permissionId: permission.id
                  }
                },
                update: {},
                create: {
                  roleId: role.id,
                  permissionId: permission.id,
                }
              })
            }
          }
        }
      }

      return {
        permissionsCreated: permissions.length,
        rolesCreated: systemRoles.length,
        permissions,
        roles: systemRoles
      }
    })

    return NextResponse.json({
      message: 'Sistema de permisos inicializado correctamente',
      data: result
    })
  } catch (error) {
    console.error('Error seeding permissions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para obtener prioridad de roles
function getRolePriority(roleName: string): number {
  const priorities = {
    'ADMIN_IGLESIA': 90,
    'PASTOR': 80,
    'LIDER': 70,
    'MIEMBRO': 60,
  }
  return priorities[roleName as keyof typeof priorities] || 50
}
