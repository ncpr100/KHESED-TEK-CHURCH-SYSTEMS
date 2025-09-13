

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET all donations for a church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const paymentMethodId = searchParams.get('paymentMethodId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = {
      churchId: session.user.churchId
    }

    if (categoryId) whereClause.categoryId = categoryId
    if (paymentMethodId) whereClause.paymentMethodId = paymentMethodId
    if (status) whereClause.status = status
    if (startDate || endDate) {
      whereClause.donationDate = {}
      if (startDate) whereClause.donationDate.gte = new Date(startDate)
      if (endDate) whereClause.donationDate.lte = new Date(endDate)
    }

    const [donations, total] = await Promise.all([
      db.donation.findMany({
        where: whereClause,
        include: {
          category: true,
          paymentMethod: true,
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          donationDate: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      db.donation.count({ where: whereClause })
    ])

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new donation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const {
      amount,
      currency = 'COP',
      donorName,
      donorEmail,
      donorPhone,
      memberId,
      categoryId,
      paymentMethodId,
      reference,
      notes,
      isAnonymous = false,
      donationDate
    } = await request.json()

    // Validaciones básicas
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: 'El monto debe ser mayor a cero' },
        { status: 400 }
      )
    }

    if (!categoryId || !paymentMethodId) {
      return NextResponse.json(
        { message: 'Categoría y método de pago son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la categoría y método de pago pertenezcan a la iglesia
    const [category, paymentMethod] = await Promise.all([
      db.donationCategory.findFirst({
        where: { id: categoryId, churchId: session.user.churchId, isActive: true }
      }),
      db.paymentMethod.findFirst({
        where: { id: paymentMethodId, churchId: session.user.churchId, isActive: true }
      })
    ])

    if (!category || !paymentMethod) {
      return NextResponse.json(
        { message: 'Categoría o método de pago inválido' },
        { status: 400 }
      )
    }

    const donation = await db.donation.create({
      data: {
        amount: parseFloat(amount),
        currency,
        donorName: isAnonymous ? null : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        donorPhone: isAnonymous ? null : donorPhone,
        memberId: isAnonymous ? null : memberId,
        categoryId,
        paymentMethodId,
        reference,
        notes,
        isAnonymous,
        donationDate: donationDate ? new Date(donationDate) : new Date(),
        status: 'COMPLETADA',
        churchId: session.user.churchId
      },
      include: {
        category: true,
        paymentMethod: true,
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Trigger automation for donation received
    try {
      const { AutomationTriggers } = await import('@/lib/automation-engine')
      await AutomationTriggers.donationReceived({
        id: donation.id,
        amount: donation.amount,
        currency: donation.currency,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        categoryName: donation.category?.name,
        paymentMethod: donation.paymentMethod?.name,
        donationDate: donation.donationDate,
        isAnonymous: donation.isAnonymous,
        member: donation.member ? {
          id: donation.member.id,
          name: `${donation.member.firstName} ${donation.member.lastName}`
        } : null
      }, session.user.churchId)
      
      console.log(`🤖 Triggered donation received automation for ${donation.amount} ${donation.currency}`)
    } catch (automationError) {
      console.error('Error triggering donation received automation:', automationError)
      // Don't fail the donation creation if automation fails
    }

    return NextResponse.json(donation, { status: 201 })

  } catch (error) {
    console.error('Error creating donation:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

