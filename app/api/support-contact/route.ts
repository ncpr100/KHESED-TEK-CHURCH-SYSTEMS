
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch support contact information
export async function GET() {
  try {
    let contactInfo = await prisma.supportContactInfo.findFirst({
      where: { id: 'default' }
    })

    // If no record exists, create default one
    if (!contactInfo) {
      contactInfo = await prisma.supportContactInfo.create({
        data: {
          id: 'default',
          whatsappNumber: '+57 300 KHESED (543733)',
          whatsappUrl: 'https://wa.me/573003435733',
          email: 'soporte@khesedtek.com',
          schedule: 'Lun-Vie 8AM-8PM (Colombia)',
          companyName: 'Khesed-tek Systems',
          location: 'Bogotá, Colombia',
          website: 'https://khesedtek.com'
        }
      })
    }

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error fetching support contact info:', error)
    return NextResponse.json(
      { error: 'Error al obtener información de contacto' },
      { status: 500 }
    )
  }
}

// PUT - Update support contact information (SUPER_ADMIN only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // COMPREHENSIVE DEBUGGING
    console.log('🔍 Support Contact PUT - Full Session Debug:', {
      exists: !!session,
      user: session?.user,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    })

    // Enhanced error messaging for frontend
    if (!session) {
      console.error('❌ No session found - user not authenticated')
      return NextResponse.json(
        { 
          error: 'Sesión no encontrada. Por favor, inicia sesión nuevamente.',
          code: 'NO_SESSION',
          debug: 'User session is null or undefined'
        },
        { status: 401 }
      )
    }

    if (!session.user) {
      console.error('❌ Session exists but user is null')
      return NextResponse.json(
        { 
          error: 'Datos de usuario no encontrados en la sesión.',
          code: 'NO_USER_DATA',
          debug: 'Session.user is null or undefined'
        },
        { status: 401 }
      )
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      console.error('❌ Unauthorized role:', {
        currentRole: session.user.role,
        requiredRole: 'SUPER_ADMIN',
        userEmail: session.user.email
      })
      return NextResponse.json(
        { 
          error: `Acceso denegado. Rol actual: "${session.user.role}", se requiere: "SUPER_ADMIN"`,
          code: 'INSUFFICIENT_ROLE',
          debug: {
            currentRole: session.user.role,
            requiredRole: 'SUPER_ADMIN',
            userEmail: session.user.email
          }
        },
        { status: 403 }
      )
    }

    console.log('✅ Authentication successful for SUPER_ADMIN:', session.user.email)

    const body = await request.json()
    const {
      whatsappNumber,
      whatsappUrl,
      email,
      schedule,
      companyName,
      location,
      website
    } = body

    // Validate required fields
    if (!whatsappNumber || !email || !companyName) {
      return NextResponse.json(
        { error: 'WhatsApp, Email y Nombre de empresa son obligatorios' },
        { status: 400 }
      )
    }

    console.log('📝 Updating support contact with data:', { whatsappNumber, email, companyName, location, website })

    // Update or create contact info
    const contactInfo = await prisma.supportContactInfo.upsert({
      where: { id: 'default' },
      update: {
        whatsappNumber,
        whatsappUrl,
        email,
        schedule,
        companyName,
        location,
        website,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        whatsappNumber,
        whatsappUrl,
        email,
        schedule,
        companyName,
        location,
        website
      }
    })

    console.log('✅ Support contact info updated successfully:', contactInfo)

    return NextResponse.json({
      success: true,
      message: 'Información de contacto actualizada exitosamente',
      data: contactInfo
    })
  } catch (error) {
    console.error('Error updating support contact info:', error)
    return NextResponse.json(
      { error: 'Error al actualizar información de contacto' },
      { status: 500 }
    )
  }
}
