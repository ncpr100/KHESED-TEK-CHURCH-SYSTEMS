

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get events analytics
    const totalEvents = await prisma.event.count({
      where: { churchId: session.user.churchId }
    })

    const activeEvents = await prisma.event.count({
      where: { 
        churchId: session.user.churchId,
        startDate: { gte: new Date() }
      }
    })

    const completedEvents = await prisma.event.count({
      where: { 
        churchId: session.user.churchId,
        endDate: { lt: new Date() }
      }
    })

    // Mock analytics data - in a real implementation, you'd calculate from actual data
    const analyticsData = {
      totalEvents,
      activeEvents,
      completedEvents,
      totalAttendees: totalEvents * 25, // Mock calculation
      averageAttendance: 25.5,
      totalDonations: totalEvents * 150, // Mock calculation
      volunteerParticipation: 85.2,
      monthlyTrends: [
        { month: 'Enero', events: 4, attendance: 120, donations: 600 },
        { month: 'Febrero', events: 3, attendance: 95, donations: 450 },
        { month: 'Marzo', events: 5, attendance: 140, donations: 750 },
        { month: 'Abril', events: 4, attendance: 110, donations: 520 },
        { month: 'Mayo', events: 6, attendance: 160, donations: 800 },
        { month: 'Junio', events: 3, attendance: 85, donations: 420 }
      ]
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Error fetching events analytics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

