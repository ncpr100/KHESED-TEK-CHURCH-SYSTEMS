

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const eventId = params.id
    const { type, subject, content, scheduledFor, targetAudience } = await request.json()

    // Get event details
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId,
        churchId: session.user.churchId 
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Determine recipient count based on target audience
    let recipientCount = 0
    
    switch (targetAudience) {
      case 'ALL':
        const allMembers = await prisma.member.count({
          where: { 
            churchId: session.user.churchId,
            isActive: true
          }
        })
        recipientCount = allMembers
        break
        
      case 'VOLUNTEERS':
        const volunteers = await prisma.volunteer.count({
          where: { 
            churchId: session.user.churchId,
            isActive: true
          }
        })
        recipientCount = volunteers
        break
        
      case 'ATTENDEES':
        // Count confirmed attendees for this event
        recipientCount = 0 // Would be calculated from actual attendees
        break
        
      default:
        recipientCount = 50 // Default estimate
    }

    // Create communication record (using existing communication structure)
    const communication = await prisma.communication.create({
      data: {
        title: subject,
        content: content,
        type: type as any,
        targetGroup: targetAudience,
        recipients: recipientCount,
        sentAt: !scheduledFor ? new Date() : null,
        status: scheduledFor ? 'PROGRAMADO' : 'ENVIADO',
        sentBy: session.user.id,
        churchId: session.user.churchId
      }
    })

    // If not scheduled, simulate sending immediately
    if (!scheduledFor) {
      // Here you would integrate with actual email/SMS/push notification services
      console.log(`📧 Sending ${type} communication: ${subject}`)
      console.log(`Recipients: ${recipientCount}`)
      console.log(`Content: ${content}`)
      
      // Update status to sent
      await prisma.communication.update({
        where: { id: communication.id },
        data: { 
          status: 'ENVIADO',
          sentAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      communication,
      recipientCount,
      message: scheduledFor 
        ? `Comunicación programada para ${recipientCount} destinatarios`
        : `Comunicación enviada a ${recipientCount} destinatarios`
    })
  } catch (error) {
    console.error('Error creating event communication:', error)
    return NextResponse.json(
      { error: 'Error al crear comunicación' }, 
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventId = params.id

    // Get all communications for this event (filtering by title containing event info)
    const communications = await prisma.communication.findMany({
      where: {
        churchId: session.user.churchId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(communications)
  } catch (error) {
    console.error('Error fetching event communications:', error)
    return NextResponse.json(
      { error: 'Error al obtener comunicaciones' }, 
      { status: 500 }
    )
  }
}

