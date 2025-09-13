

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all donation categories for a church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const categories = await db.donationCategory.findMany({
      where: {
        churchId: session.user.churchId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(categories)

  } catch (error) {
    console.error('Error fetching donation categories:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new donation category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const { name, description } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: 'El nombre de la categoría es requerido' },
        { status: 400 }
      )
    }

    // Verificar que no exista otra categoría con el mismo nombre
    const existingCategory = await db.donationCategory.findFirst({
      where: {
        name,
        churchId: session.user.churchId,
        isActive: true
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { message: 'Ya existe una categoría con este nombre' },
        { status: 409 }
      )
    }

    const category = await db.donationCategory.create({
      data: {
        name,
        description,
        churchId: session.user.churchId
      }
    })

    return NextResponse.json(category, { status: 201 })

  } catch (error) {
    console.error('Error creating donation category:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

