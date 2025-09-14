import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { gmailService } from '@/lib/integrations/gmail'
import { communicationService } from '@/lib/integrations/communication'

// GET - List tickets (with filtering and pagination)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const category = searchParams.get('category')
    const skip = (page - 1) * limit

    // Build where clause based on user role
    let where: any = {}

    if (session.user.role === 'SUPER_ADMIN') {
      // SUPER_ADMIN can see all tickets
      if (status) where.status = status
      if (priority) where.priority = priority
      if (category) where.category = category
    } else {
      // Regular users can only see their own tickets
      where.createdById = session.user.id
      if (status) where.status = status
      if (priority) where.priority = priority
      if (category) where.category = category
    }

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          church: {
            select: { id: true, name: true }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.supportTicket.count({ where })
    ])

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Error al obtener tickets' },
      { status: 500 }
    )
  }
}

// POST - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subject, category, priority = 'normal', description } = body

    // Validate required fields
    if (!subject || !category || !description) {
      return NextResponse.json(
        { error: 'Asunto, categoría y descripción son obligatorios' },
        { status: 400 }
      )
    }

    // Create the ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        category,
        priority,
        description,
        createdById: session.user.id,
        churchId: session.user.churchId // Associate with user's church if applicable
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        church: {
          select: { id: true, name: true }
        }
      }
    })

    // Send notification email to support team
    try {
      const supportEmail = process.env.SUPPORT_EMAIL || 'soporte@khesedtek.com'
      const emailMessage = {
        to: supportEmail,
        subject: `[TICKET #${ticket.ticketNumber}] ${ticket.subject}`,
        html: `
          <h2>Nuevo Ticket de Soporte</h2>
          <p><strong>Ticket #:</strong> ${ticket.ticketNumber}</p>
          <p><strong>Asunto:</strong> ${ticket.subject}</p>
          <p><strong>Categoría:</strong> ${ticket.category}</p>
          <p><strong>Prioridad:</strong> ${ticket.priority}</p>
          <p><strong>Creado por:</strong> ${ticket.createdBy.name} (${ticket.createdBy.email})</p>
          ${ticket.church ? `<p><strong>Iglesia:</strong> ${ticket.church.name}</p>` : ''}
          <p><strong>Descripción:</strong></p>
          <p>${ticket.description.replace(/\n/g, '<br>')}</p>
          
          <hr>
          <p>Responda a este email para comunicarse directamente con el usuario.</p>
        `,
        text: `
Nuevo Ticket de Soporte

Ticket #: ${ticket.ticketNumber}
Asunto: ${ticket.subject}
Categoría: ${ticket.category}
Prioridad: ${ticket.priority}
Creado por: ${ticket.createdBy.name} (${ticket.createdBy.email})
${ticket.church ? `Iglesia: ${ticket.church.name}` : ''}

Descripción:
${ticket.description}

---
Responda a este email para comunicarse directamente con el usuario.
        `
      }

      await communicationService.sendEmail(emailMessage)
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the ticket creation if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket creado exitosamente',
      ticket
    })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Error al crear ticket' },
      { status: 500 }
    )
  }
}