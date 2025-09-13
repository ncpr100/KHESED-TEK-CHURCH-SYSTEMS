
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: {
    id: string
  }
}

const notificationTemplateUpdateSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').optional(),
  description: z.string().optional(),
  category: z.enum(['EVENT', 'DONATION', 'COMMUNICATION', 'SYSTEM', 'CUSTOM']).optional(),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  titleTemplate: z.string().min(1, 'Plantilla de título es requerida').optional(),
  messageTemplate: z.string().min(1, 'Plantilla de mensaje es requerida').optional(),
  actionLabel: z.string().optional(),
  defaultTargetRole: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET - Get specific notification template
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    const template = await prisma.notificationTemplate.findFirst({
      where: {
        id: params.id,
        OR: [
          { churchId: user.churchId },
          { churchId: null, isSystem: true } // Global system templates
        ]
      },
      include: {
        church: {
          select: { name: true }
        }
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching notification template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Update notification template
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Check if user has permission to update templates
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para actualizar plantillas' }, { status: 403 })
    }

    // Verify template exists and belongs to user's church (or is not a system template)
    const existingTemplate = await prisma.notificationTemplate.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId, // Only church-specific templates can be edited
        isSystem: false // System templates cannot be edited
      }
    })

    if (!existingTemplate) {
      return NextResponse.json({ 
        error: 'Plantilla no encontrada o no se puede editar' 
      }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = notificationTemplateUpdateSchema.parse(body)

    // Check if new name conflicts with existing templates
    if (validatedData.name && validatedData.name !== existingTemplate.name) {
      const nameConflict = await prisma.notificationTemplate.findFirst({
        where: {
          name: validatedData.name,
          churchId: user.churchId,
          id: { not: params.id }
        }
      })

      if (nameConflict) {
        return NextResponse.json({ error: 'Ya existe una plantilla con ese nombre' }, { status: 400 })
      }
    }

    const updatedTemplate = await prisma.notificationTemplate.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        church: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error updating notification template:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Delete notification template
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Check if user has permission to delete templates
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para eliminar plantillas' }, { status: 403 })
    }

    // Verify template exists and can be deleted
    const template = await prisma.notificationTemplate.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId,
        isSystem: false // System templates cannot be deleted
      }
    })

    if (!template) {
      return NextResponse.json({ 
        error: 'Plantilla no encontrada o no se puede eliminar' 
      }, { status: 404 })
    }

    await prisma.notificationTemplate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
