
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener conversiones por funnel ID o website ID
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const funnelId = searchParams.get('funnelId')
    const websiteId = searchParams.get('websiteId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereClause: any = {}

    if (funnelId) {
      // Verificar que el funnel pertenece a un sitio web de la iglesia
      const funnel = await prisma.funnel.findFirst({
        where: {
          id: funnelId,
          website: {
            churchId: session.user.churchId
          }
        }
      })

      if (!funnel) {
        return NextResponse.json(
          { error: 'Funnel no encontrado' },
          { status: 404 }
        )
      }

      whereClause.funnelId = funnelId
    } else if (websiteId) {
      // Verificar que el sitio web pertenece a la iglesia
      const website = await prisma.website.findFirst({
        where: {
          id: websiteId,
          churchId: session.user.churchId
        }
      })

      if (!website) {
        return NextResponse.json(
          { error: 'Sitio web no encontrado' },
          { status: 404 }
        )
      }

      whereClause.funnel = {
        websiteId: websiteId
      }
    } else {
      // Obtener todas las conversiones de sitios web de la iglesia
      whereClause.funnel = {
        website: {
          churchId: session.user.churchId
        }
      }
    }

    const conversions = await prisma.funnelConversion.findMany({
      where: whereClause,
      include: {
        funnel: {
          select: {
            name: true,
            slug: true,
            website: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        },
        step: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    return NextResponse.json(conversions)
  } catch (error) {
    console.error('Error fetching conversions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Registrar nueva conversión (para uso público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      funnelId, 
      stepId, 
      email, 
      firstName, 
      lastName, 
      phone, 
      data,
      source 
    } = body

    // Obtener información del request
    const userAgent = request.headers.get('user-agent') || undefined
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    const conversion = await prisma.funnelConversion.create({
      data: {
        funnelId,
        stepId,
        email,
        firstName,
        lastName,
        phone,
        data: data || {},
        source,
        ipAddress,
        userAgent,
      }
    })

    return NextResponse.json(conversion)
  } catch (error) {
    console.error('Error creating conversion:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
