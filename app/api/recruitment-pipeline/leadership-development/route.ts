

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addMonths, differenceInMonths } from 'date-fns'

// Leadership Development and Potential Prediction System
interface LeadershipProfile {
  memberId: string
  memberName: string
  currentRole: string
  leadershipPotential: 'HIGH' | 'MEDIUM' | 'LOW' | 'EMERGING'
  leadershipScore: number
  leadershipReadiness: 'READY_NOW' | 'READY_6_MONTHS' | 'READY_1_YEAR' | 'NEEDS_DEVELOPMENT'
  strongSuits: string[]
  developmentAreas: string[]
  recommendedPositions: LeadershipOpportunity[]
  developmentPath: DevelopmentMilestone[]
  mentoringCapability: 'EXCELLENT' | 'GOOD' | 'DEVELOPING' | 'BASIC'
  influenceLevel: number
  communicationSkills: number
  spiritualMaturity: number
  experienceDepth: number
  teamLeadership: number
  visionCasting: number
  currentMentees: number
  maxMenteeCapacity: number
  nextReviewDate: Date
}

interface LeadershipOpportunity {
  positionId: string
  positionTitle: string
  ministryArea: string
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW'
  matchScore: number
  requiredSkills: string[]
  timeCommitment: string
  leadershipLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE'
  currentIncumbent?: string
  reasoning: string[]
}

interface DevelopmentMilestone {
  id: string
  title: string
  description: string
  category: 'SPIRITUAL' | 'SKILLS' | 'EXPERIENCE' | 'MENTORING' | 'TRAINING'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  estimatedDuration: string
  prerequisites: string[]
  resources: DevelopmentResource[]
  measurableOutcomes: string[]
  targetCompletionDate: Date
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED'
}

interface DevelopmentResource {
  title: string
  type: 'BOOK' | 'COURSE' | 'WORKSHOP' | 'MENTOR' | 'EXPERIENCE' | 'CONFERENCE'
  provider?: string
  cost?: string
  duration?: string
  url?: string
}

