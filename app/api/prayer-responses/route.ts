
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-responses - List prayer response templates
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const templates = await prisma.prayerResponseTemplate.findMany({
      where: {
        churchId: user.churchId,
        isActive: true,
        ...(categoryId && { categoryId })
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { title: 'asc' }
      ]
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching prayer response templates:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/prayer-responses - Create new prayer response template
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    // Check user permissions (PASTOR or above)
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { categoryId, title, message, smsMessage, isDefault } = body

    if (!categoryId || !title || !message) {
      return NextResponse.json({ 
        error: 'Categoría, título y mensaje son requeridos' 
      }, { status: 400 })
    }

    // Verify category exists and belongs to church
    const category = await prisma.prayerCategory.findFirst({
      where: {
        id: categoryId,
        churchId: user.churchId,
        isActive: true
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // If setting as default, unset other defaults for this category
    if (isDefault) {
      await prisma.prayerResponseTemplate.updateMany({
        where: {
          categoryId,
          churchId: user.churchId,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }

    const template = await prisma.prayerResponseTemplate.create({
      data: {
        categoryId,
        title: title.trim(),
        message: message.trim(),
        smsMessage: smsMessage?.trim(),
        isDefault: !!isDefault,
        churchId: user.churchId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error creating prayer response template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
