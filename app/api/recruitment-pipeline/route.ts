

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, differenceInDays } from 'date-fns'

// Phase 3: Automated Recruitment Pipeline
interface MemberRecruitmentProfile {
  memberId: string
  memberName: string
  email?: string
  phone?: string
  recruitmentScore: number
  volunteerReadiness: 'READY' | 'DEVELOPING' | 'NOT_READY' | 'NEEDS_TRAINING'
  leadershipPotential: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
  recommendedMinistries: RecommendedMinistry[]
  onboardingPath: OnboardingStep[]
  engagementLevel: number
  spiritualMaturity: number
  availabilityFactor: number
  barriers: string[]
  nextActions: string[]
}

interface RecommendedMinistry {
  ministryId: string
  ministryName: string
  matchScore: number
  reasoning: string[]
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
  estimatedTimeCommitment: string
  requiredPreparation: string[]
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  estimatedDuration: string
  prerequisite?: string
  type: 'ASSESSMENT' | 'TRAINING' | 'ORIENTATION' | 'MENTORSHIP' | 'EXPERIENCE'
  resources: string[]
  autoComplete: boolean
}

// Calculate comprehensive recruitment score for a member
async function calculateRecruitmentScore(member: any, churchId: string): Promise<number> {
  let score = 0
  const factors = []

  // 1. Spiritual Readiness (30% weight)
  const spiritualGifts = member.spiritualGifts ? (Array.isArray(member.spiritualGifts) ? member.spiritualGifts.length : 0) : 0
  const spiritualCallingPresent = !!member.spiritualCalling
  const ministryPassions = member.ministryPassion ? (Array.isArray(member.ministryPassion) ? member.ministryPassion.length : 0) : 0
  
  const spiritualScore = Math.min(30, 
    (spiritualGifts * 5) + 
    (spiritualCallingPresent ? 10 : 0) + 
    (ministryPassions * 3)
  )
  score += spiritualScore
  factors.push({ factor: 'Preparación Espiritual', score: spiritualScore, max: 30 })

  // 2. Availability & Commitment (25% weight)
  const availabilityMatrix = await prisma.availabilityMatrix.findUnique({
    where: { memberId: member.id }
  })
  
  let availabilityScore = member.availabilityScore || 0
  if (availabilityMatrix) {
    availabilityScore += 10 // Bonus for having defined availability
  }
  
  // Check attendance patterns (simplified)
  const recentCheckIns = await prisma.checkIn.count({
    where: {
      churchId,
      firstName: member.firstName,
      lastName: member.lastName,
      checkedInAt: {
        gte: addDays(new Date(), -30)
      }
    }
  })
  
  const attendanceBonus = Math.min(10, recentCheckIns * 2)
  availabilityScore = Math.min(25, availabilityScore + attendanceBonus)
  score += availabilityScore
  factors.push({ factor: 'Disponibilidad', score: availabilityScore, max: 25 })

  // 3. Experience & Skills (20% weight)
  const experienceScore = (member.experienceLevel || 1) * 2
  const skillsCount = member.skillsMatrix ? Object.keys(member.skillsMatrix).length : 0
  const skillsBonus = Math.min(8, skillsCount * 2)
  
  const totalExperienceScore = Math.min(20, experienceScore + skillsBonus)
  score += totalExperienceScore
  factors.push({ factor: 'Experiencia', score: totalExperienceScore, max: 20 })

  // 4. Leadership Potential (15% weight)
  const leadershipScore = Math.min(15, (member.leadershipReadiness || 1) * 1.5)
  score += leadershipScore
  factors.push({ factor: 'Liderazgo', score: leadershipScore, max: 15 })

  // 5. Current Engagement (10% weight)
  const isAlreadyVolunteer = await prisma.volunteer.findFirst({
    where: { memberId: member.id, isActive: true }
  })
  
  let engagementScore = 0
  if (isAlreadyVolunteer) {
    engagementScore = 5 // Bonus for being an active volunteer
  } else {
    // Check for donations or other engagement
    const recentDonations = await prisma.donation.count({
      where: {
        memberId: member.id,
        createdAt: { gte: addDays(new Date(), -90) }
      }
    })
    engagementScore = Math.min(10, recentDonations * 3)
  }
  
  score += engagementScore
  factors.push({ factor: 'Compromiso', score: engagementScore, max: 10 })

  return Math.min(100, score)
}

