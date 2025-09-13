

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// UPDATE visitor follow-up
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
      status,
      notes,
      assignedTo,
      scheduledAt,
      completedAt
    } = await request.json()

    const followUp = await db.visitorFollowUp.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!followUp) {
      return NextResponse.json(
        { message: 'Seguimiento no encontrado' },
        { status: 404 }
      )
    }

    const updatedFollowUp = await db.visitorFollowUp.update({
      where: { id: params.id },
      data: {
        status,
        notes,
        assignedTo,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : followUp.scheduledAt,
        completedAt: completedAt ? new Date(completedAt) : 
                    (status === 'COMPLETADO' ? new Date() : followUp.completedAt)
      },
      include: {
        checkIn: true,
        assignedUser: true
      }
    })

    return NextResponse.json(updatedFollowUp)

  } catch (error) {
    console.error('Error updating visitor follow-up:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

