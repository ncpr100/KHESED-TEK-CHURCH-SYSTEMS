
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener solicitudes de sitios web de la iglesia
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const requests = await prisma.websiteRequest.findMany({
      where: {
        churchId: session.user.churchId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching website requests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva solicitud de sitio web
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
    const {
      requestType,
      requestTypeLabel,
      estimatedPrice,
      priority,
      projectName,
      description,
      contactEmail,
      phone,
      preferredColors,
      additionalFeatures,
      specialRequests,
      budget,
      timeline,
      referenceWebsites,
      churchName,
      existingWebsiteId
    } = body

    // Validaciones básicas
    if (!requestType || !projectName || !description) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Calcular prioridad y precio estimado basado en el tipo
    let calculatedPrice = 599
    let estimatedDays = 10

    switch (requestType) {
      case 'complete-website':
        calculatedPrice = Math.floor(Math.random() * 300) + 599 // 599-899
        estimatedDays = Math.floor(Math.random() * 5) + 7 // 7-12 días
        break
      case 'landing-page':
        calculatedPrice = Math.floor(Math.random() * 200) + 199 // 199-399
        estimatedDays = Math.floor(Math.random() * 3) + 3 // 3-6 días
        break
      case 'website-update':
        calculatedPrice = Math.floor(Math.random() * 200) + 99 // 99-299
        estimatedDays = Math.floor(Math.random() * 3) + 2 // 2-5 días
        break
    }

    // Ajustar precio por prioridad
    if (priority === 'high') {
      calculatedPrice += 150
      estimatedDays = Math.ceil(estimatedDays * 0.5)
    }

    // Calcular fecha estimada de completion
    const estimatedCompletion = new Date()
    estimatedCompletion.setDate(estimatedCompletion.getDate() + estimatedDays)

    const websiteRequest = await prisma.websiteRequest.create({
      data: {
        churchId: session.user.churchId,
        requestType: requestTypeLabel || requestType,
        projectName,
        description,
        status: 'pending',
        priority: priority || 'medium',
        contactEmail: contactEmail || session.user.email || '',
        phone: phone || '',
        estimatedPrice: calculatedPrice,
        estimatedCompletion,
        existingWebsiteId: existingWebsiteId || null,
        metadata: JSON.stringify({
          preferredColors,
          additionalFeatures,
          specialRequests,
          budget,
          timeline,
          referenceWebsites,
          submittedBy: session.user.name || session.user.email,
          originalEstimatedPrice: estimatedPrice
        })
      }
    })

    // TODO: Enviar notificación a SUPER_ADMIN
    // TODO: Enviar email de confirmación al cliente

    return NextResponse.json(websiteRequest)
  } catch (error) {
    console.error('Error creating website request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
