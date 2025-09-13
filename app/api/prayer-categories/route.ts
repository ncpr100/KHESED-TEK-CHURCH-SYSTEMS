
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-categories - List prayer categories for a church
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { church: true }
    })

    if (!user?.churchId || !user.church) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    const categories = await prisma.prayerCategory.findMany({
      where: {
        churchId: user.churchId,
        isActive: true
      },
      include: {
        responseTemplates: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            isDefault: true
          }
        },
        _count: {
          select: {
            requests: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching prayer categories:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/prayer-categories - Create new prayer category
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { church: true }
    })

    if (!user?.churchId || !user.church) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    // Check user permissions (PASTOR or above)
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, icon, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    // Check if category already exists
    const existing = await prisma.prayerCategory.findFirst({
      where: {
        churchId: user.churchId,
        name: name.trim()
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Categoría ya existe' }, { status: 409 })
    }

    const category = await prisma.prayerCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        icon: icon?.trim(),
        color: color?.trim(),
        churchId: user.churchId
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error creating prayer category:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
