

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let settings = await prisma.churchQualificationSettings.findUnique({
      where: { churchId: session.user.churchId }
    })

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.churchQualificationSettings.create({
        data: {
          churchId: session.user.churchId
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching qualification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      volunteerMinMembershipDays,
      volunteerRequireActiveStatus,
      volunteerRequireSpiritualAssessment,
      volunteerMinSpiritualScore,
      leadershipMinMembershipDays,
      leadershipRequireVolunteerExp,
      leadershipMinVolunteerDays,
      leadershipRequireTraining,
      leadershipMinSpiritualScore,
      leadershipMinLeadershipScore,
      enableSpiritualMaturityScoring,
      enableLeadershipAptitudeScoring,
      enableMinistryPassionMatching,
      spiritualGiftsWeight,
      availabilityWeight,
      experienceWeight,
      ministryPassionWeight,
      activityWeight
    } = body

    const settings = await prisma.churchQualificationSettings.upsert({
      where: { churchId: session.user.churchId },
      update: {
        volunteerMinMembershipDays,
        volunteerRequireActiveStatus,
        volunteerRequireSpiritualAssessment,
        volunteerMinSpiritualScore,
        leadershipMinMembershipDays,
        leadershipRequireVolunteerExp,
        leadershipMinVolunteerDays,
        leadershipRequireTraining,
        leadershipMinSpiritualScore,
        leadershipMinLeadershipScore,
        enableSpiritualMaturityScoring,
        enableLeadershipAptitudeScoring,
        enableMinistryPassionMatching,
        spiritualGiftsWeight,
        availabilityWeight,
        experienceWeight,
        ministryPassionWeight,
        activityWeight
      },
      create: {
        churchId: session.user.churchId,
        volunteerMinMembershipDays,
        volunteerRequireActiveStatus,
        volunteerRequireSpiritualAssessment,
        volunteerMinSpiritualScore,
        leadershipMinMembershipDays,
        leadershipRequireVolunteerExp,
        leadershipMinVolunteerDays,
        leadershipRequireTraining,
        leadershipMinSpiritualScore,
        leadershipMinLeadershipScore,
        enableSpiritualMaturityScoring,
        enableLeadershipAptitudeScoring,
        enableMinistryPassionMatching,
        spiritualGiftsWeight,
        availabilityWeight,
        experienceWeight,
        ministryPassionWeight,
        activityWeight
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating qualification settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
