
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-contacts - List prayer contacts
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
    const search = searchParams.get('search')
    const source = searchParams.get('source')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      churchId: user.churchId,
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as any } },
          { email: { contains: search, mode: 'insensitive' as any } },
          { phone: { contains: search } }
        ]
      }),
      ...(source && { source }),
      ...(isActive !== null && { isActive: isActive === 'true' })
    }

    const [contacts, total] = await Promise.all([
      prisma.prayerContact.findMany({
        where,
        include: {
          _count: {
            select: {
              requests: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.prayerContact.count({ where })
    ])

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching prayer contacts:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/prayer-contacts - Create new prayer contact manually
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
    const { 
      fullName, 
      phone, 
      email, 
      preferredContact = 'sms',
      notes,
      source = 'manual'
    } = body

    if (!fullName) {
      return NextResponse.json({ error: 'Nombre completo es requerido' }, { status: 400 })
    }

    if (!phone && !email) {
      return NextResponse.json({ 
        error: 'Teléfono o email son requeridos' 
      }, { status: 400 })
    }

    // Check for duplicates
    const existing = await prisma.prayerContact.findFirst({
      where: {
        churchId: user.churchId,
        OR: [
          ...(phone ? [{ phone: phone.trim() }] : []),
          ...(email ? [{ email: email.trim().toLowerCase() }] : [])
        ]
      }
    })

    if (existing) {
      return NextResponse.json({ 
        error: 'Ya existe un contacto con ese teléfono o email' 
      }, { status: 409 })
    }

    const contact = await prisma.prayerContact.create({
      data: {
        fullName: fullName.trim(),
        phone: phone?.trim(),
        email: email?.trim().toLowerCase(),
        preferredContact,
        notes: notes?.trim(),
        source,
        churchId: user.churchId
      }
    })

    return NextResponse.json({ contact })
  } catch (error) {
    console.error('Error creating prayer contact:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
