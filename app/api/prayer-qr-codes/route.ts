
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'

// GET /api/prayer-qr-codes - List QR codes
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
    const formId = searchParams.get('formId')
    const isActive = searchParams.get('isActive')

    const qrCodes = await prisma.prayerQRCode.findMany({
      where: {
        churchId: user.churchId,
        ...(formId && { formId }),
        ...(isActive !== null && { isActive: isActive === 'true' })
      },
      include: {
        form: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ qrCodes })
  } catch (error) {
    console.error('Error fetching prayer QR codes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/prayer-qr-codes - Create new QR code
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

    // Check user permissions (LIDER or above)
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, formId, design } = body

    if (!name || !formId) {
      return NextResponse.json({ 
        error: 'Nombre y formulario son requeridos' 
      }, { status: 400 })
    }

    // Verify form exists and belongs to church
    const form = await prisma.prayerForm.findFirst({
      where: {
        id: formId,
        churchId: user.churchId,
        isActive: true
      }
    })

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 })
    }

    // Generate unique QR code
    let code = nanoid(12)
    while (await prisma.prayerQRCode.findFirst({ where: { code } })) {
      code = nanoid(12)
    }

    const qrCode = await prisma.prayerQRCode.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        formId,
        code,
        design: design || {
          size: 256,
          errorCorrectionLevel: 'M',
          backgroundColor: '#ffffff',
          foregroundColor: '#000000',
          logo: null,
          logoSize: 0.2
        },
        churchId: user.churchId
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

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error('Error creating prayer QR code:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
