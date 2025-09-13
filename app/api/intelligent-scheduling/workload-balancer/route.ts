

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, startOfWeek, endOfWeek, format, isAfter } from 'date-fns'

// Workload Balancer for Fair Distribution of Volunteer Assignments
interface VolunteerWorkload {
  memberId: string
  memberName: string
  currentAssignments: number
  weeklyAssignments: number
  monthlyAssignments: number
  workloadScore: number
  burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  availabilityWindows: TimeWindow[]
  skillsProfile: string[]
  lastAssignmentDate?: Date
}

interface TimeWindow {
  dayOfWeek: number
  startTime: string
  endTime: string
  preference: 'PREFERRED' | 'AVAILABLE' | 'LIMITED'
}

interface BalancingRecommendation {
  type: 'REDISTRIBUTE' | 'REST_PERIOD' | 'NEW_RECRUITMENT' | 'SKILL_DEVELOPMENT'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  affectedMembers: string[]
  expectedImpact: string
  actionItems: string[]
}

// Calculate comprehensive workload analysis
async function analyzeVolunteerWorkloads(churchId: string): Promise<VolunteerWorkload[]> {
  const currentDate = new Date()
  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Get all active volunteers with their assignments
  const volunteers = await prisma.member.findMany({
    where: {
      churchId,
      isActive: true,
      volunteers: {
        some: {
          isActive: true
        }
      }
    },
    include: {
      volunteers: {
        include: {
          assignments: {
            where: {
              date: { gte: currentDate }
            },
            orderBy: { date: 'desc' }
          }
        }
      },
      availabilityMatrix: true
    }
  })

  const workloadAnalysis: VolunteerWorkload[] = []

  for (const volunteer of volunteers) {
    const allAssignments = volunteer.volunteers.flatMap(v => v.assignments)
    
    // Current assignments (future)
    const currentAssignments = allAssignments.filter(a => 
      isAfter(a.date, currentDate) && 
      ['ASIGNADO', 'CONFIRMADO'].includes(a.status)
    ).length

    // Weekly assignments
    const weeklyAssignments = allAssignments.filter(a => 
      a.date >= weekStart && a.date <= weekEnd &&
      ['ASIGNADO', 'CONFIRMADO', 'COMPLETADO'].includes(a.status)
    ).length

    // Monthly assignments  
    const monthlyAssignments = allAssignments.filter(a =>
      a.date >= monthStart && a.date <= monthEnd &&
      ['ASIGNADO', 'CONFIRMADO', 'COMPLETADO'].includes(a.status)
    ).length

    // Calculate workload score (0-100, higher = more overloaded)
    let workloadScore = 0
    workloadScore += Math.min(currentAssignments * 12, 60) // Max 60 points for current load
    workloadScore += Math.min(weeklyAssignments * 8, 24)   // Max 24 points for weekly
    workloadScore += Math.min(monthlyAssignments * 2, 16)  // Max 16 points for monthly

    // Determine burnout risk
    let burnoutRisk: VolunteerWorkload['burnoutRisk'] = 'LOW'
    if (workloadScore > 80 || monthlyAssignments > 12) {
      burnoutRisk = 'CRITICAL'
    } else if (workloadScore > 60 || monthlyAssignments > 8) {
      burnoutRisk = 'HIGH'
    } else if (workloadScore > 40 || monthlyAssignments > 4) {
      burnoutRisk = 'MEDIUM'
    }

    // Extract availability windows
    const availabilityWindows: TimeWindow[] = []
    if (volunteer.availabilityMatrix) {
      const matrix = volunteer.availabilityMatrix as any
      if (matrix.weeklyAvailability) {
        Object.entries(matrix.weeklyAvailability).forEach(([day, times]: [string, any]) => {
          if (times && times.available) {
            availabilityWindows.push({
              dayOfWeek: parseInt(day),
              startTime: times.startTime || '09:00',
              endTime: times.endTime || '17:00',
              preference: times.preferred ? 'PREFERRED' : 'AVAILABLE'
            })
          }
        })
      }
    }

    // Extract skills profile
    const skillsProfile = []
    if (volunteer.spiritualGifts) {
      const gifts = Array.isArray(volunteer.spiritualGifts) ? volunteer.spiritualGifts : []
      skillsProfile.push(...gifts)
    }
    if (volunteer.skillsMatrix) {
      const skills = volunteer.skillsMatrix as any
      if (skills.technical) skillsProfile.push(...skills.technical)
      if (skills.interpersonal) skillsProfile.push(...skills.interpersonal)
    }

    // Last assignment date
    const lastAssignment = allAssignments
      .filter(a => ['COMPLETADO'].includes(a.status))
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0]

    workloadAnalysis.push({
      memberId: volunteer.id,
      memberName: `${volunteer.firstName} ${volunteer.lastName}`,
      currentAssignments,
      weeklyAssignments,
      monthlyAssignments,
      workloadScore,
      burnoutRisk,
      availabilityWindows,
      skillsProfile,
      lastAssignmentDate: lastAssignment?.date
    })
  }

  return workloadAnalysis.sort((a, b) => b.workloadScore - a.workloadScore)
}