// Analyze leadership potential using comprehensive scoring
async function analyzeLeadershipPotential(member: any, churchId: string): Promise<LeadershipProfile> {
  let leadershipScore = 0
  const factors = []

  // 1. Current Leadership Readiness (25% weight)
  const baseReadiness = (member.spiritualProfile?.leadershipScore || 1) * 2.5
  leadershipScore += baseReadiness
  factors.push({ factor: 'Preparación Base', score: baseReadiness })

  // 2. Experience and Track Record (20% weight)
  const experienceScore = (member.spiritualProfile?.experienceLevel || 1) * 2
  leadershipScore += experienceScore
  factors.push({ factor: 'Experiencia', score: experienceScore })

  // 3. Current Volunteer Performance (15% weight)
  const volunteer = await prisma.volunteer.findFirst({
    where: { memberId: member.id, isActive: true },
    include: {
      assignments: {
        where: {
          status: 'COMPLETADO',
          date: { gte: addMonths(new Date(), -6) }
        }
      }
    }
  })

  let performanceScore = 0
  if (volunteer) {
    const completedAssignments = volunteer.assignments.length
    performanceScore = Math.min(15, completedAssignments * 2.5)
    factors.push({ factor: 'Desempeño', score: performanceScore })
  }
  leadershipScore += performanceScore

  // 4. Spiritual Gifts Alignment (15% weight)
  const leadershipGifts = ['liderazgo', 'administración', 'enseñanza', 'pastoreo', 'discernimiento']
  const memberGifts = member.spiritualGifts ? (Array.isArray(member.spiritualGifts) ? member.spiritualGifts : []) : []
  
  const leadershipGiftMatches = memberGifts.filter((gift: string) =>
    leadershipGifts.some(lg => gift.toLowerCase().includes(lg))
  )
  
  const giftsScore = leadershipGiftMatches.length * 5
  leadershipScore += giftsScore
  factors.push({ factor: 'Dones de Liderazgo', score: giftsScore })

  // 5. Communication and Influence (10% weight)
  const skillsMatrix = member.skillsMatrix || {}
  const communicationSkillsValue = skillsMatrix.communication || skillsMatrix.interpersonal || 5
  const influenceScore = Math.min(10, communicationSkillsValue)
  leadershipScore += influenceScore
  factors.push({ factor: 'Comunicación', score: influenceScore })

  // 6. Availability and Commitment (10% weight)
  const availabilityScore = Math.min(10, (member.availabilityScore || 0) / 10)
  leadershipScore += availabilityScore
  factors.push({ factor: 'Disponibilidad', score: availabilityScore })

  // 7. Educational Background and Learning Potential (5% weight)
  const educationScore = member.occupation?.toLowerCase().includes('gerente') ||
                         member.occupation?.toLowerCase().includes('director') ||
                         member.occupation?.toLowerCase().includes('coordinador') ? 5 : 2
  leadershipScore += educationScore
  factors.push({ factor: 'Formación', score: educationScore })

  // Determine leadership potential category
  let leadershipPotential: LeadershipProfile['leadershipPotential'] = 'LOW'
  if (leadershipScore >= 85) leadershipPotential = 'HIGH'
  else if (leadershipScore >= 70) leadershipPotential = 'MEDIUM'
  else if (leadershipScore >= 50) leadershipPotential = 'EMERGING'

  // Determine leadership readiness timeline
  let leadershipReadiness: LeadershipProfile['leadershipReadiness'] = 'NEEDS_DEVELOPMENT'
  if (leadershipScore >= 85 && (member.spiritualProfile?.experienceLevel || 1) >= 7) {
    leadershipReadiness = 'READY_NOW'
  } else if (leadershipScore >= 75) {
    leadershipReadiness = 'READY_6_MONTHS'
  } else if (leadershipScore >= 60) {
    leadershipReadiness = 'READY_1_YEAR'
  }

  // Identify strong suits and development areas
  const strongSuits = []
  const developmentAreas = []

  if (baseReadiness > 20) strongSuits.push('Alta motivación de liderazgo')
  else developmentAreas.push('Desarrollar confianza en liderazgo')

  if (experienceScore > 15) strongSuits.push('Experiencia sólida en ministerio')
  else developmentAreas.push('Ganar más experiencia práctica')

  if (giftsScore > 10) strongSuits.push('Dones espirituales para liderazgo')
  else developmentAreas.push('Desarrollar dones de liderazgo')

  if (influenceScore > 7) strongSuits.push('Habilidades de comunicación')
  else developmentAreas.push('Mejorar comunicación y influencia')

  // Generate recommended positions
  const recommendedPositions = await generateLeadershipOpportunities(member, leadershipScore, churchId)

  // Create development path
  const developmentPath = generateDevelopmentPath(member, leadershipPotential, developmentAreas)

  // Calculate detailed skill scores
  const spiritualMaturity = Math.min(100, (member.spiritualProfile?.experienceLevel || 1) * 10 + (leadershipGiftMatches.length * 15))
  const communicationSkillsScore = Math.min(100, influenceScore * 10)
  const experienceDepth = Math.min(100, experienceScore * 5)
  const teamLeadership = Math.min(100, performanceScore * 6)
  const visionCasting = Math.min(100, (member.spiritualCalling ? 30 : 10) + (giftsScore * 2))

  return {
    memberId: member.id,
    memberName: `${member.firstName} ${member.lastName}`,
    currentRole: volunteer ? 'Voluntario' : 'Miembro',
    leadershipPotential,
    leadershipScore,
    leadershipReadiness,
    strongSuits,
    developmentAreas,
    recommendedPositions,
    developmentPath,
    mentoringCapability: determineMetoringCapability(leadershipScore, experienceScore),
    influenceLevel: Math.round(influenceScore * 10),
    communicationSkills: Math.round(communicationSkillsScore),
    spiritualMaturity: Math.round(spiritualMaturity),
    experienceDepth: Math.round(experienceDepth),
    teamLeadership: Math.round(teamLeadership),
    visionCasting: Math.round(visionCasting),
    currentMentees: 0, // Would need to track this
    maxMenteeCapacity: Math.max(1, Math.floor(leadershipScore / 20)),
    nextReviewDate: addMonths(new Date(), leadershipPotential === 'HIGH' ? 3 : 6)
  }
}

