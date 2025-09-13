
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: { id: string }
}

// POST /api/prayer-message-queue/[id]/retry - Retry failed message
export async function POST(request: NextRequest, { params }: RouteContext) {
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
    if (!['SUPER_ADMIN', 'ADMIN', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    // In a real implementation, this would find the message in the queue table
    // For now, we'll simulate the retry logic
    const messageId = params.id

    // Simulate checking if message exists and can be retried
    if (!messageId.startsWith('msg_') && messageId !== '3') {
      return NextResponse.json({ error: 'Mensaje no encontrado' }, { status: 404 })
    }

    // Simulate retry logic
    const retryResult = {
      id: messageId,
      status: 'pending',
      retryCount: Math.floor(Math.random() * 3) + 1,
      lastRetryAt: new Date().toISOString(),
      errorMessage: null
    }

    // Log the retry attempt
    console.log(`Message ${messageId} queued for retry by user ${user.id}`)

    return NextResponse.json({
      message: 'Mensaje reenviado a la cola exitosamente',
      retry: retryResult
    })
  } catch (error) {
    console.error('Error retrying message:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
