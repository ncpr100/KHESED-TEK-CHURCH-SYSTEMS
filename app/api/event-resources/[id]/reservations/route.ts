
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const whereClause: any = {
      resourceId: params.id,
      churchId: session.user.churchId,
      status: 'CONFIRMADA'
    }

    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const reservations = await db.eventResourceReservation.findMany({
      where: whereClause,
      include: {
        event: {
          select: { id: true, title: true }
        }
      },
      orderBy: { startTime: 'asc' }
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Error fetching resource reservations:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { eventId, startTime, endTime, notes } = body

    if (!eventId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    // Verificar que el recurso existe y pertenece a la iglesia
    const resource = await db.eventResource.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!resource) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 })
    }

    // Verificar disponibilidad del recurso
    const conflictingReservations = await db.eventResourceReservation.findMany({
      where: {
        resourceId: params.id,
        status: 'CONFIRMADA',
        OR: [
          {
            startTime: {
              lt: new Date(endTime)
            },
            endTime: {
              gt: new Date(startTime)
            }
          }
        ]
      }
    })

    if (conflictingReservations.length > 0) {
      return NextResponse.json({ 
        error: 'El recurso ya está reservado para este período' 
      }, { status: 409 })
    }

    const reservation = await db.eventResourceReservation.create({
      data: {
        resourceId: params.id,
        eventId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        notes,
        reservedBy: session.user.id!,
        churchId: session.user.churchId
      },
      include: {
        resource: true,
        event: {
          select: { id: true, title: true }
        }
      }
    })

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error creating resource reservation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