async function generateLeadershipOpportunities(member: any, leadershipScore: number, churchId: string): Promise<LeadershipOpportunity[]> {
  const opportunities = []

  // Get ministries that might need leadership
  const ministries = await prisma.ministry.findMany({
    where: { churchId, isActive: true },
    include: {
      volunteers: {
        where: { isActive: true },
        include: { 
          member: {
            include: { spiritualProfile: true }
          }
        }
      }
    }
  })

  const memberGifts = member.spiritualGifts ? (Array.isArray(member.spiritualGifts) ? member.spiritualGifts : []) : []
  const memberPassions = member.ministryPassion ? (Array.isArray(member.ministryPassion) ? member.ministryPassion : []) : []

  for (const ministry of ministries) {
    const currentLeaders = ministry.volunteers.filter(v => 
      (v.member?.spiritualProfile?.leadershipScore || 10) >= 70
    )
    
    const needsLeadership = currentLeaders.length < Math.max(1, Math.ceil(ministry.volunteers.length / 5))
    
    if (needsLeadership || ministry.volunteers.length === 0) {
      let matchScore = 0
      const reasoning = []
      let urgency: LeadershipOpportunity['urgency'] = 'LOW'

      // Check passion alignment
      if (memberPassions.includes(ministry.id)) {
        matchScore += 40
        reasoning.push(`Tiene pasión por ${ministry.name}`)
      }

      // Check gifts alignment
      const ministryGiftNeeds = getMinistryLeadershipNeeds(ministry.name)
      const giftMatches = memberGifts.filter((gift: string) =>
        ministryGiftNeeds.some(need => need.toLowerCase().includes(gift.toLowerCase()))
      )
      
      if (giftMatches.length > 0) {
        matchScore += giftMatches.length * 15
        reasoning.push(`Dones alineados: ${giftMatches.join(', ')}`)
      }

      // Check urgency
      if (ministry.volunteers.length === 0) {
        urgency = 'IMMEDIATE'
        matchScore += 30
        reasoning.push('Ministerio sin líderes actuales')
      } else if (currentLeaders.length === 0) {
        urgency = 'HIGH'
        matchScore += 20
        reasoning.push('Necesita liderazgo experimentado')
      } else if (needsLeadership) {
        urgency = 'MEDIUM'
        matchScore += 10
        reasoning.push('Podría beneficiarse de liderazgo adicional')
      }

      // Adjust for leadership readiness
      matchScore += Math.min(20, leadershipScore / 5)

      if (matchScore >= 40) {
        opportunities.push({
          positionId: `leader-${ministry.id}`,
          positionTitle: `Líder de ${ministry.name}`,
          ministryArea: ministry.name,
          urgency: urgency as LeadershipOpportunity['urgency'],
          matchScore,
          requiredSkills: ministryGiftNeeds,
          timeCommitment: getLeadershipTimeCommitment(ministry.name),
          leadershipLevel: determineLeadershipLevel(ministry.volunteers.length, urgency) as LeadershipOpportunity['leadershipLevel'],
          reasoning
        })
      }
    }
  }

  // Add church-wide leadership opportunities
  if (leadershipScore >= 80) {
    opportunities.push({
      positionId: 'assistant-pastor',
      positionTitle: 'Pastor Asistente',
      ministryArea: 'Liderazgo General',
      urgency: 'MEDIUM' as LeadershipOpportunity['urgency'],
      matchScore: leadershipScore,
      requiredSkills: ['liderazgo', 'pastoreo', 'enseñanza', 'administración'],
      timeCommitment: '10-15 horas/semana',
      leadershipLevel: 'SENIOR' as LeadershipOpportunity['leadershipLevel'],
      reasoning: ['Alto potencial de liderazgo', 'Preparado para roles ejecutivos']
    })
  }

  if (leadershipScore >= 70) {
    opportunities.push({
      positionId: 'ministry-coordinator',
      positionTitle: 'Coordinador de Ministerios',
      ministryArea: 'Coordinación',
      urgency: 'LOW' as LeadershipOpportunity['urgency'],
      matchScore: leadershipScore * 0.9,
      requiredSkills: ['administración', 'liderazgo', 'organización'],
      timeCommitment: '5-8 horas/semana',
      leadershipLevel: 'MID' as LeadershipOpportunity['leadershipLevel'],
      reasoning: ['Capacidad organizacional', 'Experiencia en múltiples áreas']
    })
  }

  return opportunities.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
}

