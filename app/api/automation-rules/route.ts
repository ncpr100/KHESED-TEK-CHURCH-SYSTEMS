
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/automation-rules - Get mock automation rules for prayer wall demo
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { church: true }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 403 })
    }

    // Check permissions - only SUPER_ADMIN, ADMIN, PASTOR, LIDER can manage automation
    if (!['SUPER_ADMIN', 'ADMIN', 'PASTOR', 'LIDER'].includes(user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    // For demo purposes, return mock automation rules
    // In a production system, these would be stored in the database
    const mockRules = [
      {
        id: 'rule_1',
        name: 'Respuesta Automática - Familia',
        description: 'Envía respuesta automática cuando se aprueba una petición de la categoría familia',
        isActive: true,
        triggerType: 'approval',
        triggerConditions: {
          status: ['approved'],
          category: ['familia']
        },
        actions: [
          {
            type: 'send_message',
            config: {
              templateId: 'template_familia',
              messageType: 'email',
              delay: 120
            }
          }
        ],
        stats: {
          totalRuns: 24,
          successRuns: 23,
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          avgResponseTime: 2.1
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rule_2', 
        name: 'Seguimiento Urgente',
        description: 'Notificación inmediata para peticiones con prioridad urgente',
        isActive: true,
        triggerType: 'priority',
        triggerConditions: {
          priority: ['urgent']
        },
        actions: [
          {
            type: 'send_message',
            config: {
              templateId: 'template_urgente',
              messageType: 'all',
              delay: 0
            }
          },
          {
            type: 'create_followup',
            config: {
              assignTo: 'pastor',
              dueDate: 24
            }
          }
        ],
        stats: {
          totalRuns: 8,
          successRuns: 8,
          lastRun: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          avgResponseTime: 0.5
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rule_3',
        name: 'Recordatorio Programado',
        description: 'Envía mensajes de seguimiento todos los días a las 9:00 AM',
        isActive: false,
        triggerType: 'scheduled',
        triggerConditions: {
          scheduleTime: '09:00',
          frequency: 'daily'
        },
        actions: [
          {
            type: 'send_message',
            config: {
              templateId: 'template_recordatorio',
              messageType: 'email',
              delay: 0
            }
          }
        ],
        stats: {
          totalRuns: 45,
          successRuns: 42,
          lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          avgResponseTime: 1.8
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json({ rules: mockRules })
  } catch (error) {
    console.error('Error fetching automation rules:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/automation-rules - Create new mock automation rule
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { church: true }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 403 })
    }

    // Check permissions
    if (!['SUPER_ADMIN', 'ADMIN', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const {
      name,
      description,
      isActive,
      triggerType,
      triggerConditions,
      actions
    } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    if (!triggerType || !['approval', 'time_delay', 'scheduled', 'priority'].includes(triggerType)) {
      return NextResponse.json({ error: 'Tipo de disparador inválido' }, { status: 400 })
    }

    if (!actions || !Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json({ error: 'Al menos una acción es requerida' }, { status: 400 })
    }

    // For demo purposes, return mock created rule
    const mockRule = {
      id: `rule_${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || '',
      isActive: Boolean(isActive),
      triggerType,
      triggerConditions: triggerConditions || {},
      actions,
      stats: {
        totalRuns: 0,
        successRuns: 0,
        lastRun: null,
        avgResponseTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({ rule: mockRule })
  } catch (error) {
    console.error('Error creating automation rule:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
