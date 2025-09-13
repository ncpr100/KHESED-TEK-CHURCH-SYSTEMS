

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all subscription plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const plans = await db.subscriptionPlan.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(plans)

  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new subscription plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const {
      name,
      displayName,
      description,
      priceMonthly,
      priceYearly,
      maxChurches,
      maxMembers,
      maxUsers,
      features,
      sortOrder
    } = await request.json()

    // Validations
    if (!name || !displayName || !priceMonthly) {
      return NextResponse.json(
        { message: 'Nombre, nombre de visualización y precio mensual son requeridos' },
        { status: 400 }
      )
    }

    // Check if plan with same name already exists
    const existingPlan = await db.subscriptionPlan.findUnique({
      where: { name: name.toUpperCase() }
    })

    if (existingPlan) {
      return NextResponse.json(
        { message: 'Ya existe un plan con este nombre' },
        { status: 400 }
      )
    }

    const plan = await db.subscriptionPlan.create({
      data: {
        name: name.toUpperCase(),
        displayName,
        description,
        priceMonthly: priceMonthly || '', // Direct string storage
        priceYearly: priceYearly || null, // Direct string storage
        maxChurches: maxChurches || 1,
        maxMembers: maxMembers || 100,
        maxUsers: maxUsers || 5,
        features: features || [],
        sortOrder: sortOrder || 0
      }
    })

    return NextResponse.json(plan)

  } catch (error) {
    console.error('Error creating subscription plan:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// UPDATE a subscription plan
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT /api/platform/subscription-plans - Starting request')
    const session = await getServerSession(authOptions)

    console.log('📋 Session data:', { 
      userId: session?.user?.id, 
      userRole: session?.user?.role 
    })

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      console.log('❌ Access denied - Not SUPER_ADMIN')
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const data = await request.json()
    console.log('📋 Request data received:', data)

    const {
      id,
      name,
      displayName,
      description,
      priceMonthly,
      priceYearly,
      maxChurches,
      maxMembers,
      maxUsers,
      features,
      sortOrder,
      isActive
    } = data

    if (!id) {
      console.log('❌ Missing plan ID')
      return NextResponse.json(
        { message: 'ID del plan es requerido' },
        { status: 400 }
      )
    }

    console.log('🔄 Updating subscription plan with ID:', id)
    const plan = await db.subscriptionPlan.update({
      where: { id },
      data: {
        ...(name && { name: name.toUpperCase() }),
        ...(displayName && { displayName }),
        ...(description !== undefined && { description }),
        ...(priceMonthly !== undefined && { priceMonthly: priceMonthly || '' }),
        ...(priceYearly !== undefined && { priceYearly: priceYearly || null }),
        ...(maxChurches !== undefined && { maxChurches }),
        ...(maxMembers !== undefined && { maxMembers }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(features !== undefined && { features }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive })
      }
    })

    console.log('✅ Plan updated successfully:', plan.id)
    return NextResponse.json(plan)

  } catch (error) {
    console.error('💥 Error updating subscription plan:', error)
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available')
    return NextResponse.json(
      { 
        message: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE a subscription plan
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
        { message: 'ID del plan es requerido' },
        { status: 400 }
      )
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await db.churchSubscription.count({
      where: {
        planId: id,
        status: 'ACTIVE'
      }
    })

    if (activeSubscriptions > 0) {
      return NextResponse.json(
        { message: `No se puede eliminar el plan. Tiene ${activeSubscriptions} suscripciones activas.` },
        { status: 400 }
      )
    }

    await db.subscriptionPlan.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Plan eliminado exitosamente' })

  } catch (error) {
    console.error('Error deleting subscription plan:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