// Analyze leadership potential using AI-like scoring
function analyzeLeadershipPotential(member: any, recruitmentScore: number): 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN' {
  const leadershipReadiness = member.leadershipReadiness || 1
  const experienceLevel = member.experienceLevel || 1
  const hasSpiritalCalling = !!member.spiritualCalling
  const personalityType = member.personalityType || 'unknown'

  let leadershipScore = 0
  
  // Leadership readiness (40% weight)
  leadershipScore += leadershipReadiness * 4
  
  // Experience (30% weight)  
  leadershipScore += experienceLevel * 3
  
  // Spiritual calling (20% weight)
  if (hasSpiritalCalling) leadershipScore += 20
  
  // Personality type (10% weight)
  if (personalityType.toLowerCase().includes('team') || personalityType.toLowerCase().includes('leader')) {
    leadershipScore += 10
  }

  // Overall recruitment score influence
  if (recruitmentScore > 80) leadershipScore += 10
  else if (recruitmentScore > 60) leadershipScore += 5

  if (leadershipScore >= 80) return 'HIGH'
  if (leadershipScore >= 60) return 'MEDIUM'
  if (leadershipScore >= 30) return 'LOW'
  return 'UNKNOWN'
}

// Generate ministry recommendations based on member profile
async function generateMinistryRecommendations(member: any, churchId: string): Promise<RecommendedMinistry[]> {
  const ministries = await prisma.ministry.findMany({
    where: { churchId, isActive: true },
    include: {
      volunteers: {
        where: { isActive: true }
      }
    }
  })

  const recommendations: RecommendedMinistry[] = []
  const memberGifts = member.spiritualGifts ? (Array.isArray(member.spiritualGifts) ? member.spiritualGifts : []) : []
  const memberPassions = member.ministryPassion ? (Array.isArray(member.ministryPassion) ? member.ministryPassion : []) : []

  for (const ministry of ministries) {
    let matchScore = 0
    const reasoning = []

    // Check for ministry passion match (50% weight)
    if (memberPassions.includes(ministry.id)) {
      matchScore += 50
      reasoning.push(`Tiene pasión expresada por ${ministry.name}`)
    }

    // Check for spiritual gifts alignment (30% weight)
    const ministryNeeds = getMinistryGiftNeeds(ministry.name)
    const giftMatches = memberGifts.filter((gift: string) => 
      ministryNeeds.some(need => need.toLowerCase().includes(gift.toLowerCase()))
    )
    
    if (giftMatches.length > 0) {
      matchScore += giftMatches.length * 10
      reasoning.push(`Dones espirituales alineados: ${giftMatches.join(', ')}`)
    }

    // Check current staffing level (20% weight)
    const currentVolunteers = ministry.volunteers.length
    const optimalStaffing = Math.max(3, Math.ceil(currentVolunteers * 1.2))
    
    if (currentVolunteers < optimalStaffing) {
      const urgencyBonus = ((optimalStaffing - currentVolunteers) / optimalStaffing) * 20
      matchScore += urgencyBonus
      reasoning.push(`Ministerio necesita ${optimalStaffing - currentVolunteers} voluntarios adicionales`)
    }

    if (matchScore > 30) { // Minimum threshold
      let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW'
      if (currentVolunteers === 0) urgency = 'HIGH'
      else if (currentVolunteers < 2) urgency = 'MEDIUM'

      recommendations.push({
        ministryId: ministry.id,
        ministryName: ministry.name,
        matchScore,
        reasoning,
        urgency,
        estimatedTimeCommitment: estimateTimeCommitment(ministry.name),
        requiredPreparation: getRequiredPreparation(ministry.name)
      })
    }
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
}

// Generate personalized onboarding path
function generateOnboardingPath(member: any, recommendedMinistry: RecommendedMinistry): OnboardingStep[] {
  const steps: OnboardingStep[] = []
  const experienceLevel = member.experienceLevel || 1
  const hasBackgroundCheck = !!member.backgroundCheckDate

  // Step 1: Spiritual Assessment (if not complete)
  if (!member.spiritualGifts || (Array.isArray(member.spiritualGifts) && member.spiritualGifts.length === 0)) {
    steps.push({
      id: 'spiritual-assessment',
      title: 'Evaluación de Dones Espirituales',
      description: 'Complete una evaluación para identificar sus dones espirituales únicos',
      estimatedDuration: '15-20 minutos',
      type: 'ASSESSMENT',
      resources: ['Cuestionario de Dones', 'Guía de Interpretación'],
      autoComplete: false
    })
  }

  // Step 2: Ministry Orientation
  steps.push({
    id: 'ministry-orientation',
    title: `Orientación del Ministerio ${recommendedMinistry.ministryName}`,
    description: `Aprenda sobre la visión, misión y expectativas del ministerio ${recommendedMinistry.ministryName}`,
    estimatedDuration: '1-2 horas',
    type: 'ORIENTATION',
    resources: ['Manual del Ministerio', 'Video de Bienvenida', 'Contactos Clave'],
    autoComplete: false,
    prerequisite: 'spiritual-assessment'
  })

  // Step 3: Skills Training (if needed)
  if (experienceLevel < 5 || recommendedMinistry.requiredPreparation.length > 0) {
    steps.push({
      id: 'skills-training',
      title: 'Capacitación Específica',
      description: `Entrenamiento en habilidades específicas para ${recommendedMinistry.ministryName}`,
      estimatedDuration: recommendedMinistry.requiredPreparation.length > 2 ? '4-6 horas' : '2-3 horas',
      type: 'TRAINING',
      resources: recommendedMinistry.requiredPreparation,
      autoComplete: false,
      prerequisite: 'ministry-orientation'
    })
  }

  // Step 4: Background Check (if required and not complete)
  const requiresBackgroundCheck = ['niños', 'jóvenes', 'seguridad', 'children', 'youth', 'security']
  if (!hasBackgroundCheck && requiresBackgroundCheck.some(keyword => 
    recommendedMinistry.ministryName.toLowerCase().includes(keyword))) {
    
    steps.push({
      id: 'background-check',
      title: 'Verificación de Antecedentes',
      description: 'Complete la verificación de antecedentes requerida para este ministerio',
      estimatedDuration: '5-7 días hábiles',
      type: 'ASSESSMENT',
      resources: ['Formulario de Solicitud', 'Lista de Documentos'],
      autoComplete: false
    })
  }

  // Step 5: Mentorship Assignment
  steps.push({
    id: 'mentorship-assignment',
    title: 'Asignación de Mentor',
    description: 'Emparejamiento con un mentor experimentado para guía personalizada',
    estimatedDuration: '30 minutos inicial + seguimiento',
    type: 'MENTORSHIP',
    resources: ['Perfil del Mentor', 'Guía de Mentoría', 'Calendario de Reuniones'],
    autoComplete: true,
    prerequisite: 'ministry-orientation'
  })

  // Step 6: Trial Experience
  steps.push({
    id: 'trial-experience',
    title: 'Experiencia de Prueba',
    description: 'Participe en actividades del ministerio con supervisión antes del compromiso completo',
    estimatedDuration: '2-4 semanas',
    type: 'EXPERIENCE',
    resources: ['Plan de Actividades', 'Formulario de Retroalimentación'],
    autoComplete: false,
    prerequisite: steps.find(s => s.id === 'skills-training')?.id || 'mentorship-assignment'
  })

  return steps
}

// Helper functions for ministry-specific logic
function getMinistryGiftNeeds(ministryName: string): string[] {
  const ministryGifts: { [key: string]: string[] } = {
    'música': ['música', 'adoración', 'creatividad', 'arte'],
    'enseñanza': ['enseñanza', 'pastoreo', 'conocimiento', 'sabiduría'],
    'niños': ['enseñanza', 'pastoreo', 'servicio', 'paciencia'],
    'jóvenes': ['liderazgo', 'discernimiento', 'evangelismo', 'enseñanza'],
    'evangelismo': ['evangelismo', 'fe', 'discernimiento'],
    'servicio': ['servicio', 'ayuda', 'hospitalidad'],
    'administración': ['administración', 'liderazgo', 'conocimiento'],
    'tecnología': ['servicio', 'conocimiento', 'ayuda'],
    'default': ['servicio', 'fe', 'amor']
  }

  const lowerName = ministryName.toLowerCase()
  for (const [key, gifts] of Object.entries(ministryGifts)) {
    if (lowerName.includes(key)) {
      return gifts
    }
  }
  return ministryGifts.default
}

function estimateTimeCommitment(ministryName: string): string {
  const timeCommitments: { [key: string]: string } = {
    'música': '4-6 horas/semana',
    'enseñanza': '3-5 horas/semana', 
    'niños': '2-4 horas/semana',
    'jóvenes': '3-6 horas/semana',
    'administración': '2-8 horas/semana',
    'tecnología': '2-4 horas/semana',
    'default': '2-3 horas/semana'
  }

  const lowerName = ministryName.toLowerCase()
  for (const [key, time] of Object.entries(timeCommitments)) {
    if (lowerName.includes(key)) {
      return time
    }
  }
  return timeCommitments.default
}

function getRequiredPreparation(ministryName: string): string[] {
  const preparations: { [key: string]: string[] } = {
    'música': ['Audición Musical', 'Capacitación en Equipos de Sonido'],
    'enseñanza': ['Curso de Hermenéutica', 'Taller de Comunicación Efectiva'],
    'niños': ['Certificación en Primeros Auxilios', 'Curso de Desarrollo Infantil'],
    'jóvenes': ['Seminario de Mentoría Juvenil', 'Taller de Liderazgo'],
    'tecnología': ['Capacitación Técnica Básica', 'Manejo de Equipos'],
    'default': ['Orientación General']
  }

  const lowerName = ministryName.toLowerCase()
  for (const [key, prep] of Object.entries(preparations)) {
    if (lowerName.includes(key)) {
      return prep
    }
  }
  return preparations.default
}

// POST: Run comprehensive recruitment analysis
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetMemberId, includeVolunteers = false, minScore = 40 } = await request.json()

    console.log('🎯 Iniciando análisis de pipeline de reclutamiento...')

    let memberFilter: any = {
      churchId: session.user.churchId,
      isActive: true
    }

    // Exclude current volunteers unless specifically included
    if (!includeVolunteers) {
      memberFilter.volunteers = {
        none: {
          isActive: true
        }
      }
    }

    // Target specific member if requested
    if (targetMemberId) {
      memberFilter.id = targetMemberId
    }

    const members = await prisma.member.findMany({
      where: memberFilter,
      include: {
        volunteers: {
          where: { isActive: true }
        },
        spiritualProfile: true,
        availabilityMatrix: true
      }
    })

    console.log(`📊 Analizando ${members.length} miembros...`)

    const recruitmentProfiles: MemberRecruitmentProfile[] = []

    for (const member of members) {
      const recruitmentScore = await calculateRecruitmentScore(member, session.user.churchId)
      
      if (recruitmentScore >= minScore) {
        const leadershipPotential = analyzeLeadershipPotential(member, recruitmentScore)
        const recommendedMinistries = await generateMinistryRecommendations(member, session.user.churchId)
        
        // Determine volunteer readiness
        let volunteerReadiness: MemberRecruitmentProfile['volunteerReadiness'] = 'NOT_READY'
        if (recruitmentScore >= 80) volunteerReadiness = 'READY'
        else if (recruitmentScore >= 60) volunteerReadiness = 'DEVELOPING'  
        else if (recruitmentScore >= 40) volunteerReadiness = 'NEEDS_TRAINING'

        // Generate onboarding path for top ministry recommendation
        let onboardingPath: OnboardingStep[] = []
        if (recommendedMinistries.length > 0) {
          onboardingPath = generateOnboardingPath(member, recommendedMinistries[0])
        }

        // Identify barriers
        const barriers: string[] = []
        if (!member.spiritualGifts || (Array.isArray(member.spiritualGifts) && member.spiritualGifts.length === 0)) {
          barriers.push('Necesita evaluación de dones espirituales')
        }
        if ((member.experienceLevel || 1) < 3) {
          barriers.push('Experiencia limitada en ministerio')
        }
        if (!member.availabilityMatrix) {
          barriers.push('Disponibilidad no definida')
        }
        if (member.volunteers.length === 0 && !member.backgroundCheckDate) {
          barriers.push('Verificación de antecedentes pendiente')
        }

        // Generate next actions
        const nextActions: string[] = []
        if (volunteerReadiness === 'READY') {
          nextActions.push('Contactar para invitación directa al ministerio')
          nextActions.push('Programar reunión de orientación')
        } else if (volunteerReadiness === 'DEVELOPING') {
          nextActions.push('Invitar a eventos de ministerio como observador')
          nextActions.push('Ofrecer capacitación complementaria')
        } else {
          nextActions.push('Iniciar proceso de desarrollo básico')
          nextActions.push('Asignar mentor para crecimiento')
        }

        recruitmentProfiles.push({
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          email: member.email || undefined,
          phone: member.phone || undefined,
          recruitmentScore,
          volunteerReadiness,
          leadershipPotential,
          recommendedMinistries,
          onboardingPath,
          engagementLevel: Math.round(recruitmentScore * 0.8),
          spiritualMaturity: (member.experienceLevel || 1) * 10,
          availabilityFactor: member.availabilityScore || 0,
          barriers,
          nextActions
        })
      }
    }

    // Sort by recruitment score
    recruitmentProfiles.sort((a, b) => b.recruitmentScore - a.recruitmentScore)

    return NextResponse.json({
      success: true,
      summary: {
        totalMembersAnalyzed: members.length,
        qualifiedCandidates: recruitmentProfiles.length,
        readyForRecruitment: recruitmentProfiles.filter(p => p.volunteerReadiness === 'READY').length,
        developingCandidates: recruitmentProfiles.filter(p => p.volunteerReadiness === 'DEVELOPING').length,
        highLeadershipPotential: recruitmentProfiles.filter(p => p.leadershipPotential === 'HIGH').length,
        averageRecruitmentScore: Math.round(recruitmentProfiles.reduce((sum, p) => sum + p.recruitmentScore, 0) / recruitmentProfiles.length)
      },
      recruitmentProfiles,
      insights: {
        topCandidates: recruitmentProfiles.slice(0, 5),
        mostInDemandMinistries: getMostInDemandMinistries(recruitmentProfiles),
        commonBarriers: getCommonBarriers(recruitmentProfiles)
      }
    })
  } catch (error) {
    console.error('❌ Error en pipeline de reclutamiento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

// Helper functions for insights
function getMostInDemandMinistries(profiles: MemberRecruitmentProfile[]) {
  const ministryDemand: { [key: string]: number } = {}
  
  profiles.forEach(profile => {
    profile.recommendedMinistries.forEach(ministry => {
      ministryDemand[ministry.ministryName] = (ministryDemand[ministry.ministryName] || 0) + 1
    })
  })

  return Object.entries(ministryDemand)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ ministryName: name, candidateCount: count }))
}

