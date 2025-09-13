
/**
 * Premium Bible Search API
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

    const { reference, version } = await request.json()

    if (!reference) {
      return NextResponse.json({
        error: 'Reference is required',
        success: false
      }, { status: 400 })
    }

    if (!version) {
      return NextResponse.json({
        error: 'Version is required', 
        success: false
      }, { status: 400 })
    }

    // Use premium Bible API
    const result = await PremiumBibleAPI.searchVerse(
      reference, 
      version, 
      session.user.churchId
    )

    if (!result) {
      return NextResponse.json({
        error: 'Verse not found',
        success: false
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      verse: result,
      authenticated: result.authenticated,
      source: result.source,
      message: result.authenticated 
        ? 'Verse retrieved from premium API'
        : 'Upgrade to access premium Bible features'
    })

  } catch (error) {
    console.error('Premium Bible search error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      success: false
    }, { status: 500 })
  }
}
