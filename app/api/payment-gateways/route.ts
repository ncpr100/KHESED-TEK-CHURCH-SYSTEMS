
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get payment gateway configurations for a church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const configs = await prisma.paymentGatewayConfig.findMany({
      where: {
        churchId: session.user.churchId
      },
      select: {
        id: true,
        gatewayType: true,
        isEnabled: true,
        isTestMode: true,
        merchantId: true,
        // Don't return sensitive data
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        gatewayType: 'asc'
      }
    })

    return NextResponse.json(configs)

  } catch (error) {
    console.error('Error fetching gateway configs:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Create or update payment gateway configuration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const {
      gatewayType,
      isEnabled,
      isTestMode,
      merchantId,
      apiKey,
      clientId,
      clientSecret,
      webhookSecret,
      configuration
    } = body

    if (!gatewayType || !['pse', 'nequi', 'daviplata'].includes(gatewayType.toLowerCase())) {
      return NextResponse.json(
        { message: 'Tipo de gateway no válido' },
        { status: 400 }
      )
    }

    // Upsert gateway configuration
    const config = await prisma.paymentGatewayConfig.upsert({
      where: {
        churchId_gatewayType: {
          churchId: session.user.churchId,
          gatewayType: gatewayType.toLowerCase()
        }
      },
      update: {
        isEnabled: Boolean(isEnabled),
        isTestMode: Boolean(isTestMode),
        merchantId: merchantId || null,
        apiKey: apiKey || null, // In production, encrypt this
        clientId: clientId || null,
        clientSecret: clientSecret || null, // In production, encrypt this
        webhookSecret: webhookSecret || null, // In production, encrypt this
        configuration: configuration || null,
        updatedAt: new Date()
      },
      create: {
        churchId: session.user.churchId,
        gatewayType: gatewayType.toLowerCase(),
        isEnabled: Boolean(isEnabled),
        isTestMode: Boolean(isTestMode),
        merchantId: merchantId || null,
        apiKey: apiKey || null, // In production, encrypt this
        clientId: clientId || null,
        clientSecret: clientSecret || null, // In production, encrypt this
        webhookSecret: webhookSecret || null, // In production, encrypt this
        configuration: configuration || null
      },
      select: {
        id: true,
        gatewayType: true,
        isEnabled: true,
        isTestMode: true,
        merchantId: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: config
    })

  } catch (error) {
    console.error('Error saving gateway config:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
