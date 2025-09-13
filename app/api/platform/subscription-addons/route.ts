

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all subscription addons
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const addons = await db.subscriptionAddon.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(addons)

  } catch (error) {
    console.error('Error fetching subscription addons:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new subscription addon
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const {
      key,
      name,
      description,
      priceMonthly,
      priceYearly,
      billingType,
      pricePerUnit,
      unit
    } = await request.json()

    // Validations
    if (!key || !name || (!priceMonthly && !pricePerUnit)) {
      return NextResponse.json(
        { message: 'Clave, nombre y precio son requeridos' },
        { status: 400 }
      )
    }

    // Check if addon with same key already exists
    const existingAddon = await db.subscriptionAddon.findUnique({
      where: { key }
    })

    if (existingAddon) {
      return NextResponse.json(
        { message: 'Ya existe un complemento con esta clave' },
        { status: 400 }
      )
    }

    const addon = await db.subscriptionAddon.create({
      data: {
        key,
        name,
        description,
        priceMonthly: priceMonthly || '', // Direct string storage
        priceYearly: priceYearly || null, // Direct string storage
        billingType: billingType || 'MONTHLY',
        pricePerUnit: pricePerUnit || null, // Direct string storage
        unit
      }
    })

    return NextResponse.json(addon)

  } catch (error) {
    console.error('Error creating subscription addon:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// UPDATE a subscription addon
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const {
      id,
      key,
      name,
      description,
      priceMonthly,
      priceYearly,
      billingType,
      pricePerUnit,
      unit,
      isActive
    } = await request.json()

    if (!id) {
      return NextResponse.json(
        { message: 'ID del complemento es requerido' },
        { status: 400 }
      )
    }

    const addon = await db.subscriptionAddon.update({
      where: { id },
      data: {
        ...(key && { key }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(priceMonthly !== undefined && { priceMonthly: priceMonthly || '' }),
        ...(priceYearly !== undefined && { priceYearly: priceYearly || null }),
        ...(billingType && { billingType }),
        ...(pricePerUnit !== undefined && { pricePerUnit: pricePerUnit || null }),
        ...(unit !== undefined && { unit }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(addon)

  } catch (error) {
    console.error('Error updating subscription addon:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE a subscription addon
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
        { message: 'ID del complemento es requerido' },
        { status: 400 }
      )
    }

    // Check if addon has active subscriptions
    const activeSubscriptions = await db.churchSubscriptionAddon.count({
      where: {
        addonId: id,
        isActive: true
      }
    })

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar el complemento. Tiene ${activeSubscriptions} suscripciones activas.` },
        { status: 400 }
      )
    }

    await db.subscriptionAddon.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Complemento eliminado exitosamente' })

  } catch (error) {
    console.error('Error deleting subscription addon:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

