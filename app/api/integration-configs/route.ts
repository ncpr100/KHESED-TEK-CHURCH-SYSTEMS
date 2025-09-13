
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const service = searchParams.get('service')

    const whereClause: any = {
      churchId: session.user.churchId
    }

    if (service) {
      whereClause.service = service
    }

    const configs = await db.integrationConfig.findMany({
      where: whereClause,
      select: {
        id: true,
        service: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
        // No incluir config por seguridad
      },
      orderBy: { service: 'asc' }
    })

    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error fetching integration configs:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { service, config, isActive } = body

    if (!service || !config) {
      return NextResponse.json({ error: 'Servicio y configuración son requeridos' }, { status: 400 })
    }

    // Verificar si ya existe una configuración para este servicio
    const existingConfig = await db.integrationConfig.findFirst({
      where: {
        churchId: session.user.churchId,
        service
      }
    })

    let integrationConfig
    if (existingConfig) {
      // Actualizar configuración existente
      integrationConfig = await db.integrationConfig.update({
        where: { id: existingConfig.id },
        data: {
          config: JSON.stringify(config),
          isActive: isActive !== undefined ? isActive : true
        }
      })
    } else {
      // Crear nueva configuración
      integrationConfig = await db.integrationConfig.create({
        data: {
          service,
          config: JSON.stringify(config),
          isActive: isActive !== undefined ? isActive : true,
          churchId: session.user.churchId
        }
      })
    }

    // Retornar sin el config por seguridad
    const { config: _, ...safeConfig } = integrationConfig
    return NextResponse.json(safeConfig)
  } catch (error) {
    console.error('Error saving integration config:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
