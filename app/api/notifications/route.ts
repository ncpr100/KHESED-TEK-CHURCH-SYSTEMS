
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notificationSchema = z.object({
  title: z.string().min(1, 'Título es requerido'),
  message: z.string().min(1, 'Mensaje es requerido'),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']),
  targetRole: z.string().optional(),
  targetUser: z.string().optional(),
  isGlobal: z.boolean().default(false),
})

// GET - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const sentOnly = searchParams.get('sentOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')

    // Build where clause
    let whereClause
    
    if (sentOnly) {
      // For sent notifications - only show notifications created by this user
      whereClause = {
        churchId: user.churchId,
        createdBy: user.id,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' as any } },
            { message: { contains: search, mode: 'insensitive' as any } }
          ]
        }),
        ...(type && type !== 'all' && { type }),
        ...(category && category !== 'all' && { category }),
        ...(priority && priority !== 'all' && { priority })
      }
    } else {
      // For received notifications - notifications targeting this user
      whereClause = {
        churchId: user.churchId,
        AND: [
          {
            OR: [
              { isGlobal: true },
              { targetUser: user.id },
              { targetRole: user.role },
            ]
          },
          ...(unreadOnly ? [{ isRead: false }] : []),
          ...(search ? [{
            OR: [
              { title: { contains: search, mode: 'insensitive' as any } },
              { message: { contains: search, mode: 'insensitive' as any } }
            ]
          }] : []),
          ...(type && type !== 'all' ? [{ type }] : []),
          ...(category && category !== 'all' ? [{ category }] : []),
          ...(priority && priority !== 'all' ? [{ priority }] : [])
        ]
      }
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          church: {
            select: { name: true }
          },
          creator: {
            select: { name: true }
          }
        }
      }),
      prisma.notification.count({
        where: whereClause
      })
    ])

    // Also get unread count for the user
    const unreadCount = await prisma.notification.count({
      where: {
        ...whereClause,
        isRead: false
      }
    })

    return NextResponse.json({
      notifications,
      totalCount,
      unreadCount,
      hasMore: offset + notifications.length < totalCount
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Create new notification (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Check if user has permission to create notifications
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para crear notificaciones' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = notificationSchema.parse(body)

    // Validate targetUser exists in the same church if specified
    if (validatedData.targetUser) {
      const targetUser = await prisma.user.findUnique({
        where: { id: validatedData.targetUser },
        select: { churchId: true }
      })

      if (!targetUser || targetUser.churchId !== user.churchId) {
        return NextResponse.json({ error: 'Usuario objetivo no encontrado en esta iglesia' }, { status: 400 })
      }
    }

    const notification = await prisma.notification.create({
      data: {
        ...validatedData,
        churchId: user.churchId,
      },
      include: {
        church: {
          select: { name: true }
        }
      }
    })

    // TODO: Add real-time notification delivery (WebSocket/SSE)
    // This would be implemented in a separate WebSocket service

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    const body = await request.json()
    const { notificationIds, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all user's notifications as read
      await prisma.notification.updateMany({
        where: {
          churchId: user.churchId,
          OR: [
            { isGlobal: true },
            { targetUser: user.id },
            { targetRole: user.role },
          ],
          isRead: false
        },
        data: {
          isRead: true,
          updatedAt: new Date()
        }
      })
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          churchId: user.churchId,
          OR: [
            { isGlobal: true },
            { targetUser: user.id },
            { targetRole: user.role },
          ]
        },
        data: {
          isRead: true,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