// Generate workload balancing recommendations
async function generateBalancingRecommendations(workloads: VolunteerWorkload[], churchId: string): Promise<BalancingRecommendation[]> {
  const recommendations: BalancingRecommendation[] = []

  // Identify overloaded volunteers
  const overloaded = workloads.filter(w => w.burnoutRisk === 'CRITICAL' || w.burnoutRisk === 'HIGH')
  const underutilized = workloads.filter(w => w.currentAssignments === 0 || w.monthlyAssignments < 2)

  if (overloaded.length > 0) {
    recommendations.push({
      type: 'REDISTRIBUTE',
      priority: 'HIGH',
      description: `${overloaded.length} voluntarios están sobrecargados y necesitan alivio de carga`,
      affectedMembers: overloaded.map(w => w.memberId),
      expectedImpact: 'Reducirá el agotamiento y mejorará la retención de voluntarios',
      actionItems: [
        'Reasignar algunas responsabilidades a voluntarios menos ocupados',
        'Implementar rotación de roles para distribuir la carga',
        'Considerar dividir asignaciones grandes en tareas más pequeñas',
        'Programar períodos de descanso para voluntarios de alto rendimiento'
      ]
    })

    // Suggest specific redistributions
    for (const overloadedVolunteer of overloaded.slice(0, 3)) { // Top 3 most overloaded
      const suitableAlternatives = underutilized.filter(under => {
        // Check for skill overlap
        const skillOverlap = under.skillsProfile.some(skill => 
          overloadedVolunteer.skillsProfile.includes(skill)
        )
        return skillOverlap || under.skillsProfile.length === 0 // No skills = willing to learn
      }).slice(0, 2)

      if (suitableAlternatives.length > 0) {
        recommendations.push({
          type: 'REDISTRIBUTE',
          priority: 'MEDIUM',
          description: `Redistribuir carga de ${overloadedVolunteer.memberName} a voluntarios disponibles`,
          affectedMembers: [overloadedVolunteer.memberId, ...suitableAlternatives.map(a => a.memberId)],
          expectedImpact: `Reducir carga de ${overloadedVolunteer.memberName} en 30-40%`,
          actionItems: [
            `Contactar a ${suitableAlternatives.map(a => a.memberName).join(' y ')} para nuevas asignaciones`,
            `Transferir 2-3 responsabilidades de ${overloadedVolunteer.memberName}`,
            'Proveer orientación y capacitación si es necesario'
          ]
        })
      }
    }
  }

  if (underutilized.length > 3) {
    recommendations.push({
      type: 'NEW_RECRUITMENT',
      priority: 'MEDIUM',
      description: `${underutilized.length} voluntarios están subutilizados y pueden asumir más responsabilidades`,
      affectedMembers: underutilized.map(w => w.memberId),
      expectedImpact: 'Aumentará la participación y distribuirá mejor la carga de trabajo',
      actionItems: [
        'Realizar entrevistas individuales para entender disponibilidad y intereses',
        'Ofrecer capacitación en áreas de alta demanda',
        'Crear roles flexibles para diferentes niveles de compromiso',
        'Implementar sistema de mentores para nuevos voluntarios'
      ]
    })
  }

  // Check for skill gaps
  const allSkills = workloads.flatMap(w => w.skillsProfile)
  const skillCounts = allSkills.reduce((acc, skill) => {
    acc[skill] = (acc[skill] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const rareSkills = Object.entries(skillCounts)
    .filter(([_, count]) => count < 2)
    .map(([skill]) => skill)

  if (rareSkills.length > 0) {
    recommendations.push({
      type: 'SKILL_DEVELOPMENT',
      priority: 'LOW',
      description: `Desarrollar capacidades en áreas escasas: ${rareSkills.slice(0, 3).join(', ')}`,
      affectedMembers: underutilized.slice(0, 5).map(w => w.memberId),
      expectedImpact: 'Creará redundancia en habilidades críticas y reducirá dependencia en pocos voluntarios',
      actionItems: [
        'Organizar talleres de capacitación en habilidades identificadas',
        'Crear programa de desarrollo de liderazgo',
        'Establecer sistema de mentoría para transferencia de conocimiento'
      ]
    })
  }

  // Check for volunteers needing rest
  const needingRest = workloads.filter(w => {
    return w.lastAssignmentDate && 
           w.monthlyAssignments > 6 && 
           (new Date().getTime() - w.lastAssignmentDate.getTime()) < (7 * 24 * 60 * 60 * 1000) // Less than a week since last
  })

  if (needingRest.length > 0) {
    recommendations.push({
      type: 'REST_PERIOD',
      priority: 'HIGH',
      description: `${needingRest.length} voluntarios necesitan período de descanso programado`,
      affectedMembers: needingRest.map(w => w.memberId),
      expectedImpact: 'Prevendrá el agotamiento y mantendrá la moral alta',
      actionItems: [
        'Programar descansos rotativos para voluntarios activos',
        'Encontrar reemplazos temporales',
        'Reconocer y agradecer el servicio excepcional',
        'Ofrecer actividades de recuperación y fellowship'
      ]
    })
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

// POST: Generate workload balancing analysis and recommendations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { includeInactive = false, autoImplement = false } = await request.json()

    console.log('📊 Analizando cargas de trabajo de voluntarios...')
    const workloads = await analyzeVolunteerWorkloads(session.user.churchId)

    console.log('🎯 Generando recomendaciones de balanceo...')
    const recommendations = await generateBalancingRecommendations(workloads, session.user.churchId)

    // Calculate summary statistics
    const totalVolunteers = workloads.length
    const averageWorkload = workloads.reduce((sum, w) => sum + w.workloadScore, 0) / totalVolunteers
    const highRiskCount = workloads.filter(w => ['HIGH', 'CRITICAL'].includes(w.burnoutRisk)).length
    const underutilizedCount = workloads.filter(w => w.currentAssignments === 0).length

    // Auto-implement high priority recommendations if requested
    const implementedActions: string[] = []
    if (autoImplement) {
      for (const rec of recommendations.filter(r => r.priority === 'HIGH')) {
        if (rec.type === 'REST_PERIOD') {
          // Create rest period assignments (placeholder implementation)
          implementedActions.push(`Programado período de descanso para ${rec.affectedMembers.length} voluntarios`)
        } else if (rec.type === 'REDISTRIBUTE') {
          implementedActions.push(`Iniciado proceso de redistribución para voluntarios sobrecargados`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      workloadAnalysis: workloads,
      recommendations,
      summary: {
        totalVolunteers,
        averageWorkloadScore: Math.round(averageWorkload * 10) / 10,
        highBurnoutRisk: highRiskCount,
        underutilized: underutilizedCount,
        balanceScore: Math.round((100 - (averageWorkload + (highRiskCount * 10))) * 10) / 10,
        recommendationsCount: recommendations.length,
        highPriorityActions: recommendations.filter(r => r.priority === 'HIGH').length
      },
      implementedActions,
      insights: {
        mostOverloaded: workloads.slice(0, 3).map(w => ({
          name: w.memberName,
          score: w.workloadScore,
          risk: w.burnoutRisk
        })),
        mostAvailable: workloads.slice(-3).map(w => ({
          name: w.memberName,
          assignments: w.currentAssignments,
          potential: w.availabilityWindows.length
        }))
      }
    })
  } catch (error) {
    console.error('❌ Error en balanceador de carga de trabajo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

// GET: Get current workload distribution
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (memberId) {
      // Get specific member workload
      const workloads = await analyzeVolunteerWorkloads(session.user.churchId)
      const memberWorkload = workloads.find(w => w.memberId === memberId)
      
      return NextResponse.json({
        memberWorkload,
        comparisonToAverage: memberWorkload ? {
          workloadVsAverage: memberWorkload.workloadScore - (workloads.reduce((sum, w) => sum + w.workloadScore, 0) / workloads.length),
          rankInChurch: workloads.findIndex(w => w.memberId === memberId) + 1
        } : null
      })
    } else {
      // Get summary statistics
      const workloads = await analyzeVolunteerWorkloads(session.user.churchId)
      
      return NextResponse.json({
        summary: {
          totalVolunteers: workloads.length,
          averageWorkload: workloads.reduce((sum, w) => sum + w.workloadScore, 0) / workloads.length,
          distribution: {
            low: workloads.filter(w => w.workloadScore < 30).length,
            medium: workloads.filter(w => w.workloadScore >= 30 && w.workloadScore < 60).length,
            high: workloads.filter(w => w.workloadScore >= 60 && w.workloadScore < 80).length,
            critical: workloads.filter(w => w.workloadScore >= 80).length
          }
        },
        topWorkloads: workloads.slice(0, 5)
      })
    }
  } catch (error) {
    console.error('Error fetching workload data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
