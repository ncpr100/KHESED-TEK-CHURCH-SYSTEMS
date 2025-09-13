
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/user-permissions?userId=x - Obtener permisos de usuario
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Solo SUPER_ADMIN, ADMIN_IGLESIA pueden ver permisos de otros usuarios
    // Los usuarios solo pueden ver sus propios permisos
    if (session.user.id !== userId && 
        !['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const userPermissions = await db.userPermission.findMany({
      where: { userId },
      include: {
        permission: true
      },
      orderBy: [
        { permission: { resource: 'asc' } },
        { permission: { action: 'asc' } }
      ]
    })

    return NextResponse.json(userPermissions)
  } catch (error) {
    console.error('Error fetching user permissions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/user-permissions - Asignar permiso a usuario
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden asignar permisos
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, permissionId, granted, conditions, expiresAt } = body

    if (!userId || !permissionId) {
      return NextResponse.json(
        { error: 'Usuario y permiso son requeridos' },
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

    // Verificar que el permiso existe
    const permission = await db.permission.findUnique({
      where: { id: permissionId }
    })

    if (!permission) {
      return NextResponse.json(
        { error: 'Permiso no encontrado' },
        { status: 404 }
      )
    }

    // Crear o actualizar el permiso de usuario
    const userPermission = await db.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId
        }
      },
      update: {
        granted: granted !== undefined ? granted : true,
        conditions,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      create: {
        userId,
        permissionId,
        granted: granted !== undefined ? granted : true,
        conditions,
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
        permission: true
      }
    })

    return NextResponse.json(userPermission, { status: 201 })
  } catch (error) {
    console.error('Error assigning user permission:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/user-permissions - Remover permiso de usuario
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden remover permisos
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, permissionId } = body

    if (!userId || !permissionId) {
      return NextResponse.json(
        { error: 'Usuario y permiso son requeridos' },
        { status: 400 }
      )
    }

    await db.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId
        }
      }
    })

    return NextResponse.json({ message: 'Permiso removido correctamente' })
  } catch (error) {
    console.error('Error removing user permission:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
