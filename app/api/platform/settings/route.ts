
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Get platform settings (create default if doesn't exist)
    let settings = await prisma.platformSettings.findFirst()
    
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          currency: 'USD',
          taxRate: 0.0,
          freeTrialDays: 14,
          gracePeriodDays: 7,
          platformName: 'Kḥesed-tek Church Management Systems',
          supportEmail: 'soporte@khesedtek.com',
          maintenanceMode: false,
          allowRegistrations: true
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching platform settings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const data = await request.json()
    
    // Update or create platform settings
    const settings = await prisma.platformSettings.upsert({
      where: { id: data.id || 'default' },
      update: {
        currency: data.currency,
        taxRate: data.taxRate,
        freeTrialDays: data.freeTrialDays,
        gracePeriodDays: data.gracePeriodDays,
        platformName: data.platformName,
        supportEmail: data.supportEmail,
        maintenanceMode: data.maintenanceMode,
        allowRegistrations: data.allowRegistrations
      },
      create: {
        id: 'default',
        currency: data.currency || 'COP',
        taxRate: data.taxRate || 0.0,
        freeTrialDays: data.freeTrialDays || 14,
        gracePeriodDays: data.gracePeriodDays || 7,
        platformName: data.platformName || 'Kḥesed-tek Church Management Systems',
        supportEmail: data.supportEmail || 'soporte@khesedtek.com',
        maintenanceMode: data.maintenanceMode || false,
        allowRegistrations: data.allowRegistrations || true
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating platform settings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
