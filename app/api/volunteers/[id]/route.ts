

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET single volunteer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const volunteer = await db.volunteer.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      },
      include: {
        member: true,
        ministry: true,
        assignments: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    })

    if (!volunteer) {
      return NextResponse.json(
        { message: 'Voluntario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(volunteer)

  } catch (error) {
    console.error('Error fetching volunteer:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// UPDATE volunteer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      skills,
      availability,
      ministryId,
      isActive
    } = await request.json()

    const volunteer = await db.volunteer.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!volunteer) {
      return NextResponse.json(
        { message: 'Voluntario no encontrado' },
        { status: 404 }
      )
    }

    const updatedVolunteer = await db.volunteer.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        skills: skills ? JSON.stringify(skills) : null,
        availability: availability ? JSON.stringify(availability) : null,
        ministryId,
        isActive
      },
      include: {
        member: true,
        ministry: true,
        assignments: true
      }
    })

    return NextResponse.json(updatedVolunteer)

  } catch (error) {
    console.error('Error updating volunteer:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE volunteer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const volunteer = await db.volunteer.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!volunteer) {
      return NextResponse.json(
        { message: 'Voluntario no encontrado' },
        { status: 404 }
      )
    }

    // Soft delete
    await db.volunteer.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Voluntario eliminado exitosamente' })

  } catch (error) {
    console.error('Error deleting volunteer:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