function generateDevelopmentPath(member: any, potential: string, developmentAreas: string[]): DevelopmentMilestone[] {
  const milestones = []
  const baseDate = new Date()

  // Milestone 1: Leadership Assessment
  milestones.push({
    id: 'leadership-assessment',
    title: 'Evaluación Integral de Liderazgo',
    description: 'Evaluación completa de fortalezas y áreas de desarrollo en liderazgo',
    category: 'SKILLS' as DevelopmentMilestone['category'],
    priority: 'HIGH' as DevelopmentMilestone['priority'],
    estimatedDuration: '2-3 semanas',
    prerequisites: [],
    resources: [
      {
        title: 'Evaluación 360 de Liderazgo',
        type: 'COURSE' as DevelopmentResource['type'],
        duration: '1 semana'
      },
      {
        title: 'Assessment de Dones Espirituales Avanzado',
        type: 'COURSE' as DevelopmentResource['type'],
        duration: '3 días'
      }
    ],
    measurableOutcomes: [
      'Completar evaluación 360',
      'Identificar top 3 fortalezas',
      'Definir 3 áreas de desarrollo prioritarias'
    ],
    targetCompletionDate: addMonths(baseDate, 1),
    status: 'NOT_STARTED' as DevelopmentMilestone['status']
  })

  // Milestone 2: Foundational Leadership Training
  milestones.push({
    id: 'foundational-training',
    title: 'Capacitación Foundacional de Liderazgo',
    description: 'Curso base de principios de liderazgo cristiano',
    category: 'TRAINING' as DevelopmentMilestone['category'],
    priority: 'HIGH' as DevelopmentMilestone['priority'],
    estimatedDuration: '6-8 semanas',
    prerequisites: ['leadership-assessment'],
    resources: [
      {
        title: 'Curso: Fundamentos de Liderazgo Cristiano',
        type: 'COURSE' as DevelopmentResource['type'],
        provider: 'Iglesia Local',
        duration: '8 semanas'
      },
      {
        title: 'Libro: El Líder que Todos Querríamos Tener',
        type: 'BOOK' as DevelopmentResource['type'],
        duration: '1 mes'
      }
    ],
    measurableOutcomes: [
      'Completar curso con 90%+ asistencia',
      'Aprobar evaluación final',
      'Aplicar 3 principios en rol actual'
    ],
    targetCompletionDate: addMonths(baseDate, 3),
    status: 'NOT_STARTED' as DevelopmentMilestone['status']
  })

  // Milestone 3: Mentoring Relationship
  milestones.push({
    id: 'mentoring-setup',
    title: 'Establecimiento de Mentoría',
    description: 'Asignación y inicio de relación de mentoría con líder experimentado',
    category: 'MENTORING' as DevelopmentMilestone['category'],
    priority: 'HIGH' as DevelopmentMilestone['priority'],
    estimatedDuration: '6-12 meses',
    prerequisites: ['leadership-assessment'],
    resources: [
      {
        title: 'Guía de Mentoría en Liderazgo',
        type: 'COURSE',
        duration: '2 semanas'
      },
      {
        title: 'Plan de Reuniones Mensuales',
        type: 'COURSE',
        duration: 'Ongoing'
      }
    ],
    measurableOutcomes: [
      'Asignación de mentor calificado',
      'Reuniones mensuales consistentes',
      'Plan de desarrollo personalizado'
    ],
    targetCompletionDate: addMonths(baseDate, 2),
    status: 'NOT_STARTED' as DevelopmentMilestone['status']
  })

  // Add specific milestones based on development areas
  if (developmentAreas.includes('Mejorar comunicación y influencia')) {
    milestones.push({
      id: 'communication-development',
      title: 'Desarrollo de Habilidades de Comunicación',
      description: 'Mejora en comunicación pública y habilidades de influencia',
      category: 'SKILLS',
      priority: 'MEDIUM',
      estimatedDuration: '3-4 meses',
      prerequisites: ['foundational-training'],
      resources: [
        {
          title: 'Curso de Oratoria',
          type: 'COURSE',
          duration: '6 semanas'
        },
        {
          title: 'Toastmasters International',
          type: 'EXPERIENCE',
          duration: '6 meses'
        }
      ],
      measurableOutcomes: [
        'Completar 5 presentaciones públicas',
        'Mejorar rating de comunicación en 25%',
        'Liderar al menos 2 reuniones ministeriales'
      ],
      targetCompletionDate: addMonths(baseDate, 6),
      status: 'NOT_STARTED'
    })
  }

  if (developmentAreas.includes('Ganar más experiencia práctica')) {
    milestones.push({
      id: 'practical-experience',
      title: 'Experiencia de Liderazgo Supervisada',
      description: 'Oportunidades prácticas de liderazgo con supervisión y retroalimentación',
      category: 'EXPERIENCE',
      priority: 'HIGH',
      estimatedDuration: '4-6 meses',
      prerequisites: ['mentoring-setup'],
      resources: [
        {
          title: 'Asignación de Proyecto de Liderazgo',
          type: 'EXPERIENCE',
          duration: '3-4 meses'
        },
        {
          title: 'Supervisión Semanal',
          type: 'MENTOR',
          duration: 'Ongoing'
        }
      ],
      measurableOutcomes: [
        'Liderar proyecto ministerial exitosamente',
        'Supervisar equipo de 3-5 personas',
        'Recibir evaluación positiva (4/5 o superior)'
      ],
      targetCompletionDate: addMonths(baseDate, 8),
      status: 'NOT_STARTED'
    })
  }

  // Advanced milestone for high-potential leaders
  if (potential === 'HIGH') {
    milestones.push({
      id: 'advanced-leadership',
      title: 'Capacitación Avanzada de Liderazgo',
      description: 'Desarrollo de habilidades de liderazgo senior y visión estratégica',
      category: 'TRAINING',
      priority: 'MEDIUM',
      estimatedDuration: '6-8 meses',
      prerequisites: ['practical-experience'],
      resources: [
        {
          title: 'Seminario de Liderazgo Estratégico',
          type: 'CONFERENCE',
          duration: '3 días'
        },
        {
          title: 'Coaching Ejecutivo',
          type: 'MENTOR',
          duration: '6 meses'
        }
      ],
      measurableOutcomes: [
        'Desarrollar plan estratégico para área ministerial',
        'Implementar iniciativa de mejora',
        'Prepararse para roles de liderazgo senior'
      ],
      targetCompletionDate: addMonths(baseDate, 12),
      status: 'NOT_STARTED'
    })
  }

  return milestones as DevelopmentMilestone[]
}

