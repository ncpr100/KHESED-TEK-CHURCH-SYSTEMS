

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Onboarding Workflow Management System
interface OnboardingWorkflow {
  id: string
  memberId: string
  memberName: string
  targetMinistryId: string
  targetMinistryName: string
  workflowStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  currentStepId?: string
  completedSteps: string[]
  totalSteps: number
  progressPercentage: number
  estimatedCompletionDate: Date
  mentorId?: string
  mentorName?: string
  notes: string[]
  createdAt: Date
  updatedAt: Date
  steps: OnboardingWorkflowStep[]
}

interface OnboardingWorkflowStep {
  id: string
  title: string
  description: string
  stepType: 'ASSESSMENT' | 'TRAINING' | 'ORIENTATION' | 'MENTORSHIP' | 'EXPERIENCE' | 'DOCUMENTATION'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED'
  estimatedDuration: string
  actualDuration?: string
  prerequisiteStepIds: string[]
  resources: OnboardingResource[]
  completedAt?: Date
  completedBy?: string
  notes?: string
  autoAdvance: boolean
  reminderSent: boolean
}

interface OnboardingResource {
  id: string
  title: string
  type: 'DOCUMENT' | 'VIDEO' | 'CHECKLIST' | 'FORM' | 'LINK' | 'CONTACT'
  url?: string
  description?: string
  required: boolean
  completed: boolean
}

