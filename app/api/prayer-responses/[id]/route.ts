
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-responses/[id] - Get single prayer response template
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

    const template = await prisma.prayerResponseTemplate.findFirst({
      where: {
        id: params.id,
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

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching prayer response template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/prayer-responses/[id] - Update prayer response template
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
    const { title, message, smsMessage, isDefault, isActive } = body

    const template = await prisma.prayerResponseTemplate.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    // If setting as default, unset other defaults for this category
    if (isDefault && !template.isDefault) {
      await prisma.prayerResponseTemplate.updateMany({
        where: {
          categoryId: template.categoryId,
          churchId: user.churchId,
          isDefault: true,
          id: { not: params.id }
        },
        data: { isDefault: false }
      })
    }

    const updatedTemplate = await prisma.prayerResponseTemplate.update({
      where: { id: params.id },
      data: {
        title: title?.trim() || template.title,
        message: message?.trim() || template.message,
        smsMessage: smsMessage?.trim(),
        isDefault: isDefault ?? template.isDefault,
        isActive: isActive ?? template.isActive
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

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    console.error('Error updating prayer response template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/prayer-responses/[id] - Delete prayer response template
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

    const template = await prisma.prayerResponseTemplate.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    await prisma.prayerResponseTemplate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Plantilla eliminada' })
  } catch (error) {
    console.error('Error deleting prayer response template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
