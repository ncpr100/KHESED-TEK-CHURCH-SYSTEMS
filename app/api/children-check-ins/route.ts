

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all children check-ins for a church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const checkedOut = searchParams.get('checkedOut')
    const eventId = searchParams.get('eventId')
    const date = searchParams.get('date')

    const whereClause: any = {
      churchId: session.user.churchId
    }

    if (checkedOut === 'true') whereClause.checkedOut = true
    if (checkedOut === 'false') whereClause.checkedOut = false
    if (eventId) whereClause.eventId = eventId
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      whereClause.checkedInAt = {
        gte: startDate,
        lt: endDate
      }
    }

    const childrenCheckIns = await db.childCheckIn.findMany({
      where: whereClause,
      include: {
        event: true
      },
      orderBy: {
        checkedInAt: 'desc'
      }
    })

    return NextResponse.json(childrenCheckIns)

  } catch (error) {
    console.error('Error fetching children check-ins:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new child check-in
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const {
      childName,
      childAge,
      parentName,
      parentPhone,
      parentEmail,
      emergencyContact,
      emergencyPhone,
      allergies,
      specialNeeds,
      eventId
    } = await request.json()

    if (!childName || !parentName || !parentPhone) {
      return NextResponse.json(
        { message: 'Nombre del niño, nombre del padre y teléfono son requeridos' },
        { status: 400 }
      )
    }

    // Generate unique QR code that links to public check-in page
    const qrData = `CHILD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const qrUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/public/children-checkin/${qrData}`

    const childCheckIn = await db.childCheckIn.create({
      data: {
        childName,
        childAge,
        parentName,
        parentPhone,
        parentEmail,
        emergencyContact,
        emergencyPhone,
        allergies,
        specialNeeds,
        qrCode: qrData,
        eventId,
        churchId: session.user.churchId,
        checkedIn: true,
        checkedOut: false
      },
      include: {
        event: true
      }
    })

    return NextResponse.json({
      ...childCheckIn,
      qrUrl, // Include URL for QR code generation
      qrDisplayUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}&format=png`
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating child check-in:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

