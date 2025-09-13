
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PushNotificationService, PushNotificationPayload } from '@/lib/push-notifications'
import { z } from 'zod'

const sendNotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  tag: z.string().optional(),
  url: z.string().optional(),
  actionUrl: z.string().optional(),
  actions: z.array(z.object({
    action: z.string(),
    title: z.string(),
    icon: z.string().optional()
  })).optional(),
  requireInteraction: z.boolean().optional(),
  silent: z.boolean().optional(),
  data: z.record(z.any()).optional(),
  // Targeting options
  targetType: z.enum(['user', 'users', 'church', 'role']),
  targetIds: z.array(z.string()).optional(), // For users
  targetRole: z.string().optional(), // For role targeting
  churchId: z.string().optional() // For church-wide (admin only)
})

// POST - Send push notification
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

    // Check permissions for sending push notifications
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para enviar notificaciones' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = sendNotificationSchema.parse(body)

    const {
      targetType,
      targetIds,
      targetRole,
      churchId,
      ...notificationPayload
    } = validatedData

    // Create push notification payload
    const payload: PushNotificationPayload = {
      ...notificationPayload,
      icon: notificationPayload.icon || '/icons/icon-192.png',
      badge: notificationPayload.badge || '/icons/badge-72.png'
    }

    let result: { success: number; failed: number; totalUsers?: number }

    // Send notification based on target type
    switch (targetType) {
      case 'user':
        if (!targetIds || targetIds.length !== 1) {
          return NextResponse.json({ error: 'Se requiere exactamente un ID de usuario' }, { status: 400 })
        }
        result = await PushNotificationService.sendToUser(targetIds[0], payload)
        result.totalUsers = 1
        break

      case 'users':
        if (!targetIds || targetIds.length === 0) {
          return NextResponse.json({ error: 'Se requiere al menos un ID de usuario' }, { status: 400 })
        }
        result = await PushNotificationService.sendToUsers(targetIds, payload)
        break

      case 'role':
        if (!targetRole) {
          return NextResponse.json({ error: 'Se requiere especificar el rol objetivo' }, { status: 400 })
        }
        result = await PushNotificationService.sendToRole(user.churchId, targetRole, payload)
        break

      case 'church':
        // Only super admins can send church-wide notifications
        if (user.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ error: 'Solo super administradores pueden enviar notificaciones a toda la iglesia' }, { status: 403 })
        }
        const targetChurchId = churchId || user.churchId
        result = await PushNotificationService.sendToChurch(targetChurchId, payload)
        break

      default:
        return NextResponse.json({ error: 'Tipo de objetivo inválido' }, { status: 400 })
    }

    // Log the notification send
    await prisma.pushNotificationLog.create({
      data: {
        churchId: user.churchId,
        title: payload.title,
        body: payload.body,
        payload: payload as any,
        status: result.success > 0 ? 'SENT' : 'FAILED',
        deliveryAttempts: 1,
        lastAttempt: new Date()
      }
    })

    console.log(`📨 Push notification sent - Success: ${result.success}, Failed: ${result.failed}`)

    return NextResponse.json({
      success: true,
      message: `Notificación enviada exitosamente a ${result.success} dispositivos`,
      stats: result
    })

  } catch (error) {
    console.error('Error sending push notification:', error)
    
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
