
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notificationTemplateSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  category: z.enum(['EVENT', 'DONATION', 'COMMUNICATION', 'SYSTEM', 'CUSTOM']),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).default('INFO'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  titleTemplate: z.string().min(1, 'Plantilla de título es requerida'),
  messageTemplate: z.string().min(1, 'Plantilla de mensaje es requerida'),
  actionLabel: z.string().optional(),
  defaultTargetRole: z.string().optional(),
  isActive: z.boolean().default(true),
})

// GET - Get notification templates
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const whereClause: any = {
      OR: [
        { churchId: user.churchId }, // Church-specific templates
        { churchId: null, isSystem: true } // Global system templates
      ]
    }

    if (category) {
      whereClause.category = category
    }

    if (activeOnly) {
      whereClause.isActive = true
    }

    const templates = await prisma.notificationTemplate.findMany({
      where: whereClause,
      orderBy: [
        { isSystem: 'desc' }, // System templates first
        { name: 'asc' }
      ],
      include: {
        church: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching notification templates:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Create new notification template (Admin only)
export async function POST(request: NextRequest) {
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

    // Check if user has permission to create templates
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para crear plantillas' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = notificationTemplateSchema.parse(body)

    // Check if template name already exists for this church
    const existingTemplate = await prisma.notificationTemplate.findFirst({
      where: {
        name: validatedData.name,
        churchId: user.churchId
      }
    })

    if (existingTemplate) {
      return NextResponse.json({ error: 'Ya existe una plantilla con ese nombre' }, { status: 400 })
    }

    const template = await prisma.notificationTemplate.create({
      data: {
        ...validatedData,
        churchId: user.churchId,
        isSystem: false, // User-created templates are never system templates
      },
      include: {
        church: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating notification template:', error)
    
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
