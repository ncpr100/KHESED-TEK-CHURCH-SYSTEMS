
/**
 * Bible Subscription Management API
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import BibleIntegrationService, { BIBLE_INTEGRATION_PLANS } from '@/lib/bible-integrations'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ 
        error: 'No autorizado'
      }, { status: 401 })
    }

    const subscription = await BibleIntegrationService.getBibleSubscription(session.user.churchId)
    const hasSubscription = await BibleIntegrationService.hasActiveBibleSubscription(session.user.churchId)

    return NextResponse.json({
      hasSubscription,
      subscription,
      plans: BIBLE_INTEGRATION_PLANS,
      upgradeUrl: BibleIntegrationService.getUpgradeUrl(session.user.churchId)
    })

  } catch (error) {
    console.error('Bible subscription check error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ 
        error: 'No autorizado'
      }, { status: 401 })
    }

    const { action, planId } = await request.json()

    if (action === 'upgrade') {
      // This would typically integrate with Stripe or payment processor
      // For now, simulate successful upgrade
      
      return NextResponse.json({
        success: true,
        message: 'Subscription upgrade initiated',
        redirectUrl: `/settings/integrations/bible-success?plan=${planId}`
      })
    }

    return NextResponse.json({
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error) {
    console.error('Bible subscription action error:', error)
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 })
  }
}
