import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get ticket details with messages
export async function GET(
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

    // Build where clause based on user role
    let where: any = { id: ticketId }

    if (session.user.role !== 'SUPER_ADMIN') {
      // Regular users can only see their own tickets
      where.createdById = session.user.id
    }

    const ticket = await prisma.supportTicket.findFirst({
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
        messages: {
          include: {
            sentBy: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: {
          include: {
            uploadedBy: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Error al obtener ticket' },
      { status: 500 }
    )
  }
}

// PUT - Update ticket (status, assignment, etc.)
export async function PUT(
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
    const { status, assignedToId, priority, resolution } = body

    // Check if user has permission to update this ticket
    const existingTicket = await prisma.supportTicket.findFirst({
      where: { id: ticketId },
      include: {
        createdBy: { select: { id: true } }
      }
    })

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket no encontrado' },
        { status: 404 }
      )
    }

    // SUPER_ADMIN can update any ticket, users can only update their own tickets (limited fields)
    const canUpdateAll = session.user.role === 'SUPER_ADMIN'
    const isOwner = existingTicket.createdBy.id === session.user.id

    if (!canUpdateAll && !isOwner) {
      return NextResponse.json(
        { error: 'No autorizado para modificar este ticket' },
        { status: 403 }
      )
    }

    // Build update data based on permissions
    let updateData: any = {}

    if (canUpdateAll) {
      // SUPER_ADMIN can update all fields
      if (status !== undefined) updateData.status = status
      if (assignedToId !== undefined) updateData.assignedToId = assignedToId
      if (priority !== undefined) updateData.priority = priority
      if (resolution !== undefined) updateData.resolution = resolution
      
      // Auto-set resolvedAt when status changes to resolved/closed
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date()
      }
    } else if (isOwner) {
      // Regular users can only update priority and add resolution notes
      if (priority !== undefined) updateData.priority = priority
      // Users cannot change status or assignment
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      message: 'Ticket actualizado exitosamente',
      ticket: updatedTicket
    })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Error al actualizar ticket' },
      { status: 500 }
    )
  }
}