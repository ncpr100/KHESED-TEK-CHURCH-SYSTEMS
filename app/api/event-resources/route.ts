
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const whereClause: any = {
      churchId: session.user.churchId,
      isActive: true
    }

    if (type) {
      whereClause.type = type
    }

    const resources = await db.eventResource.findMany({
      where: whereClause,
      include: {
        reservations: {
          where: {
            status: 'CONFIRMADA'
          },
          include: {
            event: {
              select: { title: true, startDate: true, endDate: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error('Error fetching event resources:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, type, capacity } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Nombre y tipo son requeridos' }, { status: 400 })
    }

    const resource = await db.eventResource.create({
      data: {
        name,
        description,
        type,
        capacity: capacity ? parseInt(capacity) : null,
        churchId: session.user.churchId
      }
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error('Error creating event resource:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
