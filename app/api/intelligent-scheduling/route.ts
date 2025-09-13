

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, format, parseISO, isSameDay } from 'date-fns'

// Intelligent Scheduling Engine - Phase 2
interface SchedulingGap {
  id: string
  eventId?: string
  ministryId: string
  title: string
  date: Date
  startTime: string
  endTime: string
  requiredVolunteers: number
  currentVolunteers: number
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  urgencyScore: number
  requiredSkills?: string[]
  preferredGifts?: string[]
}

interface OptimalMatch {
  memberId: string
  gapId: string
  matchScore: number
  availabilityScore: number
  workloadScore: number
  skillsMatch: number
  conflictRisk: number
  reasoning: string[]
}

// Calculate volunteer workload and fatigue score
async function calculateWorkloadScore(memberId: string, targetDate: Date, churchId: string) {
  const startOfWeek = new Date(targetDate)
  startOfWeek.setDate(targetDate.getDate() - targetDate.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  // Count assignments in the same week
  const weeklyAssignments = await prisma.volunteerAssignment.count({
    where: {
      volunteer: { 
        memberId,
        churchId 
      },
      date: {
        gte: startOfWeek,
        lte: endOfWeek
      },
      status: { in: ['ASIGNADO', 'CONFIRMADO'] }
    }
  })

  // Count assignments in the last 30 days for fatigue analysis
  const monthlyAssignments = await prisma.volunteerAssignment.count({
    where: {
      volunteer: { 
        memberId,
        churchId 
      },
      date: {
        gte: addDays(targetDate, -30)
      },
      status: { in: ['ASIGNADO', 'CONFIRMADO', 'COMPLETADO'] }
    }
  })

  // Calculate workload score (100 = completely available, 0 = overloaded)
  let workloadScore = 100
  
  // Weekly penalty
  workloadScore -= weeklyAssignments * 15
  
  // Monthly fatigue penalty
  if (monthlyAssignments > 8) {
    workloadScore -= (monthlyAssignments - 8) * 5
  }
  
  return Math.max(0, Math.min(100, workloadScore))
}

// Check for scheduling conflicts
async function checkSchedulingConflicts(memberId: string, date: Date, startTime: string, endTime: string, churchId: string) {
  const conflicts = await prisma.volunteerAssignment.findMany({
    where: {
      volunteer: { 
        memberId,
        churchId 
      },
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      },
      status: { in: ['ASIGNADO', 'CONFIRMADO'] }
    }
  })

  // Check for time overlaps
  for (const conflict of conflicts) {
    if (timeOverlaps(startTime, endTime, conflict.startTime, conflict.endTime)) {
      return true
    }
  }
  
  return false
}

function timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)
  
  return s1 < e2 && e1 > s2
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Identify scheduling gaps across ministries and events
async function identifySchedulingGaps(churchId: string, daysAhead: number = 30) {
  const endDate = addDays(new Date(), daysAhead)
  
  // Get upcoming events that need volunteers
  const upcomingEvents = await prisma.event.findMany({
    where: {
      churchId,
      startDate: {
        gte: new Date(),
        lte: endDate
      }
    },
    include: {
      volunteerAssignments: {
        include: {
          volunteer: true
        }
      }
    }
  })

  // Get ministries and their typical volunteer needs
  const ministries = await prisma.ministry.findMany({
    where: {
      churchId,
      isActive: true
    },
    include: {
      volunteers: {
        include: {
          assignments: {
            where: {
              date: {
                gte: new Date(),
                lte: endDate
              }
            }
          }
        }
      }
    }
  })

  const gaps: SchedulingGap[] = []

  // Analyze event gaps
  for (const event of upcomingEvents) {
    const currentVolunteers = event.volunteerAssignments.length
    const estimatedNeed = Math.max(2, Math.ceil(currentVolunteers * 1.2)) // 20% buffer
    
    if (currentVolunteers < estimatedNeed) {
      const gap = currentVolunteers / estimatedNeed
      let priority: SchedulingGap['priority'] = 'LOW'
      let urgencyScore = 10
      
      if (gap < 0.5) {
        priority = 'CRITICAL'
        urgencyScore = 90
      } else if (gap < 0.7) {
        priority = 'HIGH'
        urgencyScore = 70
      } else if (gap < 0.8) {
        priority = 'MEDIUM'
        urgencyScore = 50
      }

      gaps.push({
        id: `event-${event.id}`,
        eventId: event.id,
        ministryId: '', // Will need ministry association
        title: `${event.title} - Voluntarios Necesarios`,
        date: event.startDate,
        startTime: format(event.startDate, 'HH:mm'),
        endTime: event.endDate ? format(event.endDate, 'HH:mm') : format(addDays(event.startDate, 0), 'HH:mm'),
        requiredVolunteers: estimatedNeed,
        currentVolunteers,
        priority,
        urgencyScore,
        requiredSkills: ['event_support'],
        preferredGifts: ['servicio', 'hospitalidad', 'ayuda']
      })
    }
  }

  // Analyze ministry gaps (weekly services, regular activities)
  for (const ministry of ministries) {
    const activeVolunteers = ministry.volunteers.filter(v => v.isActive).length
    const avgAssignments = ministry.volunteers.reduce((sum, v) => sum + v.assignments.length, 0) / Math.max(1, ministry.volunteers.length)
    
    // If ministry has low volunteer engagement, flag for recruitment
    if (activeVolunteers < 3 || avgAssignments < 1) {
      gaps.push({
        id: `ministry-${ministry.id}`,
        ministryId: ministry.id,
        title: `${ministry.name} - Necesita Voluntarios Regulares`,
        date: addDays(new Date(), 7), // Next week
        startTime: '09:00',
        endTime: '11:00',
        requiredVolunteers: Math.max(3, Math.ceil(activeVolunteers * 1.5)),
        currentVolunteers: activeVolunteers,
        priority: activeVolunteers === 0 ? 'CRITICAL' : activeVolunteers < 2 ? 'HIGH' : 'MEDIUM',
        urgencyScore: activeVolunteers === 0 ? 95 : 60 - (activeVolunteers * 10),
        requiredSkills: [],
        preferredGifts: []
      })
    }
  }

  return gaps.sort((a, b) => b.urgencyScore - a.urgencyScore)
}

// Find optimal volunteer matches for identified gaps
async function findOptimalMatches(gaps: SchedulingGap[], churchId: string): Promise<OptimalMatch[]> {
  // Get all active members with spiritual profiles
  const members = await prisma.member.findMany({
    where: {
      churchId,
      isActive: true
    },
    include: {
      spiritualProfile: true,
      availabilityMatrix: true,
      volunteers: {
        include: {
          assignments: {
            where: {
              date: { gte: new Date() },
              status: { in: ['ASIGNADO', 'CONFIRMADO'] }
            }
          }
        }
      }
    }
  })

  const matches: OptimalMatch[] = []

  for (const gap of gaps) {
    for (const member of members) {
      // Skip if member already assigned to this specific event/time
      const hasConflict = await checkSchedulingConflicts(
        member.id, 
        gap.date, 
        gap.startTime, 
        gap.endTime, 
        churchId
      )
      
      if (hasConflict) continue

      // Calculate various scoring factors
      const workloadScore = await calculateWorkloadScore(member.id, gap.date, churchId)
      
      // Availability score based on availability matrix
      let availabilityScore = 50 // Default if no matrix
      if (member.availabilityMatrix) {
        const dayOfWeek = gap.date.getDay()
        const availability = (member.availabilityMatrix as any).weeklyAvailability
        if (availability && availability[dayOfWeek]) {
          availabilityScore = 90
        }
      }

      // Skills match score
      let skillsMatch = 30 // Base score
      if (member.spiritualGifts) {
        const gifts = Array.isArray(member.spiritualGifts) ? member.spiritualGifts : []
        if (gap.preferredGifts) {
          const matchingGifts = gifts.filter((gift) => 
            typeof gift === 'string' && gap.preferredGifts?.includes(gift.toLowerCase())
          )
          skillsMatch += matchingGifts.length * 15
        }
      }

      // Experience factor
      const experienceBonus = (member.experienceLevel || 1) * 3

      // Calculate overall match score
      const matchScore = Math.min(100, 
        workloadScore * 0.3 + 
        availabilityScore * 0.3 + 
        skillsMatch * 0.25 + 
        experienceBonus * 0.15
      )

      // Only include matches above threshold
      if (matchScore > 40) {
        const reasoning = [
          `Puntuación de disponibilidad: ${availabilityScore}/100`,
          `Carga de trabajo actual: ${100 - workloadScore}% ocupado`,
          `Compatibilidad de dones: ${skillsMatch}/100`,
          `Nivel de experiencia: ${member.experienceLevel || 1}/10`
        ]

        matches.push({
          memberId: member.id,
          gapId: gap.id,
          matchScore,
          availabilityScore,
          workloadScore,
          skillsMatch,
          conflictRisk: hasConflict ? 100 : 0,
          reasoning
        })
      }
    }
  }

  // Sort matches by score and return best candidates per gap
  return matches.sort((a, b) => b.matchScore - a.matchScore)
}

