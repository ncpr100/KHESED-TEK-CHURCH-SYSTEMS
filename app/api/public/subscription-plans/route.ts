
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Public endpoint for registration - no authentication required
    // Only returns basic plan information needed for signup
    
    const plans = await db.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        description: true,
        priceMonthly: true,
        priceYearly: true,
        maxChurches: true,
        maxMembers: true,
        maxUsers: true,
        sortOrder: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json(plans)

  } catch (error) {
    console.error('Error fetching public subscription plans:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
