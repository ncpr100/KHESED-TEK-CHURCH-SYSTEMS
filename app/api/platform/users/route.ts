
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const church = searchParams.get('church') || 'all'

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role !== 'all') {
      where.role = role
    }

    if (church !== 'all') {
      where.churchId = church
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          church: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching platform users:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, isActive, role } = body

    if (!userId) {
      return NextResponse.json(
        { message: 'userId es requerido' },
        { status: 400 }
      )
    }

    const updateData: any = { updatedAt: new Date() }
    
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive
    }
    
    if (role && ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'].includes(role)) {
      updateData.role = role
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        church: {
          select: { name: true }
        }
      }
    })

    // Log de actividad
    const notificationData: any = {
      title: 'Usuario actualizado por SUPER_ADMIN',
      message: `Usuario ${user.name} actualizado`,
      type: 'info',
      isRead: false
    }

    if (user.churchId) {
      notificationData.churchId = user.churchId
    }

    await db.notification.create({
      data: notificationData
    })

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
