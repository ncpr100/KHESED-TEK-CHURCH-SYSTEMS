
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/prayer-messaging-stats - Get messaging statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { church: true }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 403 })
    }

    // Check permissions
    if (!['SUPER_ADMIN', 'ADMIN', 'PASTOR', 'LIDER'].includes(user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')

    // In a real implementation, these stats would be calculated from actual message data
    // For now, we'll return mock statistics
    const stats = {
      totalSent: 156,
      deliveryRate: 94.2,
      responseRate: 23.7,
      avgDeliveryTime: 2.3,
      messagesByType: {
        email: 89,
        sms: 45,
        whatsapp: 22
      },
      messagesByStatus: {
        pending: 8,
        sent: 132,
        failed: 16
      },
      topTemplates: [
        {
          id: 'template1',
          name: 'Respuesta General - Familia',
          usageCount: 42,
          successRate: 96.8
        },
        {
          id: 'template2', 
          name: 'Respuesta - Salud',
          usageCount: 38,
          successRate: 94.2
        },
        {
          id: 'template3',
          name: 'Respuesta - Finanzas',
          usageCount: 31,
          successRate: 91.9
        },
        {
          id: 'template4',
          name: 'Respuesta Urgente',
          usageCount: 28,
          successRate: 89.3
        },
        {
          id: 'template5',
          name: 'Seguimiento Pastoral',
          usageCount: 17,
          successRate: 100.0
        }
      ]
    }

    // Calculate period-specific adjustments based on days parameter
    if (days <= 7) {
      // Recent period - lower totals but higher rates
      stats.totalSent = Math.floor(stats.totalSent * 0.2)
      stats.messagesByType.email = Math.floor(stats.messagesByType.email * 0.2)
      stats.messagesByType.sms = Math.floor(stats.messagesByType.sms * 0.2)
      stats.messagesByType.whatsapp = Math.floor(stats.messagesByType.whatsapp * 0.2)
      stats.messagesByStatus.sent = Math.floor(stats.messagesByStatus.sent * 0.2)
      stats.messagesByStatus.pending = Math.floor(stats.messagesByStatus.pending * 0.3)
      stats.messagesByStatus.failed = Math.floor(stats.messagesByStatus.failed * 0.15)
      stats.deliveryRate = Math.min(stats.deliveryRate + 2, 98)
    } else if (days >= 365) {
      // Long period - higher totals
      stats.totalSent = Math.floor(stats.totalSent * 12)
      stats.messagesByType.email = Math.floor(stats.messagesByType.email * 12)
      stats.messagesByType.sms = Math.floor(stats.messagesByType.sms * 12)
      stats.messagesByType.whatsapp = Math.floor(stats.messagesByType.whatsapp * 12)
      stats.messagesByStatus.sent = Math.floor(stats.messagesByStatus.sent * 12)
      stats.messagesByStatus.pending = Math.floor(stats.messagesByStatus.pending * 0.8)
      stats.messagesByStatus.failed = Math.floor(stats.messagesByStatus.failed * 11)
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching messaging stats:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
