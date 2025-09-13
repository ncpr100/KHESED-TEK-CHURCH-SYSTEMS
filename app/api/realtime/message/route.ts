
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const messageSchema = z.object({
  type: z.string(),
  data: z.any()
})

// POST - Send real-time message (status updates, page changes, etc.)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    const body = await request.json()
    const { type, data } = messageSchema.parse(body)

    // Log the message (in production, you might want to store or process this)
    console.log(`📡 Real-time message from ${user.name}: ${type}`, data)

    // For now, we just acknowledge the message
    // In a full implementation, you might:
    // - Update user status in database
    // - Broadcast presence updates to other users
    // - Log activity for analytics

    switch (type) {
      case 'status-change':
        console.log(`User ${user.name} changed status to: ${data.status}`)
        break
      case 'page-change':
        console.log(`User ${user.name} navigated to: ${data.page}`)
        break
      default:
        console.log(`Unknown message type: ${type}`)
    }

    return NextResponse.json({
      success: true,
      acknowledged: true,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Error processing real-time message:', error)
    
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
