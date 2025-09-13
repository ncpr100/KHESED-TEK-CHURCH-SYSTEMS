
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PushNotificationService } from '@/lib/push-notifications'
import { z } from 'zod'

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string()
    })
  }),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    language: z.string().optional()
  }).optional()
})

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    const body = await request.json()
    const { subscription, deviceInfo } = subscribeSchema.parse(body)

    // Save subscription using the service
    await PushNotificationService.saveSubscription(
      user.id,
      user.churchId,
      subscription,
      deviceInfo
    )

    // Send welcome push notification
    try {
      await PushNotificationService.sendToUser(user.id, {
        title: '🔔 ¡Notificaciones Activadas!',
        body: 'Ahora recibirás notificaciones importantes de la iglesia.',
        icon: '/icons/icon-192.png',
        tag: 'welcome-push',
        url: '/settings/notifications',
        actions: [
          { action: 'view', title: 'Configurar', icon: '/icons/settings.png' },
          { action: 'dismiss', title: 'Cerrar' }
        ]
      })
    } catch (welcomeError) {
      console.error('Error sending welcome push notification:', welcomeError)
      // Don't fail the subscription if welcome notification fails
    }

    console.log(`✅ Push notification subscription created for user ${user.id}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Suscripción a notificaciones push creada exitosamente' 
    })

  } catch (error) {
    console.error('Error subscribing to push notifications:', error)
    
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
