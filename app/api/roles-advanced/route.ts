
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/roles-advanced - Obtener todos los roles avanzados
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden ver roles
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const whereCondition = session.user.role === 'SUPER_ADMIN' 
      ? { isActive: true }
      : { 
          isActive: true,
          OR: [
            { churchId: session.user.churchId },
            { isSystem: true }
          ]
        }

    const roles = await db.role.findMany({
      where: whereCondition,
      include: {
        church: true,
        rolePermissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            userRoles: true,
            rolePermissions: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' }
      ],
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/roles-advanced - Crear nuevo rol
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo SUPER_ADMIN y ADMIN_IGLESIA pueden crear roles
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, permissions, priority } = body

    if (!name) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Los ADMIN_IGLESIA solo pueden crear roles para su iglesia
    const churchId = session.user.role === 'SUPER_ADMIN' ? body.churchId : session.user.churchId

    const role = await db.$transaction(async (prisma) => {
      // Crear el rol
      const newRole = await prisma.role.create({
        data: {
          name,
          description,
          churchId,
          priority: priority || 0,
        },
      })

      // Asignar permisos si se proporcionaron
      if (permissions && Array.isArray(permissions)) {
        await prisma.rolePermission.createMany({
          data: permissions.map((permissionId: string) => ({
            roleId: newRole.id,
            permissionId,
          })),
          skipDuplicates: true,
        })
      }

      return newRole
    })

    const roleWithRelations = await db.role.findUnique({
      where: { id: role.id },
      include: {
        church: true,
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json(roleWithRelations, { status: 201 })
  } catch (error: any) {
    console.error('Error creating role:', error)
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un rol con ese nombre en esta iglesia' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
