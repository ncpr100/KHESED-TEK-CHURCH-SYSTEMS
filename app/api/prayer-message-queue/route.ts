
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/prayer-message-queue - Get message queue for the church
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
    const status = url.searchParams.get('status')
    const messageType = url.searchParams.get('messageType')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    
    const where: any = {
      churchId: user.churchId
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (messageType && messageType !== 'all') {
      where.messageType = messageType
    }

    // For demo purposes, we'll create some mock message queue entries
    // In a real implementation, this would come from a proper message queue table
    const mockMessages = [
      {
        id: '1',
        prayerRequestId: 'req1',
        contactId: 'contact1',
        messageType: 'email' as const,
        content: {
          subject: 'Respuesta a tu petición de oración',
          body: 'Estimado hermano/a, hemos recibido tu petición de oración...'
        },
        status: 'pending' as const,
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        retryCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        prayerRequestId: 'req2',
        contactId: 'contact2',
        messageType: 'sms' as const,
        content: {
          body: 'Gracias por tu petición de oración. Estaremos orando por ti.'
        },
        status: 'sent' as const,
        sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        deliveryConfirmation: {
          delivered: true,
          readAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        retryCount: 0,
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        prayerRequestId: 'req3',
        contactId: 'contact3',
        messageType: 'whatsapp' as const,
        content: {
          body: 'Paz del Señor. Recibimos tu petición de oración sobre tu familia. Estaremos intercediendo por ustedes.'
        },
        status: 'failed' as const,
        errorMessage: 'Número de WhatsApp no disponible',
        retryCount: 2,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Filter mock messages based on criteria
    let filteredMessages = mockMessages
    if (status && status !== 'all') {
      filteredMessages = mockMessages.filter(m => m.status === status)
    }
    if (messageType && messageType !== 'all') {
      filteredMessages = mockMessages.filter(m => m.messageType === messageType)
    }

    return NextResponse.json({ 
      messages: filteredMessages.slice(0, limit)
    })
  } catch (error) {
    console.error('Error fetching message queue:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/prayer-message-queue - Add message to queue
export async function POST(request: NextRequest) {
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

    const {
      prayerRequestId,
      contactId,
      messageType,
      content,
      scheduledAt,
      automationRuleId
    } = await request.json()

    if (!prayerRequestId || !contactId || !messageType || !content) {
      return NextResponse.json(
        { error: 'Campos requeridos: prayerRequestId, contactId, messageType, content' },
        { status: 400 }
      )
    }

    if (!['email', 'sms', 'whatsapp'].includes(messageType)) {
      return NextResponse.json(
        { error: 'Tipo de mensaje inválido' },
        { status: 400 }
      )
    }

    // Verify the prayer request exists and belongs to this church
    const prayerRequest = await prisma.prayerRequest.findFirst({
      where: {
        id: prayerRequestId,
        churchId: user.churchId
      }
    })

    if (!prayerRequest) {
      return NextResponse.json(
        { error: 'Petición de oración no encontrada' },
        { status: 404 }
      )
    }

    // Verify the contact exists and belongs to this church
    const contact = await prisma.prayerContact.findFirst({
      where: {
        id: contactId,
        churchId: user.churchId
      }
    })

    if (!contact) {
      return NextResponse.json(
        { error: 'Contacto no encontrado' },
        { status: 404 }
      )
    }

    // In a real implementation, you would add to a proper message queue table
    // For now, we'll return a success response
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      message: {
        id: messageId,
        prayerRequestId,
        contactId,
        messageType,
        content,
        status: scheduledAt ? 'scheduled' : 'pending',
        scheduledAt,
        automationRuleId,
        retryCount: 0,
        createdAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error adding message to queue:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
