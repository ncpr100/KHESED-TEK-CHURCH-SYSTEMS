

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all payment methods for a church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const paymentMethods = await db.paymentMethod.findMany({
      where: {
        churchId: session.user.churchId,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(paymentMethods)

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new payment method
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const { name, description, isDigital = false } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: 'El nombre del método de pago es requerido' },
        { status: 400 }
      )
    }

    // Verificar que no exista otro método con el mismo nombre
    const existingMethod = await db.paymentMethod.findFirst({
      where: {
        name,
        churchId: session.user.churchId,
        isActive: true
      }
    })

    if (existingMethod) {
      return NextResponse.json(
        { message: 'Ya existe un método de pago con este nombre' },
        { status: 409 }
      )
    }

    const paymentMethod = await db.paymentMethod.create({
      data: {
        name,
        description,
        isDigital,
        churchId: session.user.churchId
      }
    })

    return NextResponse.json(paymentMethod, { status: 201 })

  } catch (error) {
    console.error('Error creating payment method:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

