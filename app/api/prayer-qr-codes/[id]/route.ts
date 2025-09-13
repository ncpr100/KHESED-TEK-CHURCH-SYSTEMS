
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-qr-codes/[id] - Get single QR code
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

    const qrCode = await prisma.prayerQRCode.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      },
      include: {
        form: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            fields: true,
            isActive: true,
            isPublic: true
          }
        }
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'Código QR no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error('Error fetching prayer QR code:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/prayer-qr-codes/[id] - Update QR code
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

    // Check user permissions (LIDER or above)
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, design, isActive } = body

    const qrCode = await prisma.prayerQRCode.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'Código QR no encontrado' }, { status: 404 })
    }

    const updatedQRCode = await prisma.prayerQRCode.update({
      where: { id: params.id },
      data: {
        name: name?.trim() || qrCode.name,
        description: description?.trim(),
        design: design || qrCode.design,
        isActive: isActive ?? qrCode.isActive
      },
      include: {
        form: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({ qrCode: updatedQRCode })
  } catch (error) {
    console.error('Error updating prayer QR code:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/prayer-qr-codes/[id] - Delete QR code
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

    const qrCode = await prisma.prayerQRCode.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    })

    if (!qrCode) {
      return NextResponse.json({ error: 'Código QR no encontrado' }, { status: 404 })
    }

    await prisma.prayerQRCode.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Código QR eliminado' })
  } catch (error) {
    console.error('Error deleting prayer QR code:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
