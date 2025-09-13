
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener todos los sitios web de una iglesia
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const websites = await prisma.website.findMany({
      where: {
        churchId: session.user.churchId
      },
      include: {
        pages: {
          select: {
            id: true,
            title: true,
            slug: true,
            isHomePage: true,
            isPublished: true
          }
        },
        funnels: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true
          }
        },
        _count: {
          select: {
            pages: true,
            funnels: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(websites)
  } catch (error) {
    console.error('Error fetching websites:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo sitio web
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, slug, theme, primaryColor, secondaryColor } = body

    // Verificar que el slug no existe
    const existingWebsite = await prisma.website.findUnique({
      where: { slug }
    })

    if (existingWebsite) {
      return NextResponse.json(
        { error: 'La URL del sitio web ya está en uso' },
        { status: 400 }
      )
    }

    const website = await prisma.website.create({
      data: {
        name,
        description,
        slug,
        theme: theme || 'default',
        primaryColor: primaryColor || '#3B82F6',
        secondaryColor: secondaryColor || '#64748B',
        churchId: session.user.churchId,
      },
      include: {
        pages: true,
        funnels: true,
        _count: {
          select: {
            pages: true,
            funnels: true
          }
        }
      }
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error('Error creating website:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
