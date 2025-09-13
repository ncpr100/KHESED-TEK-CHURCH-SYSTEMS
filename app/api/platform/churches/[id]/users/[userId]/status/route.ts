

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: { id: string, userId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Solo SUPER_ADMIN puede acceder a gestión de plataforma
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const churchId = params.id
    const userId = params.userId
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { message: 'isActive debe ser un valor boolean' },
        { status: 400 }
      )
    }

    // Verificar que la iglesia existe
    const church = await db.church.findUnique({
      where: { id: churchId }
    })

    if (!church) {
      return NextResponse.json(
        { message: 'Iglesia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario existe y pertenece a esta iglesia
    const user = await db.user.findFirst({
      where: { 
        id: userId,
        churchId: churchId
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado en esta iglesia' },
        { status: 404 }
      )
    }

    // No permitir desactivar al último admin de la iglesia
    if (!isActive && user.role === 'ADMIN_IGLESIA') {
      const activeAdmins = await db.user.count({
        where: {
          churchId: churchId,
          role: 'ADMIN_IGLESIA',
          isActive: true,
          id: { not: userId } // Exclude current user
        }
      })

      if (activeAdmins === 0) {
        return NextResponse.json(
          { message: 'No se puede desactivar al último administrador de la iglesia' },
          { status: 400 }
        )
      }
    }

    // Actualizar estado del usuario
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    // Log de actividad
    await db.notification.create({
      data: {
        title: `Usuario ${isActive ? 'activado' : 'desactivado'}`,
        message: `Usuario "${user.name}" (${user.role}) ${isActive ? 'activado' : 'desactivado'} por SUPER_ADMIN`,
        type: isActive ? 'info' : 'warning',
        churchId: churchId,
        isRead: false
      }
    })

    return NextResponse.json({
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

