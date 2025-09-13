
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener todos los proyectos de sitios web (SUPER_ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado - Se requiere rol SUPER_ADMIN' },
        { status: 403 }
      )
    }

    // Obtener todas las solicitudes de sitios web
    const websiteRequests = await prisma.websiteRequest.findMany({
      include: {
        church: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Obtener sitios web activos
    const activeWebsites = await prisma.website.findMany({
      include: {
        church: {
          select: {
            name: true
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

    return NextResponse.json({
      requests: websiteRequests,
      activeWebsites: activeWebsites,
      stats: {
        pendingRequests: websiteRequests.filter(r => r.status === 'pending').length,
        inProgress: websiteRequests.filter(r => r.status === 'in_progress').length,
        totalActive: activeWebsites.length,
        monthlyRevenue: websiteRequests
          .filter(r => r.status === 'completed' && r.completedAt && 
            new Date(r.completedAt).getMonth() === new Date().getMonth())
          .reduce((sum, r) => sum + (r.finalPrice || r.estimatedPrice || 0), 0)
      }
    })
  } catch (error) {
    console.error('Error fetching platform website services:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear proyecto de sitio web profesional (SUPER_ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado - Se requiere rol SUPER_ADMIN' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      churchName,
      contactEmail,
      websiteName,
      slug,
      description,
      phone,
      address,
      specialRequests,
      template,
      templateName,
      primaryColor,
      secondaryColor,
      accentColor,
      colorSchemeName,
      estimatedPrice
    } = body

    // Verificar que el slug no existe
    if (slug) {
      const existingWebsite = await prisma.website.findUnique({
        where: { slug }
      })

      if (existingWebsite) {
        return NextResponse.json(
          { error: 'La URL del sitio web ya está en uso' },
          { status: 400 }
        )
      }
    }

    // Buscar o crear iglesia
    let church = await prisma.church.findFirst({
      where: {
        OR: [
          { name: churchName },
          { email: contactEmail }
        ]
      }
    })

    if (!church) {
      // Crear iglesia básica para el proyecto
      church = await prisma.church.create({
        data: {
          name: churchName,
          email: contactEmail,
          phone: phone || '',
          address: address || '',
          isActive: true
        }
      })
    }

    // Crear el sitio web directamente
    const website = await prisma.website.create({
      data: {
        name: websiteName,
        slug: slug || websiteName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        description: description,
        theme: template,
        primaryColor: primaryColor || '#3B82F6',
        secondaryColor: secondaryColor || '#64748B',
        accentColor: accentColor || primaryColor,
        churchId: church.id,
        isActive: true,
        metadata: JSON.stringify({
          template: template,
          templateName: templateName,
          colorScheme: colorSchemeName,
          specialRequests: specialRequests,
          createdByAdmin: session.user.id,
          estimatedPrice: estimatedPrice
        })
      },
      include: {
        church: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Crear entrada en el log de proyectos
    await prisma.websiteRequest.create({
      data: {
        churchId: church.id,
        requestType: 'admin_created',
        projectName: websiteName,
        description: `Sitio web creado directamente por SUPER_ADMIN usando plantilla ${templateName}`,
        status: 'in_progress',
        priority: 'medium',
        contactEmail: contactEmail,
        phone: phone,
        estimatedPrice: estimatedPrice,
        adminNotes: `Proyecto iniciado por: ${session.user.name || session.user.email}`,
        metadata: JSON.stringify({
          template: template,
          colors: { primary: primaryColor, secondary: secondaryColor, accent: accentColor },
          specialRequests: specialRequests
        })
      }
    })

    return NextResponse.json({
      success: true,
      website: website,
      message: 'Proyecto de sitio web creado exitosamente'
    })
    
  } catch (error) {
    console.error('Error creating website project:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
