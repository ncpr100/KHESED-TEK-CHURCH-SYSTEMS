
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/prayer-qr-codes/public/[code] - Get QR code and form data
export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const qrCode = await prisma.prayerQRCode.findFirst({
      where: {
        code: params.code,
        isActive: true
      },
      include: {
        form: {
          include: {
            church: {
              select: {
                id: true,
                name: true,
                logo: true,
                description: true
              }
            }
          }
        }
      }
    })

    // Check if form is active and public
    if (qrCode && (!qrCode.form.isActive || !qrCode.form.isPublic)) {
      return NextResponse.json({ 
        error: 'Código QR no válido o formulario no disponible' 
      }, { status: 404 })
    }

    if (!qrCode || !qrCode.form) {
      return NextResponse.json({ 
        error: 'Código QR no válido o formulario no disponible' 
      }, { status: 404 })
    }

    // Update scan count and last scan time
    await prisma.prayerQRCode.update({
      where: { id: qrCode.id },
      data: {
        scanCount: { increment: 1 },
        lastScan: new Date()
      }
    }).catch(() => {}) // Don't fail if update fails

    // Get prayer categories for this church
    const categories = await prisma.prayerCategory.findMany({
      where: {
        churchId: qrCode.form.churchId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ 
      qrCode: {
        ...qrCode,
        form: {
          ...qrCode.form,
          categories
        }
      }
    })
  } catch (error) {
    console.error('Error fetching QR code data:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
