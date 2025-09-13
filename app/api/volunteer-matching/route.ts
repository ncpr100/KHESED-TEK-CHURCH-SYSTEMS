
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Smart Volunteer Matching Algorithm
async function calculateVolunteerScore(member: any, ministryId: string, eventId?: string) {
  let score = 0
  let reasoning: string[] = []

  // Spiritual Gift Match (40% weight)
  const ministry = await prisma.ministry.findUnique({ where: { id: ministryId } })
  if (ministry) {
    const primaryGifts = member.spiritualGifts || []
    const ministryPassions = member.ministryPassion || []
    
    if (ministryPassions.includes(ministryId)) {
      score += 40
      reasoning.push(`Tiene pasión expresada por el ministerio ${ministry.name}`)
    } else if (primaryGifts.length > 0) {
      // Check if gifts match ministry type (simplified logic)
      score += 25
      reasoning.push('Tiene dones espirituales identificados')
    }
  }

  // Availability Score (25% weight)
  const availabilityMatrix = await prisma.availabilityMatrix.findUnique({
    where: { memberId: member.id }
  })
  
  if (availabilityMatrix) {
    score += 25
    reasoning.push('Tiene matriz de disponibilidad configurada')
  } else {
    score += 15
    reasoning.push('Disponibilidad general estimada')
  }

  // Experience Level (15% weight)
  const experienceScore = (member.experienceLevel || 1) * 1.5
  score += Math.min(experienceScore, 15)
  reasoning.push(`Nivel de experiencia: ${member.experienceLevel || 1}/10`)

  // Ministry Passion (10% weight)
  if (member.ministryPassion && member.ministryPassion.includes(ministryId)) {
    score += 10
    reasoning.push('Ministerio coincide con sus intereses expresados')
  }

  // Recent Activity (10% weight) - simplified
  const recentAssignments = await prisma.volunteerAssignment.count({
    where: {
      volunteer: { memberId: member.id },
      date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    }
  })

  if (recentAssignments === 0) {
    score += 10
    reasoning.push('Disponible - sin asignaciones recientes')
  } else if (recentAssignments <= 2) {
    score += 7
    reasoning.push('Actividad moderada - disponible')
  } else {
    score += 3
    reasoning.push('Muy activo - posible sobrecarga')
  }

  return {
    score: Math.min(score, 100),
    reasoning
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { ministryId, eventId, maxRecommendations = 5 } = await request.json()

    if (!ministryId) {
      return NextResponse.json({ error: 'Ministry ID is required' }, { status: 400 })
    }

    // Get all active members with spiritual profiles
    const members = await prisma.member.findMany({
      where: {
        churchId: session.user.churchId,
        isActive: true,
      },
      include: {
        spiritualProfile: true,
        volunteers: {
          include: {
            assignments: {
              where: {
                date: { gte: new Date() } // Future assignments
              }
            }
          }
        },
        availabilityMatrix: true
      }
    })

    // Calculate scores for each member
    const recommendations = []
    for (const member of members) {
      const { score, reasoning } = await calculateVolunteerScore(member, ministryId, eventId)
      
      if (score > 20) { // Minimum threshold
        recommendations.push({
          memberId: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
          score,
          reasoning,
          spiritualGifts: member.spiritualGifts || [],
          experienceLevel: member.experienceLevel || 1,
          isCurrentVolunteer: member.volunteers.length > 0,
          currentAssignments: member.volunteers.reduce((total, v) => total + v.assignments.length, 0)
        })
      }
    }

    // Sort by score (descending) and take top recommendations
    const topRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, maxRecommendations)

    // Create recommendation records
    const createdRecommendations = await Promise.all(
      topRecommendations.map(async (rec) => {
        return prisma.volunteerRecommendation.create({
          data: {
            memberId: rec.memberId,
            ministryId,
            eventId: eventId || null,
            recommendationType: 'AUTO_MATCH',
            matchScore: rec.score,
            reasoning: { reasons: rec.reasoning },
            priority: rec.score > 80 ? 'HIGH' : rec.score > 60 ? 'MEDIUM' : 'LOW',
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Valid for 7 days
          },
          include: {
            member: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            ministry: {
              select: {
                name: true
              }
            }
          }
        })
      })
    )

    return NextResponse.json({
      success: true,
      recommendations: createdRecommendations,
      summary: {
        totalCandidates: members.length,
        qualifiedCandidates: recommendations.length,
        topRecommendations: topRecommendations.length
      }
    })
  } catch (error) {
    console.error('Error generating volunteer recommendations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
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
    const ministryId = searchParams.get('ministryId')
    const status = searchParams.get('status') || 'PENDING'

    const where: any = {
      member: { churchId: session.user.churchId },
      status,
      validUntil: { gte: new Date() }
    }

    if (ministryId) {
      where.ministryId = ministryId
    }

    const recommendations = await prisma.volunteerRecommendation.findMany({
      where,
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        ministry: {
          select: {
            name: true
          }
        },
        event: {
          select: {
            title: true,
            startDate: true
          }
        }
      },
      orderBy: [
        { priority: 'asc' },
        { matchScore: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
