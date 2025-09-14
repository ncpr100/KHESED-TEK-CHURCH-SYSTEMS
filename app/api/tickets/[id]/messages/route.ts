import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { communicationService } from '@/lib/integrations/communication'

// POST - Send message in ticket (with email notification)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const ticketId = params.id
    const body = await request.json()
    const { message } = body

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      )
    }

    // Check if user has access to this ticket
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        },
        church: {
          select: { id: true, name: true }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    // Check permissions
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN'
    const isTicketOwner = ticket.createdBy.id === session.user.id
    const isAssignedSupport = ticket.assignedTo?.id === session.user.id

    if (!isSuperAdmin && !isTicketOwner && !isAssignedSupport) {
      return NextResponse.json(
        { error: 'No autorizado para enviar mensajes en este ticket' },
        { status: 403 }
      )
    }

    // Create the message
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        message: message.trim(),
        sentById: session.user.id,
        isFromSupport: isSuperAdmin || isAssignedSupport
      },
      include: {
        sentBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    })

    // Update ticket status if it was closed and a new message is added
    if (ticket.status === 'closed') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'open' }
      })
    }

    // Send email notification
    try {
      const isFromSupport = isSuperAdmin || isAssignedSupport
      let recipientEmail: string
      let emailSubject: string

      if (isFromSupport) {
        // Support is responding to user
        recipientEmail = ticket.createdBy.email
        emailSubject = `[TICKET #${ticket.ticketNumber}] Respuesta de Soporte: ${ticket.subject}`
      } else {
        // User is responding - notify support
        recipientEmail = process.env.SUPPORT_EMAIL || 'soporte@khesedtek.com'
        emailSubject = `[TICKET #${ticket.ticketNumber}] Nueva respuesta: ${ticket.subject}`
      }

      const emailMessage = {
        to: recipientEmail,
        subject: emailSubject,
        html: `
          <h2>Nuevo mensaje en Ticket #${ticket.ticketNumber}</h2>
          <p><strong>Asunto:</strong> ${ticket.subject}</p>
          <p><strong>De:</strong> ${ticketMessage.sentBy.name} (${ticketMessage.sentBy.email})</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          <hr>
          <p><strong>Información del Ticket:</strong></p>
          <ul>
            <li>Número: ${ticket.ticketNumber}</li>
            <li>Estado: ${ticket.status}</li>
            <li>Prioridad: ${ticket.priority}</li>
            <li>Categoría: ${ticket.category}</li>
            ${ticket.church ? `<li>Iglesia: ${ticket.church.name}</li>` : ''}
          </ul>
          
          <p>Responda a este email para continuar la conversación.</p>
        `,
        text: `
Nuevo mensaje en Ticket #${ticket.ticketNumber}

Asunto: ${ticket.subject}
De: ${ticketMessage.sentBy.name} (${ticketMessage.sentBy.email})

Mensaje:
${message}

---
Información del Ticket:
- Número: ${ticket.ticketNumber}
- Estado: ${ticket.status}
- Prioridad: ${ticket.priority}
- Categoría: ${ticket.category}
${ticket.church ? `- Iglesia: ${ticket.church.name}` : ''}

Responda a este email para continuar la conversación.
        `
      }

      const emailResult = await communicationService.sendEmail(emailMessage)
      
      if (emailResult.success && emailResult.messageId) {
        // Update the ticket message with the email message ID for tracking
        await prisma.ticketMessage.update({
          where: { id: ticketMessage.id },
          data: { emailMessageId: emailResult.messageId }
        })
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the message creation if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      ticketMessage
    })
  } catch (error) {
    console.error('Error sending ticket message:', error)
    return NextResponse.json(
      { error: 'Error al enviar mensaje' },
      { status: 500 }
    )
  }
}