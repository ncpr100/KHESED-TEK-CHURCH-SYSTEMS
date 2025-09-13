

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all plan features
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const features = await db.planFeature.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(features)

  } catch (error) {
    console.error('Error fetching plan features:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new plan feature
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const { key, name, description, category } = await request.json()

    // Validations
    if (!key || !name) {
      return NextResponse.json(
        { message: 'Clave y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Check if feature with same key already exists
    const existingFeature = await db.planFeature.findUnique({
      where: { key }
    })

    if (existingFeature) {
      return NextResponse.json(
        { message: 'Ya existe una característica con esta clave' },
        { status: 400 }
      )
    }

    const feature = await db.planFeature.create({
      data: {
        key,
        name,
        description,
        category: category || 'core'
      }
    })

    return NextResponse.json(feature)

  } catch (error) {
    console.error('Error creating plan feature:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// UPDATE a plan feature
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const { id, key, name, description, category, isActive } = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'ID de la característica es requerido' },
        { status: 400 }
      )
    }

    const feature = await db.planFeature.update({
      where: { id },
      data: {
        ...(key && { key }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(feature)

  } catch (error) {
    console.error('Error updating plan feature:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE a plan feature
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'ID de la característica es requerido' },
        { status: 400 }
      )
    }

    await db.planFeature.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Característica eliminada exitosamente' })

  } catch (error) {
    console.error('Error deleting plan feature:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

