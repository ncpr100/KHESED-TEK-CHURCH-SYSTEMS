
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-forms - List prayer forms
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
    const isActive = searchParams.get('isActive')
    const isPublic = searchParams.get('isPublic')

    const forms = await prisma.prayerForm.findMany({
      where: {
        churchId: user.churchId,
        ...(isActive !== null && { isActive: isActive === 'true' }),
        ...(isPublic !== null && { isPublic: isPublic === 'true' })
      },
      include: {
        qrCodes: {
          select: {
            id: true,
            name: true,
            isActive: true,
            scanCount: true,
            lastScan: true
          }
        },
        _count: {
          select: {
            qrCodes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ forms })
  } catch (error) {
    console.error('Error fetching prayer forms:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/prayer-forms - Create new prayer form
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
    const { name, description, fields, style, isPublic } = body

    if (!name || !fields) {
      return NextResponse.json({ 
        error: 'Nombre y campos son requeridos' 
      }, { status: 400 })
    }

    // Generate unique slug
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    let slug = baseSlug
    let counter = 1
    
    while (await prisma.prayerForm.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const form = await prisma.prayerForm.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        fields,
        style: style || {},
        isPublic: isPublic ?? true,
        slug,
        churchId: user.churchId
      }
    })

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Error creating prayer form:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
