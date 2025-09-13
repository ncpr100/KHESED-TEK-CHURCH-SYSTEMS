

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all volunteer assignments for a church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const volunteerId = searchParams.get('volunteerId')
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')

    const whereClause: any = {
      churchId: session.user.churchId
    }

    if (volunteerId) whereClause.volunteerId = volunteerId
    if (eventId) whereClause.eventId = eventId
    if (status) whereClause.status = status

    const assignments = await db.volunteerAssignment.findMany({
      where: whereClause,
      include: {
        volunteer: true,
        event: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(assignments)

  } catch (error) {
    console.error('Error fetching volunteer assignments:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new volunteer assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const {
      volunteerId,
      eventId,
      title,
      description,
      date,
      startTime,
      endTime,
      notes
    } = await request.json()

    if (!volunteerId || !title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { message: 'Campos requeridos: volunteerId, title, date, startTime, endTime' },
        { status: 400 }
      )
    }

    // Verify volunteer belongs to the church
    const volunteer = await db.volunteer.findFirst({
      where: {
        id: volunteerId,
        churchId: session.user.churchId
      }
    })

    if (!volunteer) {
      return NextResponse.json(
        { message: 'Voluntario no encontrado' },
        { status: 404 }
      )
    }

    const assignment = await db.volunteerAssignment.create({
      data: {
        volunteerId,
        eventId,
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        notes,
        churchId: session.user.churchId,
        status: 'ASIGNADO'
      },
      include: {
        volunteer: true,
        event: true
      }
    })

    return NextResponse.json(assignment, { status: 201 })

  } catch (error) {
    console.error('Error creating volunteer assignment:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

