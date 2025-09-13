
import { NextRequest, NextResponse } from 'next/server'
import { ChildSecurityService } from '@/lib/services/child-security'

const childSecurity = new ChildSecurityService()

// Cron job endpoint for photo cleanup
export async function POST(req: NextRequest) {
  try {
    // Verify cron job authorization (in production, use proper auth)
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cleanedCount = await childSecurity.cleanupExpiredPhotos()
    
    return NextResponse.json({ 
      success: true, 
      message: `Cleaned up ${cleanedCount} expired photo records`
    })

  } catch (error) {
    console.error('Photo cleanup cron error:', error)
    return NextResponse.json(
      { error: 'Cleanup failed' }, 
      { status: 500 }
    )
  }
}
