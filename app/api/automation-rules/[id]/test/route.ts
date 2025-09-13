
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: { id: string }
}

// POST /api/automation-rules/[id]/test - Test mock automation rule
export async function POST(request: NextRequest, { params }: RouteContext) {
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

    // Mock rules data
    const mockRules: Record<string, any> = {
      'rule_1': {
        triggerType: 'approval',
        actions: [{ type: 'send_message' }],
        isActive: true
      },
      'rule_2': {
        triggerType: 'priority',
        actions: [{ type: 'send_message' }, { type: 'create_followup' }],
        isActive: true
      },
      'rule_3': {
        triggerType: 'scheduled',
        actions: [{ type: 'send_message' }],
        isActive: false
      }
    }

    const rule = mockRules[params.id]
    if (!rule) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 })
    }

    if (!rule.isActive) {
      return NextResponse.json({ error: 'No se puede probar una regla inactiva' }, { status: 400 })
    }

    // Simulate rule execution based on trigger type
    let testMessage = ''
    switch (rule.triggerType) {
      case 'approval':
        testMessage = 'Regla se ejecutaría al aprobar una petición de oración'
        break
      case 'time_delay':
        testMessage = 'Regla se ejecutaría 120 minutos después del disparador'
        break
      case 'scheduled':
        testMessage = 'Regla se ejecutaría diariamente a las 09:00'
        break
      case 'priority':
        testMessage = 'Regla se ejecutaría basada en el nivel de prioridad configurado'
        break
      default:
        testMessage = 'Regla ejecutada en modo de prueba'
    }

    const messagesCreated = rule.actions.filter((action: any) => action.type === 'send_message').length

    return NextResponse.json({
      message: `${testMessage}. ${messagesCreated > 0 ? `Se crearían ${messagesCreated} mensaje(s).` : ''}`,
      execution: {
        id: `exec_${Date.now()}`,
        success: true,
        executionTime: Math.floor(Math.random() * 2000) + 500,
        result: {
          message: 'Prueba ejecutada exitosamente',
          actionsExecuted: rule.actions.length,
          testMode: true
        }
      }
    })
  } catch (error) {
    console.error('Error testing automation rule:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor durante la prueba' },
      { status: 500 }
    )
  }
}
