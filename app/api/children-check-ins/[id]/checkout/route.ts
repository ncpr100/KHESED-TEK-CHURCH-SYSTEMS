

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Check out a child
export async function POST(
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

    const childCheckIn = await db.childCheckIn.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!childCheckIn) {
      return NextResponse.json(
        { message: 'Check-in de niño no encontrado' },
        { status: 404 }
      )
    }

    if (childCheckIn.checkedOut) {
      return NextResponse.json(
        { message: 'El niño ya fue retirado' },
        { status: 400 }
      )
    }

    const updatedCheckIn = await db.childCheckIn.update({
      where: { id: params.id },
      data: {
        checkedOut: true,
        checkedOutAt: new Date(),
        checkedOutBy: session.user.id
      },
      include: {
        event: true
      }
    })

    return NextResponse.json(updatedCheckIn)

  } catch (error) {
    console.error('Error checking out child:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

