
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PushNotificationService } from '@/lib/push-notifications'
import { z } from 'zod'

const unsubscribeSchema = z.object({
  endpoint: z.string().url()
})

// POST - Unsubscribe from push notifications
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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    const body = await request.json()
    const { endpoint } = unsubscribeSchema.parse(body)

    // Remove subscription using the service
    await PushNotificationService.removeSubscription(user.id, endpoint)

    console.log(`✅ Push notification subscription removed for user ${user.id}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Suscripción a notificaciones push eliminada exitosamente' 
    })

  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    
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
