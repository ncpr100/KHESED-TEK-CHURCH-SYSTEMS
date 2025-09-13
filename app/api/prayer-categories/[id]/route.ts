
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-categories/[id] - Get single prayer category
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const category = await prisma.prayerCategory.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      },
      include: {
        responseTemplates: {
          where: { isActive: true },
          orderBy: { isDefault: 'desc' }
        },
        _count: {
          select: {
            requests: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error fetching prayer category:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/prayer-categories/[id] - Update prayer category
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { name, description, icon, color, isActive } = body

    const category = await prisma.prayerCategory.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Check for duplicate name if changed
    if (name && name !== category.name) {
      const existing = await prisma.prayerCategory.findFirst({
        where: {
          churchId: user.churchId,
          name: name.trim(),
          id: { not: params.id }
        }
      })

      if (existing) {
        return NextResponse.json({ error: 'Nombre ya existe' }, { status: 409 })
      }
    }

    const updatedCategory = await prisma.prayerCategory.update({
      where: { id: params.id },
      data: {
        name: name?.trim() || category.name,
        description: description?.trim(),
        icon: icon?.trim(),
        color: color?.trim(),
        isActive: isActive ?? category.isActive
      }
    })

    return NextResponse.json({ category: updatedCategory })
  } catch (error) {
    console.error('Error updating prayer category:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/prayer-categories/[id] - Delete prayer category
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const category = await prisma.prayerCategory.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Check if category has prayer requests
    const requestCount = await prisma.prayerRequest.count({
      where: { categoryId: params.id }
    })

    if (requestCount > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar. La categoría tiene peticiones asociadas' 
      }, { status: 409 })
    }

    await prisma.prayerCategory.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Categoría eliminada' })
  } catch (error) {
    console.error('Error deleting prayer category:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
