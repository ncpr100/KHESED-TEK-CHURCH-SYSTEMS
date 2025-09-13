

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID_ROLES = ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO']

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Solo SUPER_ADMIN puede modificar roles de usuarios
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const userId = params.id
    const body = await request.json()
    const { role } = body

    // Validar el rol
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { message: 'Rol inválido. Debe ser uno de: ' + VALID_ROLES.join(', ') },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        churchId: true
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Prevenir que el usuario se modifique su propio rol a algo diferente de SUPER_ADMIN
    if (session.user.email === existingUser.email && role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'No puedes modificar tu propio rol de SUPER_ADMIN' },
        { status: 400 }
      )
    }

    // Verificar que no sea el último SUPER_ADMIN si se está cambiando el rol
    if (existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      const totalSuperAdmins = await db.user.count({
        where: {
          role: 'SUPER_ADMIN',
          isActive: true,
          id: { not: userId } // Excluir el usuario actual
        }
      })

      if (totalSuperAdmins === 0) {
        return NextResponse.json(
          { message: 'No se puede cambiar el rol del último SUPER_ADMIN activo' },
          { status: 400 }
        )
      }
    }

    // Actualizar el rol del usuario
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true
      }
    })

    // Crear notificación de actividad (solo si el usuario tiene iglesia)
    if (existingUser.churchId) {
      await db.notification.create({
        data: {
          title: 'Rol de usuario modificado',
          message: `El rol del usuario "${existingUser.name}" ha sido cambiado de "${existingUser.role}" a "${role}" por SUPER_ADMIN`,
          type: 'info',
          churchId: existingUser.churchId,
          isRead: false
        }
      })
    }

    return NextResponse.json({
      message: 'Rol actualizado exitosamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