function getCommonBarriers(profiles: MemberRecruitmentProfile[]) {
  const barrierCount: { [key: string]: number } = {}
  
  profiles.forEach(profile => {
    profile.barriers.forEach(barrier => {
      barrierCount[barrier] = (barrierCount[barrier] || 0) + 1
    })
  })

  return Object.entries(barrierCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([barrier, count]) => ({ barrier, memberCount: count }))
}

// GET: Get recruitment pipeline status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get basic pipeline metrics
    const totalMembers = await prisma.member.count({
      where: { churchId: session.user.churchId, isActive: true }
    })

    const currentVolunteers = await prisma.volunteer.count({
      where: { churchId: session.user.churchId, isActive: true }
    })

    const membersWithSpiritualProfiles = await prisma.member.count({
      where: {
        churchId: session.user.churchId,
        isActive: true,
        spiritualProfile: { isNot: null }
      }
    })

    const membersWithAvailability = await prisma.member.count({
      where: {
        churchId: session.user.churchId,
        isActive: true,
        availabilityMatrix: { isNot: null }
      }
    })

    return NextResponse.json({
      pipelineMetrics: {
        totalMembers,
        currentVolunteers,
        potentialCandidates: totalMembers - currentVolunteers,
        conversionRate: Math.round((currentVolunteers / totalMembers) * 100),
        profileCompleteness: Math.round((membersWithSpiritualProfiles / totalMembers) * 100),
        availabilityDefined: Math.round((membersWithAvailability / totalMembers) * 100)
      },
      recommendations: {
        prioritizeProfileCompletion: membersWithSpiritualProfiles < totalMembers * 0.7,
        focusOnAvailability: membersWithAvailability < totalMembers * 0.5,
        readyForAutomation: membersWithSpiritualProfiles > totalMembers * 0.8
      }
    })
  } catch (error) {
    console.error('Error fetching pipeline metrics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
