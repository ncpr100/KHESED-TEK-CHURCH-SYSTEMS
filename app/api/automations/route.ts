
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const automations = await db.automation.findMany({
      where: {
        churchId: session.user.churchId
      },
      include: {
        executions: {
          orderBy: { executedAt: 'desc' },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(automations)
  } catch (error) {
    console.error('Error fetching automations:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, trigger, actions, conditions, isActive } = body

    if (!name || !trigger || !actions) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    const automation = await db.automation.create({
      data: {
        name,
        description,
        trigger,
        actions: JSON.stringify(actions),
        conditions: conditions ? JSON.stringify(conditions) : null,
        isActive: isActive !== undefined ? isActive : true,
        churchId: session.user.churchId
      }
    })

    return NextResponse.json(automation)
  } catch (error) {
    console.error('Error creating automation:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
