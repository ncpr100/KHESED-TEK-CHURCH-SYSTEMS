
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/permissions/[id] - Obtener permiso específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden ver permisos
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const permission = await db.permission.findUnique({
      where: { id: params.id },
      include: {
        rolePermissions: {
          include: {
            role: true
          }
        },
        userPermissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!permission) {
      return NextResponse.json(
        { error: 'Permiso no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(permission)
  } catch (error) {
    console.error('Error fetching permission:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/permissions/[id] - Actualizar permiso
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN puede editar permisos
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, resource, action, conditions, isActive } = body

    const permission = await db.permission.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(resource && { resource }),
        ...(action && { action }),
        ...(conditions !== undefined && { conditions }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
    })

    return NextResponse.json(permission)
  } catch (error: any) {
    console.error('Error updating permission:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un permiso con ese nombre o combinación recurso/acción' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/permissions/[id] - Eliminar permiso
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN puede eliminar permisos
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    await db.permission.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Permiso eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting permission:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
