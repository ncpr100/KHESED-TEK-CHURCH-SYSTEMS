
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener páginas web por website ID
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
    const websiteId = searchParams.get('websiteId')

    if (!websiteId) {
      return NextResponse.json(
        { error: 'ID del sitio web es requerido' },
        { status: 400 }
      )
    }

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

    const pages = await prisma.webPage.findMany({
      where: {
        websiteId: websiteId
      },
      include: {
        sections: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: [
        { isHomePage: 'desc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching web pages:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva página web
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
    const { websiteId, title, slug, content, isHomePage, metaTitle, metaDescription } = body

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

    // Verificar que el slug no existe en este sitio web
    const existingPage = await prisma.webPage.findFirst({
      where: {
        websiteId,
        slug
      }
    })

    if (existingPage) {
      return NextResponse.json(
        { error: 'Ya existe una página con esta URL en este sitio web' },
        { status: 400 }
      )
    }

    // Si es página de inicio, desmarcar otras como homepage
    if (isHomePage) {
      await prisma.webPage.updateMany({
        where: {
          websiteId,
          isHomePage: true
        },
        data: {
          isHomePage: false
        }
      })
    }

    const page = await prisma.webPage.create({
      data: {
        title,
        slug,
        content: content || {},
        isHomePage: isHomePage || false,
        metaTitle,
        metaDescription,
        websiteId,
      },
      include: {
        sections: true
      }
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error creating web page:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
