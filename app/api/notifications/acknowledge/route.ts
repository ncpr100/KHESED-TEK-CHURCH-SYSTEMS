
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const acknowledgeSchema = z.object({
  notificationId: z.string()
})

// POST - Acknowledge notification as read
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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    const body = await request.json()
    const { notificationId } = acknowledgeSchema.parse(body)

    // Mark notification as read
    const updatedNotification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        OR: [
          { targetUser: user.id },
          ...(user.churchId ? [{ 
            isGlobal: true,
            churchId: user.churchId 
          }] : []),
          ...(user.churchId ? [{ 
            targetRole: user.role,
            churchId: user.churchId 
          }] : [])
        ]
      },
      data: {
        isRead: true
      }
    })

    if (updatedNotification.count === 0) {
      return NextResponse.json({ error: 'Notificación no encontrada o sin permisos' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      acknowledged: true
    })

  } catch (error) {
    console.error('Error acknowledging notification:', error)
    
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
