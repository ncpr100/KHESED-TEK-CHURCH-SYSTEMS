
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/prayer-forms/public/[slug] - Get public prayer form by slug
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const form = await prisma.prayerForm.findFirst({
      where: {
        slug: params.slug,
        isActive: true,
        isPublic: true
      },
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
    })

    if (!form) {
      return NextResponse.json({ 
        error: 'Formulario no encontrado o no disponible públicamente' 
      }, { status: 404 })
    }

    // Get prayer categories for this church
    const categories = await prisma.prayerCategory.findMany({
      where: {
        churchId: form.churchId,
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
      form: {
        ...form,
        categories
      }
    })
  } catch (error) {
    console.error('Error fetching public prayer form:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
