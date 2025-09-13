

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    // Solo SUPER_ADMIN puede acceder a gestión de plataforma
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const status = searchParams.get('status') || 'all'
    const churchId = params.id

    const skip = (page - 1) * limit

    // Verificar que la iglesia existe
    const church = await db.church.findUnique({
      where: { id: churchId },
      select: { id: true, name: true, isActive: true }
    })

    if (!church) {
      return NextResponse.json(
        { message: 'Iglesia no encontrada' },
        { status: 404 }
      )
    }

    // Construir filtros
    const where: any = {
      churchId: churchId
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role !== 'all') {
      where.role = role
    }

    if (status !== 'all') {
      where.isActive = status === 'active'
    }

    // Obtener usuarios
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          emailVerified: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    // Formatear datos para incluir lastLogin simulado (puedes implementar tracking real más tarde)
    const usersWithLastLogin = users.map(user => ({
      ...user,
      lastLogin: user.updatedAt // Temporal: usar updatedAt como proxy para lastLogin
    }))

    return NextResponse.json({
      users: usersWithLastLogin,
      church,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching church users:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const churchId = params.id
    const body = await request.json()
    
    const {
      name,
      email,
      password,
      role,
      isActive = true
    } = body

    // Validaciones
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Campos requeridos: name, email, password, role' },
        { status: 400 }
      )
    }

    // Verificar que la iglesia existe
    const church = await db.church.findUnique({
      where: { id: churchId }
    })

    if (!church) {
      return NextResponse.json(
        { message: 'Iglesia no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el email no existe
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Crear usuario en una transacción
    const result = await db.$transaction(async (tx) => {
      // Hash password
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(password, 12)

      // Crear usuario
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          churchId,
          isActive,
          emailVerified: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      })

      // Crear miembro correspondiente si es necesario
      if (role !== 'ADMIN_IGLESIA') {
        await tx.member.create({
          data: {
            firstName: name.split(' ')[0] || name,
            lastName: name.split(' ').slice(1).join(' ') || '',
            email,
            churchId,
            userId: user.id,
            membershipDate: new Date(),
            isActive: true
          }
        })
      }

      // Log de actividad
      await tx.notification.create({
        data: {
          title: 'Nuevo usuario creado',
          message: `Usuario "${name}" (${role}) creado por SUPER_ADMIN`,
          type: 'info',
          churchId,
          isRead: false
        }
      })

      return user
    })

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: result
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