// Create a new onboarding workflow
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { 
      memberId, 
      targetMinistryId, 
      customSteps = [],
      assignMentor = true,
      autoStart = true 
    } = await request.json()

    // Verify member exists
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        churchId: session.user.churchId,
        isActive: true
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Verify ministry exists
    const ministry = await prisma.ministry.findFirst({
      where: {
        id: targetMinistryId,
        churchId: session.user.churchId
      }
    })

    if (!ministry) {
      return NextResponse.json({ error: 'Ministry not found' }, { status: 404 })
    }

    // Generate default workflow steps if none provided
    let workflowSteps = customSteps
    if (workflowSteps.length === 0) {
      workflowSteps = generateDefaultWorkflowSteps(member, ministry)
    }

    // Find available mentor if requested
    let mentorId: string | undefined
    let mentorName: string | undefined
    
    if (assignMentor) {
      const potentialMentor = await findAvailableMentor(targetMinistryId, session.user.churchId)
      if (potentialMentor) {
        mentorId = potentialMentor.id
        mentorName = `${potentialMentor.firstName} ${potentialMentor.lastName}`
      }
    }

    // Create workflow in database using a custom workflow table
    // For this implementation, we'll store it in a JSON field on the member
    const workflowData: OnboardingWorkflow = {
      id: `workflow-${Date.now()}`,
      memberId: member.id,
      memberName: `${member.firstName} ${member.lastName}`,
      targetMinistryId,
      targetMinistryName: ministry.name,
      workflowStatus: autoStart ? 'IN_PROGRESS' : 'NOT_STARTED',
      currentStepId: autoStart ? workflowSteps[0]?.id : undefined,
      completedSteps: [],
      totalSteps: workflowSteps.length,
      progressPercentage: 0,
      estimatedCompletionDate: calculateEstimatedCompletion(workflowSteps),
      mentorId,
      mentorName,
      notes: [`Workflow creado el ${new Date().toLocaleDateString()}`],
      createdAt: new Date(),
      updatedAt: new Date(),
      steps: workflowSteps.map((step: any) => ({
        ...step,
        status: 'PENDING',
        reminderSent: false,
        autoAdvance: step.autoAdvance || false
      }))
    }

    // Store workflow data (simplified - in production you'd want a dedicated table)
    await prisma.member.update({
      where: { id: memberId },
      data: {
        notes: `${member.notes || ''}\n[ONBOARDING] Workflow iniciado para ${ministry.name}`
      }
    })

    // Create volunteer recommendation record
    await prisma.volunteerRecommendation.create({
      data: {
        memberId,
        ministryId: targetMinistryId,
        recommendationType: 'ONBOARDING_WORKFLOW',
        matchScore: 85, // High score since this is a committed workflow
        reasoning: { 
          workflow: 'Onboarding workflow iniciado',
          steps: workflowSteps.length,
          mentor: mentorName || 'Sin mentor asignado'
        },
        priority: 'HIGH',
        validUntil: workflowData.estimatedCompletionDate
      }
    })

    // Send notification to member (simplified)
    if (autoStart) {
      console.log(`📧 Notificación enviada a ${member.firstName} ${member.lastName} sobre inicio de onboarding`)
    }

    // Send notification to mentor if assigned
    if (mentorId) {
      console.log(`👥 Notificación enviada al mentor ${mentorName} sobre nueva asignación`)
    }

    return NextResponse.json({
      success: true,
      workflow: workflowData,
      message: `Workflow de onboarding creado exitosamente para ${member.firstName} ${member.lastName}`,
      nextActions: [
        autoStart ? 'Workflow iniciado automáticamente' : 'Workflow listo para iniciar',
        mentorId ? `Mentor asignado: ${mentorName}` : 'Considerar asignar un mentor',
        'Seguimiento programado automáticamente'
      ]
    })

  } catch (error) {
    console.error('❌ Error creando workflow de onboarding:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

// Get existing onboarding workflows
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status')
    const ministryId = searchParams.get('ministryId')

    // For this simplified implementation, we'll get workflows from recommendations
    // In production, you'd have a dedicated onboarding_workflows table
    
    let whereClause: any = {
      member: { churchId: session.user.churchId },
      recommendationType: 'ONBOARDING_WORKFLOW'
    }

    if (memberId) whereClause.memberId = memberId
    if (ministryId) whereClause.ministryId = ministryId

    const workflows = await prisma.volunteerRecommendation.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert recommendations to workflow format
    const workflowSummaries = workflows.map(workflow => ({
      id: workflow.id,
      memberId: workflow.memberId,
      memberName: `${workflow.member.firstName} ${workflow.member.lastName}`,
      memberEmail: workflow.member.email,
      targetMinistryId: workflow.ministryId,
      targetMinistryName: workflow.ministry?.name,
      status: workflow.status,
      priority: workflow.priority,
      matchScore: workflow.matchScore,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      estimatedCompletion: workflow.validUntil
    }))

    return NextResponse.json({
      workflows: workflowSummaries,
      summary: {
        total: workflows.length,
        inProgress: workflows.filter(w => w.status === 'PENDING').length,
        completed: workflows.filter(w => w.status === 'ACCEPTED').length,
        cancelled: workflows.filter(w => w.status === 'REJECTED').length
      }
    })

  } catch (error) {
    console.error('Error fetching onboarding workflows:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

// Helper functions
function generateDefaultWorkflowSteps(member: any, ministry: any): OnboardingWorkflowStep[] {
  const steps: OnboardingWorkflowStep[] = []
  const stepId = (name: string) => `${name}-${Date.now()}`

  // Step 1: Welcome & Introduction
  steps.push({
    id: stepId('welcome'),
    title: 'Bienvenida y Introducción',
    description: `¡Bienvenido al proceso de onboarding para ${ministry.name}! Este es el primer paso de tu journey.`,
    stepType: 'ORIENTATION',
    status: 'PENDING',
    estimatedDuration: '15 minutos',
    prerequisiteStepIds: [],
    resources: [
      {
        id: 'welcome-video',
        title: 'Video de Bienvenida',
        type: 'VIDEO',
        description: 'Video introductorio del ministerio',
        required: true,
        completed: false
      },
      {
        id: 'contact-info',
        title: 'Información de Contacto del Líder',
        type: 'CONTACT',
        description: 'Datos de contacto del líder del ministerio',
        required: true,
        completed: false
      }
    ],
    autoAdvance: true,
    reminderSent: false
  })

  // Step 2: Spiritual Gifts Assessment (if not complete)
  if (!member.spiritualGifts || (Array.isArray(member.spiritualGifts) && member.spiritualGifts.length === 0)) {
    steps.push({
      id: stepId('spiritual-assessment'),
      title: 'Evaluación de Dones Espirituales',
      description: 'Complete la evaluación para identificar sus dones espirituales únicos.',
      stepType: 'ASSESSMENT',
      status: 'PENDING',
      estimatedDuration: '20 minutos',
      prerequisiteStepIds: [steps[0].id],
      resources: [
        {
          id: 'gifts-assessment',
          title: 'Cuestionario de Dones Espirituales',
          type: 'FORM',
          description: 'Evaluación completa de dones espirituales',
          required: true,
          completed: false
        },
        {
          id: 'gifts-guide',
          title: 'Guía de Interpretación de Resultados',
          type: 'DOCUMENT',
          description: 'Documento explicativo de los diferentes dones',
          required: false,
          completed: false
        }
      ],
      autoAdvance: false,
      reminderSent: false
    })
  }

  // Step 3: Ministry-Specific Training
  steps.push({
    id: stepId('ministry-training'),
    title: `Capacitación Específica - ${ministry.name}`,
    description: `Aprenda las habilidades y conocimientos específicos necesarios para servir en ${ministry.name}.`,
    stepType: 'TRAINING',
    status: 'PENDING',
    estimatedDuration: '2-4 horas',
    prerequisiteStepIds: [steps[steps.length - 1].id],
    resources: [
      {
        id: 'ministry-manual',
        title: `Manual del Ministerio ${ministry.name}`,
        type: 'DOCUMENT',
        description: 'Guía completa del ministerio',
        required: true,
        completed: false
      },
      {
        id: 'training-checklist',
        title: 'Lista de Verificación de Capacitación',
        type: 'CHECKLIST',
        description: 'Elementos clave a dominar',
        required: true,
        completed: false
      }
    ],
    autoAdvance: false,
    reminderSent: false
  })

  // Step 4: Mentor Assignment and First Meeting
  steps.push({
    id: stepId('mentorship'),
    title: 'Asignación de Mentor',
    description: 'Conozca a su mentor asignado y establezca expectativas para el crecimiento.',
    stepType: 'MENTORSHIP',
    status: 'PENDING',
    estimatedDuration: '45 minutos',
    prerequisiteStepIds: [steps[steps.length - 1].id],
    resources: [
      {
        id: 'mentor-profile',
        title: 'Perfil del Mentor',
        type: 'DOCUMENT',
        description: 'Información sobre su mentor asignado',
        required: false,
        completed: false
      },
      {
        id: 'mentorship-goals',
        title: 'Formulario de Metas de Mentoría',
        type: 'FORM',
        description: 'Establezca metas para el proceso de mentoría',
        required: true,
        completed: false
      }
    ],
    autoAdvance: true,
    reminderSent: false
  })

  // Step 5: Shadow Experience
  steps.push({
    id: stepId('shadow-experience'),
    title: 'Experiencia de Observación',
    description: 'Observe y aprenda participando como observador en las actividades del ministerio.',
    stepType: 'EXPERIENCE',
    status: 'PENDING',
    estimatedDuration: '2-3 semanas',
    prerequisiteStepIds: [steps[steps.length - 1].id],
    resources: [
      {
        id: 'observation-guide',
        title: 'Guía de Observación',
        type: 'CHECKLIST',
        description: 'Qué observar y aprender durante la experiencia',
        required: true,
        completed: false
      },
      {
        id: 'reflection-form',
        title: 'Formulario de Reflexión',
        type: 'FORM',
        description: 'Reflexiones sobre la experiencia de observación',
        required: true,
        completed: false
      }
    ],
    autoAdvance: false,
    reminderSent: false
  })

  // Step 6: Trial Service Period
  steps.push({
    id: stepId('trial-service'),
    title: 'Período de Servicio de Prueba',
    description: 'Participe activamente en el ministerio con supervisión y retroalimentación.',
    stepType: 'EXPERIENCE',
    status: 'PENDING',
    estimatedDuration: '4-6 semanas',
    prerequisiteStepIds: [steps[steps.length - 1].id],
    resources: [
      {
        id: 'service-schedule',
        title: 'Horario de Servicio de Prueba',
        type: 'DOCUMENT',
        description: 'Cronograma detallado del período de prueba',
        required: true,
        completed: false
      },
      {
        id: 'feedback-form',
        title: 'Formulario de Retroalimentación',
        type: 'FORM',
        description: 'Evaluación del desempeño durante el período de prueba',
        required: true,
        completed: false
      }
    ],
    autoAdvance: false,
    reminderSent: false
  })

  // Step 7: Final Evaluation and Commitment
  steps.push({
    id: stepId('final-evaluation'),
    title: 'Evaluación Final y Compromiso',
    description: 'Revisión final del proceso y confirmación del compromiso de servicio.',
    stepType: 'ASSESSMENT',
    status: 'PENDING',
    estimatedDuration: '30 minutos',
    prerequisiteStepIds: [steps[steps.length - 1].id],
    resources: [
      {
        id: 'final-evaluation',
        title: 'Evaluación Final',
        type: 'FORM',
        description: 'Evaluación completa del proceso de onboarding',
        required: true,
        completed: false
      },
      {
        id: 'commitment-agreement',
        title: 'Acuerdo de Compromiso de Servicio',
        type: 'DOCUMENT',
        description: 'Documento formal de compromiso con el ministerio',
        required: true,
        completed: false
      }
    ],
    autoAdvance: true,
    reminderSent: false
  })

  return steps
}

async function findAvailableMentor(ministryId: string, churchId: string) {
  // Find experienced volunteers in the same ministry who could serve as mentors
  const potentialMentors = await prisma.volunteer.findMany({
    where: {
      ministryId,
      churchId,
      isActive: true,
      member: {
        isActive: true,
        experienceLevel: { gte: 5 }, // At least experience level 5
        leadershipReadiness: { gte: 6 } // Some leadership potential
      }
    },
    include: {
      member: true,
      assignments: {
        where: {
          date: { gte: new Date() }
        }
      }
    }
  })

  // Find mentor with lowest current workload
  let bestMentor = null
  let lowestWorkload = Infinity

  for (const mentor of potentialMentors) {
    const currentAssignments = mentor.assignments.length
    if (currentAssignments < lowestWorkload) {
      lowestWorkload = currentAssignments
      bestMentor = mentor.member
    }
  }

  return bestMentor
}

function calculateEstimatedCompletion(steps: OnboardingWorkflowStep[]): Date {
  const baseDate = new Date()
  
  // Simple calculation based on estimated durations
  // In practice, this would be more sophisticated
  const totalWeeks = steps.reduce((total, step) => {
    const duration = step.estimatedDuration
    if (duration.includes('semana')) {
      return total + parseInt(duration.match(/\d+/)?.[0] || '1')
    } else if (duration.includes('día')) {
      return total + (parseInt(duration.match(/\d+/)?.[0] || '1') / 7)
    } else if (duration.includes('hora')) {
      return total + (parseInt(duration.match(/\d+/)?.[0] || '1') / 20) // Assuming 20 hours per week
    }
    return total + 0.5 // Default to half week
  }, 0)

  const completionDate = new Date(baseDate)
  completionDate.setDate(completionDate.getDate() + (totalWeeks * 7))
  
  return completionDate
}
