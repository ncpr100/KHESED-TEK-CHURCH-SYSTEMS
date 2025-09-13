
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/user-roles - Asignar rol a usuario
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden asignar roles
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, roleId, expiresAt } = body

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'Usuario y rol son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el rol existe y el usuario puede asignarlo
    const role = await db.role.findFirst({
      where: session.user.role === 'SUPER_ADMIN'
        ? { id: roleId }
        : {
            id: roleId,
            OR: [
              { churchId: session.user.churchId },
              { isSystem: true }
            ]
          }
    })

    if (!role) {
      return NextResponse.json(
        { error: 'Rol no encontrado o sin permisos' },
        { status: 404 }
      )
    }

    // Crear la asignación
    const userRole = await db.userRole_Advanced.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      },
      update: {
        isActive: true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      create: {
        userId,
        roleId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        role: true
      }
    })

    return NextResponse.json(userRole, { status: 201 })
  } catch (error) {
    console.error('Error assigning user role:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/user-roles - Remover rol de usuario
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden remover roles
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, roleId } = body

    if (!userId || !roleId) {
      return NextResponse.json(
        { error: 'Usuario y rol son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la asignación existe y el usuario puede modificarla
    const userRole = await db.userRole_Advanced.findFirst({
      where: {
        userId,
        roleId,
      },
      include: {
        role: true
      }
    })

    if (!userRole) {
      return NextResponse.json(
        { error: 'Asignación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar permisos sobre el rol
    if (session.user.role !== 'SUPER_ADMIN' && 
        userRole.role.churchId !== session.user.churchId &&
        !userRole.role.isSystem) {
      return NextResponse.json(
        { error: 'Sin permisos para esta asignación' },
        { status: 403 }
      )
    }

    await db.userRole_Advanced.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    })

    return NextResponse.json({ message: 'Rol removido correctamente' })
  } catch (error) {
    console.error('Error removing user role:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
