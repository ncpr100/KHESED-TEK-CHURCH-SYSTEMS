
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { hasPermission } from '@/lib/permissions'

// GET /api/permissions - Obtener todos los permisos
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden ver permisos
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const permissions = await db.permission.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ],
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/permissions - Crear nuevo permiso
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN puede crear permisos
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, resource, action, conditions } = body

    if (!name || !resource || !action) {
      return NextResponse.json(
        { error: 'Nombre, recurso y acción son requeridos' },
        { status: 400 }
      )
    }

    const permission = await db.permission.create({
      data: {
        name,
        description,
        resource,
        action,
        conditions,
      },
    })

    return NextResponse.json(permission, { status: 201 })
  } catch (error: any) {
    console.error('Error creating permission:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un permiso con ese nombre o combinación recurso/acción' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
