
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChildSecurityService } from '@/lib/services/child-security'

const childSecurity = new ChildSecurityService()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, ...data } = await req.json()

    switch (action) {
      case 'secure_checkin':
        const result = await childSecurity.processCheckInWithPhotos({
          childPhoto: data.childPhoto,
          parentPhoto: data.parentPhoto,
          childId: data.childId,
          securityPin: data.securityPin
        })
        return NextResponse.json(result)

      case 'verify_pickup':
        const verification = await childSecurity.verifyPickup(
          data.checkInId,
          data.pickupPhoto,
          data.pinAttempt,
          data.attemptedBy
        )
        return NextResponse.json(verification)

      case 'emergency_override':
        if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
        
        const override = await childSecurity.emergencyOverride(
          data.checkInId,
          session.user.id,
          data.reason
        )
        return NextResponse.json(override)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Child security error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Get pickup history and security info
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const checkInId = searchParams.get('checkInId')
    const action = searchParams.get('action')

    if (!checkInId) {
      return NextResponse.json({ error: 'Check-in ID required' }, { status: 400 })
    }

    if (action === 'pickup_history') {
      const history = await childSecurity.getPickupHistory(checkInId)
      return NextResponse.json({ history })
    }

    // Default: return basic security info
    const { prisma } = await import('@/lib/prisma')
    
    const checkIn = await prisma.childCheckIn.findUnique({
      where: { id: checkInId },
      select: {
        id: true,
        childName: true,
        parentName: true,
        checkedIn: true,
        checkedOut: true,
        checkedInAt: true,
        checkedOutAt: true,
        requiresBothAuth: true,
        pickupAttempts: true
      }
    })

    if (!checkIn) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 })
    }

    return NextResponse.json(checkIn)

  } catch (error) {
    console.error('Error fetching security info:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
