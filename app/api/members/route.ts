
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const members = await db.member.findMany({
      where: {
        churchId: session.user.churchId,
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        membershipDate: true,
        isActive: true,
        spiritualGifts: true,
        secondaryGifts: true,
        spiritualCalling: true,
        ministryPassion: true,
        experienceLevel: true,
        leadershipReadiness: true,
        createdAt: true,
        updatedAt: true,
        // Add any other fields that the UI expects
        address: true,
        emergencyContact: true,
        birthDate: true,
        churchId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📊 Members API returning:', members.length, 'members')
    console.log('🔍 Members with spiritual gifts:', members.filter(m => m.spiritualGifts && (m.spiritualGifts as any[]).length > 0).length)
    
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const data = await request.json()

    // Validation
    if (!data.firstName || !data.lastName) {
      return NextResponse.json(
        { message: 'Nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    const member = await db.member.create({
      data: {
        ...data,
        churchId: session.user.churchId,
        isActive: true
      }
    })

    // Trigger automation for new member
    try {
      const { AutomationTriggers } = await import('@/lib/automation-engine')
      await AutomationTriggers.memberJoined({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone,
        membershipDate: member.membershipDate,
        isActive: member.isActive
      }, session.user.churchId)
      
      console.log(`🤖 Triggered member joined automation for ${member.firstName} ${member.lastName}`)
    } catch (automationError) {
      console.error('Error triggering member joined automation:', automationError)
      // Don't fail the member creation if automation fails
    }

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