// Helper functions
function determineMetoringCapability(leadershipScore: number, experienceScore: number): LeadershipProfile['mentoringCapability'] {
  const mentorScore = (leadershipScore + experienceScore * 2) / 3
  
  if (mentorScore >= 80) return 'EXCELLENT'
  if (mentorScore >= 65) return 'GOOD'
  if (mentorScore >= 45) return 'DEVELOPING'
  return 'BASIC'
}

function getMinistryLeadershipNeeds(ministryName: string): string[] {
  const needs: { [key: string]: string[] } = {
    'música': ['liderazgo', 'música', 'administración', 'creatividad'],
    'enseñanza': ['enseñanza', 'liderazgo', 'pastoreo', 'comunicación'],
    'niños': ['liderazgo', 'enseñanza', 'paciencia', 'organización'],
    'jóvenes': ['liderazgo', 'mentoría', 'comunicación', 'discernimiento'],
    'administración': ['administración', 'liderazgo', 'organización', 'planificación'],
    'default': ['liderazgo', 'administración', 'comunicación']
  }

  const lowerName = ministryName.toLowerCase()
  for (const [key, skills] of Object.entries(needs)) {
    if (lowerName.includes(key)) {
      return skills
    }
  }
  return needs.default
}

function getLeadershipTimeCommitment(ministryName: string): string {
  const commitments: { [key: string]: string } = {
    'música': '6-10 horas/semana',
    'enseñanza': '5-8 horas/semana',
    'niños': '4-8 horas/semana',
    'jóvenes': '6-12 horas/semana',
    'administración': '8-15 horas/semana',
    'default': '4-6 horas/semana'
  }

  const lowerName = ministryName.toLowerCase()
  for (const [key, time] of Object.entries(commitments)) {
    if (lowerName.includes(key)) {
      return time
    }
  }
  return commitments.default
}

function determineLeadershipLevel(teamSize: number, urgency: string): LeadershipOpportunity['leadershipLevel'] {
  if (urgency === 'IMMEDIATE') return 'JUNIOR'
  if (teamSize <= 3) return 'JUNIOR'
  if (teamSize <= 10) return 'MID'
  if (teamSize <= 25) return 'SENIOR'
  return 'EXECUTIVE'
}

