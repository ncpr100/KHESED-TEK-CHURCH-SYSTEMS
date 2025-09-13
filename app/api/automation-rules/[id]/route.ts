
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: { id: string }
}

// GET /api/automation-rules/[id] - Get specific mock automation rule
export async function GET(request: NextRequest, { params }: RouteContext) {
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

    // Mock rules for demo
    const mockRules: Record<string, any> = {
      'rule_1': {
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
      'rule_2': {
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
      }
    }

    const rule = mockRules[params.id]
    if (!rule) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ rule })
  } catch (error) {
    console.error('Error fetching automation rule:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/automation-rules/[id] - Update mock automation rule
export async function PUT(request: NextRequest, { params }: RouteContext) {
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

    // Check if rule exists in mock data
    const validIds = ['rule_1', 'rule_2', 'rule_3']
    if (!validIds.includes(params.id)) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 })
    }

    const updateData = await request.json()

    // If only updating isActive status
    if (Object.keys(updateData).length === 1 && 'isActive' in updateData) {
      return NextResponse.json({ 
        message: `Regla ${updateData.isActive ? 'activada' : 'desactivada'}` 
      })
    }

    // For demo purposes, return success message
    return NextResponse.json({
      rule: {
        id: params.id,
        name: updateData.name || 'Regla actualizada',
        description: updateData.description || '',
        isActive: Boolean(updateData.isActive),
        triggerType: updateData.triggerType || 'approval',
        triggerConditions: updateData.triggerConditions || {},
        actions: updateData.actions || [],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating automation rule:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/automation-rules/[id] - Delete mock automation rule
export async function DELETE(request: NextRequest, { params }: RouteContext) {
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

    // Check if rule exists in mock data
    const validIds = ['rule_1', 'rule_2', 'rule_3']
    if (!validIds.includes(params.id)) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Regla eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting automation rule:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
