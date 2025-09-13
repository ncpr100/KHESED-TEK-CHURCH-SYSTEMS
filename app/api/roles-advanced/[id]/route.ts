
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/roles-advanced/[id] - Obtener rol específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden ver roles
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const whereCondition = session.user.role === 'SUPER_ADMIN' 
      ? { id: params.id }
      : { 
          id: params.id,
          OR: [
            { churchId: session.user.churchId },
            { isSystem: true }
          ]
        }

    const role = await db.role.findFirst({
      where: whereCondition,
      include: {
        church: true,
        rolePermissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                isActive: true
              }
            }
          }
        }
      }
    })

    if (!role) {
      return NextResponse.json(
        { error: 'Rol no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/roles-advanced/[id] - Actualizar rol
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden editar roles
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, permissions, priority, isActive } = body

    // Verificar que el usuario puede editar este rol
    const existingRole = await db.role.findFirst({
      where: session.user.role === 'SUPER_ADMIN' 
        ? { id: params.id }
        : { 
            id: params.id,
            churchId: session.user.churchId
          }
    })

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Rol no encontrado o sin permisos' },
        { status: 404 }
      )
    }

    // No permitir editar roles del sistema
    if (existingRole.isSystem && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No se pueden editar roles del sistema' },
        { status: 403 }
      )
    }

    const updatedRole = await db.$transaction(async (prisma) => {
      // Actualizar el rol
      const role = await prisma.role.update({
        where: { id: params.id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(typeof priority === 'number' && { priority }),
          ...(typeof isActive === 'boolean' && { isActive }),
        },
      })

      // Actualizar permisos si se proporcionaron
      if (permissions && Array.isArray(permissions)) {
        // Eliminar permisos existentes
        await prisma.rolePermission.deleteMany({
          where: { roleId: params.id }
        })

        // Agregar nuevos permisos
        if (permissions.length > 0) {
          await prisma.rolePermission.createMany({
            data: permissions.map((permissionId: string) => ({
              roleId: params.id,
              permissionId,
            })),
            skipDuplicates: true,
          })
        }
      }

      return role
    })

    const roleWithRelations = await db.role.findUnique({
      where: { id: updatedRole.id },
      include: {
        church: true,
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json(roleWithRelations)
  } catch (error: any) {
    console.error('Error updating role:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un rol con ese nombre en esta iglesia' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/roles-advanced/[id] - Eliminar rol
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden eliminar roles
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // Verificar que el usuario puede eliminar este rol
    const existingRole = await db.role.findFirst({
      where: session.user.role === 'SUPER_ADMIN' 
        ? { id: params.id }
        : { 
            id: params.id,
            churchId: session.user.churchId
          },
      include: {
        userRoles: true
      }
    })

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Rol no encontrado o sin permisos' },
        { status: 404 }
      )
    }

    // No permitir eliminar roles del sistema
    if (existingRole.isSystem) {
      return NextResponse.json(
        { error: 'No se pueden eliminar roles del sistema' },
        { status: 403 }
      )
    }

    // Verificar que no hay usuarios asignados al rol
    if (existingRole.userRoles.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un rol que tiene usuarios asignados' },
        { status: 400 }
      )
    }

    await db.role.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Rol eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