// POST: Generate leadership development analysis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetMemberId, minLeadershipScore = 50 } = await request.json()

    console.log('🌟 Iniciando análisis de desarrollo de liderazgo...')

    let memberFilter: any = {
      churchId: session.user.churchId,
      isActive: true,
      spiritualProfile: {
        leadershipScore: { gte: 30 } // Minimum leadership interest (30% score)
      }
    }

    if (targetMemberId) {
      memberFilter.id = targetMemberId
      delete memberFilter.spiritualProfile // Remove filter for specific member
    }

    const members = await prisma.member.findMany({
      where: memberFilter,
      include: {
        volunteers: {
          where: { isActive: true },
          include: { ministry: true }
        },
        spiritualProfile: true
      }
    })

    console.log(`📊 Analizando ${members.length} candidatos para liderazgo...`)

    const leadershipProfiles: LeadershipProfile[] = []

    for (const member of members) {
      const profile = await analyzeLeadershipPotential(member, session.user.churchId)
      
      if (profile.leadershipScore >= minLeadershipScore) {
        leadershipProfiles.push(profile)
      }
    }

    // Sort by leadership score
    leadershipProfiles.sort((a, b) => b.leadershipScore - a.leadershipScore)

    return NextResponse.json({
      success: true,
      summary: {
        totalCandidatesAnalyzed: members.length,
        qualifiedLeaders: leadershipProfiles.length,
        highPotential: leadershipProfiles.filter(p => p.leadershipPotential === 'HIGH').length,
        readyNow: leadershipProfiles.filter(p => p.leadershipReadiness === 'READY_NOW').length,
        ready6Months: leadershipProfiles.filter(p => p.leadershipReadiness === 'READY_6_MONTHS').length,
        averageLeadershipScore: Math.round(leadershipProfiles.reduce((sum, p) => sum + p.leadershipScore, 0) / leadershipProfiles.length)
      },
      leadershipProfiles,
      insights: {
        successionPlan: generateSuccessionPlan(leadershipProfiles),
        developmentPriorities: generateDevelopmentPriorities(leadershipProfiles),
        mentoringOpportunities: identifyMentoringOpportunities(leadershipProfiles)
      }
    })
  } catch (error) {
    console.error('❌ Error en análisis de desarrollo de liderazgo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

// Helper functions for insights
function generateSuccessionPlan(profiles: LeadershipProfile[]) {
  return profiles
    .filter(p => p.leadershipReadiness === 'READY_NOW' || p.leadershipReadiness === 'READY_6_MONTHS')
    .slice(0, 10)
    .map(profile => ({
      candidate: profile.memberName,
      readiness: profile.leadershipReadiness,
      bestFit: profile.recommendedPositions[0]?.positionTitle || 'A determinar',
      timeline: profile.leadershipReadiness === 'READY_NOW' ? 'Inmediato' : '3-6 meses'
    }))
}

function generateDevelopmentPriorities(profiles: LeadershipProfile[]) {
  const allDevelopmentAreas = profiles.flatMap(p => p.developmentAreas)
  const areaCount: { [key: string]: number } = {}
  
  allDevelopmentAreas.forEach(area => {
    areaCount[area] = (areaCount[area] || 0) + 1
  })

  return Object.entries(areaCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([area, count]) => ({ area, affectedCandidates: count }))
}

function identifyMentoringOpportunities(profiles: LeadershipProfile[]) {
  const excellentMentors = profiles.filter(p => p.mentoringCapability === 'EXCELLENT')
  const needsMentoring = profiles.filter(p => 
    p.leadershipPotential === 'EMERGING' || p.leadershipReadiness === 'NEEDS_DEVELOPMENT'
  )

  return excellentMentors.slice(0, 5).map(mentor => ({
    mentorName: mentor.memberName,
    capacity: mentor.maxMenteeCapacity,
    currentMentees: mentor.currentMentees,
    available: mentor.maxMenteeCapacity - mentor.currentMentees,
    strengths: mentor.strongSuits.slice(0, 3)
  }))
}

// GET: Get leadership development summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalMembers = await prisma.member.count({
      where: { churchId: session.user.churchId, isActive: true }
    })

    const potentialLeaders = await prisma.member.count({
      where: {
        churchId: session.user.churchId,
        isActive: true,
        spiritualProfile: {
          leadershipScore: { gte: 50 } // 50% leadership score threshold
        }
      }
    })

    const currentLeaders = await prisma.member.count({
      where: {
        churchId: session.user.churchId,
        isActive: true,
        volunteers: {
          some: {
            isActive: true
          }
        },
        spiritualProfile: {
          leadershipScore: { gte: 70 } // 70% leadership score for current leaders
        }
      }
    })

    return NextResponse.json({
      developmentMetrics: {
        totalMembers,
        potentialLeaders,
        currentLeaders,
        leadershipPipeline: potentialLeaders - currentLeaders,
        leadershipRatio: Math.round((currentLeaders / totalMembers) * 100),
        developmentOpportunity: Math.round(((potentialLeaders - currentLeaders) / totalMembers) * 100)
      },
      recommendations: {
        focusOnDevelopment: potentialLeaders > currentLeaders * 2,
        expandMentoring: currentLeaders < totalMembers * 0.1,
        successionPlanning: currentLeaders > 5
      }
    })
  } catch (error) {
    console.error('Error fetching leadership development metrics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
