
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock VAPID public key - In production, generate real VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BJTxQ2sYOuEvT_lQJYiGUZBmVIAKpKAXYxm-sBnGPp4PTd_sP1H3Yp6LqIDxGLKvtCw1O2gqLQBk3xm8_2kxXQs'

// GET - Get VAPID public key for client-side subscription
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    return NextResponse.json({
      publicKey: VAPID_PUBLIC_KEY,
      supported: true
    })

  } catch (error) {
    console.error('Error getting VAPID public key:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
