
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  template: z.any() // The full automation rule structure
})

// GET - Get automation templates
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

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {
      isActive: true
    }

    if (category) {
      where.category = category
    }

    const templates = await prisma.automationTemplate.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' }, // System templates first
        { usageCount: 'desc' }, // Most used templates next
        { createdAt: 'desc' }
      ],
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Get categories for filtering
    const categories = await prisma.automationTemplate.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        category: true
      }
    })

    return NextResponse.json({
      templates,
      categories: categories.map((cat: any) => ({
        name: cat.category,
        count: cat._count.category
      }))
    })

  } catch (error) {
    console.error('Error fetching automation templates:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Create automation template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    // Only admins can create templates
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para crear plantillas' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createTemplateSchema.parse(body)

    const template = await prisma.automationTemplate.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        category: validatedData.category,
        template: validatedData.template,
        createdBy: user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(template, { status: 201 })

  } catch (error) {
    console.error('Error creating automation template:', error)
    
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
