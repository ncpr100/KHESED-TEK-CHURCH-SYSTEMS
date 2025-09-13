
/**
 * Premium Bible Comparison API
 * Requires active subscription for access
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import PremiumBibleAPI from '@/lib/premium-bible-api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ 
        error: 'No autorizado',
        requiresAuth: true
      }, { status: 401 })
    }

    const { reference, versions } = await request.json()

    if (!reference) {
      return NextResponse.json({
        error: 'Reference is required',
        success: false
      }, { status: 400 })
    }

    if (!versions || !Array.isArray(versions) || versions.length === 0) {
      return NextResponse.json({
        error: 'At least one version is required', 
        success: false
      }, { status: 400 })
    }

    // Use premium Bible API for comparison
    const result = await PremiumBibleAPI.compareVersions(
      reference,
      versions,
      session.user.churchId
    )

    return NextResponse.json({
      reference: result.reference,
      versions: result.versions,
      success: result.success,
      message: result.message,
      authenticated: result.versions.some(v => v.authenticated),
      totalVersions: result.versions.length
    })

  } catch (error) {
    console.error('Premium Bible comparison error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}
