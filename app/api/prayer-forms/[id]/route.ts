
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-forms/[id] - Get single prayer form
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

    const form = await prisma.prayerForm.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      },
      include: {
        qrCodes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Error fetching prayer form:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/prayer-forms/[id] - Update prayer form
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
    const { name, description, fields, style, isActive, isPublic } = body

    const form = await prisma.prayerForm.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    const updatedForm = await prisma.prayerForm.update({
      where: { id: params.id },
      data: {
        name: name?.trim() || form.name,
        description: description?.trim(),
        fields: fields || form.fields,
        style: style || form.style,
        isActive: isActive ?? form.isActive,
        isPublic: isPublic ?? form.isPublic
      }
    })

    return NextResponse.json({ form: updatedForm })
  } catch (error) {
    console.error('Error updating prayer form:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/prayer-forms/[id] - Delete prayer form
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

    const form = await prisma.prayerForm.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    // Check if form has QR codes
    const qrCodeCount = await prisma.prayerQRCode.count({
      where: { formId: params.id }
    })

    if (qrCodeCount > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar. El formulario tiene códigos QR asociados' 
      }, { status: 409 })
    }

    await prisma.prayerForm.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Formulario eliminado' })
  } catch (error) {
    console.error('Error deleting prayer form:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
