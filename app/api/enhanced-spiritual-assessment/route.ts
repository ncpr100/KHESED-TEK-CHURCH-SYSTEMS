

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Enhanced spiritual assessment with comprehensive scoring
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      memberId,
      primaryGifts,
      secondaryGifts,
      spiritualCalling,
      ministryPassions,
      experienceLevel,
      leadershipScore,
      servingMotivation,
      previousExperience,
      trainingCompleted,
      
      // Enhanced scoring fields
      spiritualMaturityScore,
      leadershipAptitudeScore,
      ministryPassionScore,
      availabilityScore,
      teachingAbility,
      pastoralHeart,
      organizationalSkills,
      communicationSkills,
      
      // Training tracking
      leadershipTrainingCompleted,
      leadershipTrainingDate,
      mentoringExperience,
      discipleshipTraining
    } = body

    // Calculate composite readiness scores
    const volunteerReadinessScore = calculateVolunteerReadiness({
      spiritualMaturityScore: spiritualMaturityScore || 50,
      ministryPassionScore: ministryPassionScore || 50,
      availabilityScore: availabilityScore || 50,
      experienceLevel: experienceLevel || 1
    })

    const leadershipReadinessScore = calculateLeadershipReadiness({
      spiritualMaturityScore: spiritualMaturityScore || 50,
      leadershipAptitudeScore: leadershipAptitudeScore || 50,
      teachingAbility: teachingAbility || 50,
      pastoralHeart: pastoralHeart || 50,
      organizationalSkills: organizationalSkills || 50,
      communicationSkills: communicationSkills || 50,
      leadershipTrainingCompleted: leadershipTrainingCompleted || false,
      mentoringExperience: mentoringExperience || false
    })

    const profile = await prisma.memberSpiritualProfile.upsert({
      where: { memberId },
      update: {
        primaryGifts,
        secondaryGifts,
        spiritualCalling,
        ministryPassions,
        experienceLevel,
        leadershipScore,
        servingMotivation,
        previousExperience,
        trainingCompleted,
        spiritualMaturityScore,
        leadershipAptitudeScore,
        ministryPassionScore,
        availabilityScore,
        teachingAbility,
        pastoralHeart,
        organizationalSkills,
        communicationSkills,
        leadershipTrainingCompleted,
        leadershipTrainingDate: leadershipTrainingDate ? new Date(leadershipTrainingDate) : null,
        mentoringExperience,
        discipleshipTraining,
        volunteerReadinessScore,
        leadershipReadinessScore,
        assessmentDate: new Date()
      },
      create: {
        memberId,
        primaryGifts,
        secondaryGifts,
        spiritualCalling,
        ministryPassions,
        experienceLevel,
        leadershipScore,
        servingMotivation,
        previousExperience,
        trainingCompleted,
        spiritualMaturityScore,
        leadershipAptitudeScore,
        ministryPassionScore,
        availabilityScore,
        teachingAbility,
        pastoralHeart,
        organizationalSkills,
        communicationSkills,
        leadershipTrainingCompleted,
        leadershipTrainingDate: leadershipTrainingDate ? new Date(leadershipTrainingDate) : null,
        mentoringExperience,
        discipleshipTraining,
        volunteerReadinessScore,
        leadershipReadinessScore
      }
    })

    return NextResponse.json({ 
      success: true, 
      profile,
      calculatedScores: {
        volunteerReadinessScore,
        leadershipReadinessScore
      }
    })
  } catch (error) {
    console.error('Error saving enhanced spiritual assessment:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    const profile = await prisma.memberSpiritualProfile.findUnique({
      where: { memberId },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            membershipDate: true
          }
        }
      }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching spiritual profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Helper functions for calculating composite scores
function calculateVolunteerReadiness({
  spiritualMaturityScore,
  ministryPassionScore,
  availabilityScore,
  experienceLevel
}: {
  spiritualMaturityScore: number
  ministryPassionScore: number
  availabilityScore: number
  experienceLevel: number
}): number {
  // Weighted calculation for volunteer readiness
  const score = (
    (spiritualMaturityScore * 0.4) + // 40% spiritual maturity
    (ministryPassionScore * 0.3) +   // 30% ministry passion
    (availabilityScore * 0.2) +      // 20% availability
    (experienceLevel * 10 * 0.1)     // 10% experience (scale 1-10 to 0-100)
  )
  
  return Math.min(Math.max(Math.round(score), 0), 100)
}

function calculateLeadershipReadiness({
  spiritualMaturityScore,
  leadershipAptitudeScore,
  teachingAbility,
  pastoralHeart,
  organizationalSkills,
  communicationSkills,
  leadershipTrainingCompleted,
  mentoringExperience
}: {
  spiritualMaturityScore: number
  leadershipAptitudeScore: number
  teachingAbility: number
  pastoralHeart: number
  organizationalSkills: number
  communicationSkills: number
  leadershipTrainingCompleted: boolean
  mentoringExperience: boolean
}): number {
  // Weighted calculation for leadership readiness
  const baseScore = (
    (spiritualMaturityScore * 0.25) +    // 25% spiritual maturity
    (leadershipAptitudeScore * 0.25) +   // 25% leadership aptitude
    (teachingAbility * 0.15) +           // 15% teaching ability
    (pastoralHeart * 0.15) +             // 15% pastoral heart
    (organizationalSkills * 0.1) +       // 10% organizational skills
    (communicationSkills * 0.1)          // 10% communication skills
  )
  
  // Bonus points for training and experience
  let bonus = 0
  if (leadershipTrainingCompleted) bonus += 10
  if (mentoringExperience) bonus += 5
  
  const finalScore = baseScore + bonus
  return Math.min(Math.max(Math.round(finalScore), 0), 100)
}
