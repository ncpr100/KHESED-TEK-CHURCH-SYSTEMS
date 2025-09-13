

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all volunteers for a church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const volunteers = await db.volunteer.findMany({
      where: {
        churchId: session.user.churchId,
        isActive: true
      },
      include: {
        member: true,
        ministry: true,
        assignments: {
          orderBy: {
            date: 'desc'
          },
          take: 10 // Limit to last 10 assignments for performance
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    return NextResponse.json(volunteers)

  } catch (error) {
    console.error('Error fetching volunteers:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new volunteer
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
      memberId,
      firstName,
      lastName,
      email,
      phone,
      skills,
      availability,
      ministryId
    } = await request.json()

    if (!firstName || !lastName) {
      return NextResponse.json(
        { message: 'Nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    const volunteer = await db.volunteer.create({
      data: {
        memberId,
        firstName,
        lastName,
        email,
        phone,
        skills: skills ? JSON.stringify(skills) : null,
        availability: availability ? JSON.stringify(availability) : null,
        ministryId,
        churchId: session.user.churchId,
        isActive: true
      },
      include: {
        member: true,
        ministry: true,
        assignments: true
      }
    })

    return NextResponse.json(volunteer, { status: 201 })

  } catch (error) {
    console.error('Error creating volunteer:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