// POST: Generate intelligent scheduling recommendations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { daysAhead = 30, autoAssign = false, maxRecommendations = 3 } = await request.json()

    // Step 1: Identify scheduling gaps
    console.log('🔍 Identificando brechas de programación...')
    const gaps = await identifySchedulingGaps(session.user.churchId, daysAhead)

    // Step 2: Find optimal matches for gaps
    console.log('🎯 Buscando coincidencias óptimas...')
    const allMatches = await findOptimalMatches(gaps, session.user.churchId)

    // Step 3: Group matches by gap and take top recommendations
    const gapRecommendations = gaps.map(gap => {
      const gapMatches = allMatches
        .filter(match => match.gapId === gap.id)
        .slice(0, maxRecommendations)

      return {
        gap,
        recommendations: gapMatches
      }
    })

    // Step 4: If auto-assign enabled, create assignments for top matches
    let autoAssignments = []
    if (autoAssign) {
      console.log('🤖 Auto-asignando recomendaciones principales...')
      
      for (const { gap, recommendations } of gapRecommendations) {
        if (recommendations.length > 0 && gap.priority === 'CRITICAL') {
          const topMatch = recommendations[0]
          
          // Get or create volunteer record
          const volunteer = await prisma.volunteer.findFirst({
            where: {
              memberId: topMatch.memberId,
              churchId: session.user.churchId
            }
          })

          if (volunteer) {
            const assignment = await prisma.volunteerAssignment.create({
              data: {
                volunteerId: volunteer.id,
                eventId: gap.eventId || undefined,
                title: gap.title,
                description: `Asignación automática inteligente - Puntuación: ${Math.round(topMatch.matchScore)}/100`,
                date: gap.date,
                startTime: gap.startTime,
                endTime: gap.endTime,
                status: 'ASIGNADO_AUTO',
                notes: `Recomendaciones: ${topMatch.reasoning.join(', ')}`,
                churchId: session.user.churchId
              },
              include: {
                volunteer: {
                  include: {
                    member: true
                  }
                }
              }
            })

            autoAssignments.push(assignment)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalGapsIdentified: gaps.length,
        criticalGaps: gaps.filter(g => g.priority === 'CRITICAL').length,
        highPriorityGaps: gaps.filter(g => g.priority === 'HIGH').length,
        totalRecommendations: allMatches.length,
        autoAssignments: autoAssignments.length
      },
      gaps: gapRecommendations,
      autoAssignments,
      analysis: {
        averageGapUrgency: gaps.reduce((sum, g) => sum + g.urgencyScore, 0) / gaps.length,
        topPriorityAreas: gaps.slice(0, 5).map(g => ({
          area: g.title,
          urgency: g.urgencyScore,
          shortfall: g.requiredVolunteers - g.currentVolunteers
        }))
      }
    })
  } catch (error) {
    console.error('❌ Error en motor de programación inteligente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

// GET: Fetch current scheduling analysis
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daysAhead = parseInt(searchParams.get('daysAhead') || '30')

    const gaps = await identifySchedulingGaps(session.user.churchId, daysAhead)
    
    return NextResponse.json({
      gaps,
      summary: {
        totalGaps: gaps.length,
        criticalGaps: gaps.filter(g => g.priority === 'CRITICAL').length,
        highPriorityGaps: gaps.filter(g => g.priority === 'HIGH').length,
        mediumPriorityGaps: gaps.filter(g => g.priority === 'MEDIUM').length,
        lowPriorityGaps: gaps.filter(g => g.priority === 'LOW').length
      }
    })
  } catch (error) {
    console.error('Error fetching scheduling gaps:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
