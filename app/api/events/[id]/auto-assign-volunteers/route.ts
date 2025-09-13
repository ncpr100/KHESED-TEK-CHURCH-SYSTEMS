

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const eventId = params.id

    // Get event details
    const event = await prisma.event.findUnique({
      where: { 
        id: eventId,
        churchId: session.user.churchId 
      },
      include: {
        volunteerAssignments: {
          include: {
            volunteer: true
          }
        },
        resourceReservations: {
          include: {
            resource: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get available volunteers with their skills and availability
    const availableVolunteers = await prisma.volunteer.findMany({
      where: {
        churchId: session.user.churchId,
        isActive: true
      },
      include: {
        member: {
          include: {
            spiritualProfile: true,
            availabilityMatrix: true
          }
        },
        assignments: {
          where: {
            date: event.startDate,
            status: { in: ['ASIGNADO', 'CONFIRMADO'] }
          }
        }
      }
    })

    // Filter volunteers who are not already assigned and available
    const eligibleVolunteers = availableVolunteers.filter(volunteer => {
      // Not already assigned to this event
      const alreadyAssigned = event.volunteerAssignments.some((ev: any) => ev.volunteerId === volunteer.id)
      if (alreadyAssigned) return false

      // Not double-booked
      const hasConflict = volunteer.assignments.some(assignment => {
        const eventStart = new Date(event.startDate)
        const eventEnd = event.endDate ? new Date(event.endDate) : new Date(eventStart.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours
        const assignmentStart = new Date(`${assignment.date.toISOString().split('T')[0]}T${assignment.startTime}`)
        const assignmentEnd = new Date(`${assignment.date.toISOString().split('T')[0]}T${assignment.endTime}`)
        
        return (assignmentStart < eventEnd && assignmentEnd > eventStart)
      })

      return !hasConflict
    })

    // Determine required roles based on event type and resources
    const requiredRoles = determineRequiredRoles(event)

    let assignedCount = 0
    const assignments = []

    // Auto-assign volunteers to roles
    for (const role of requiredRoles) {
      const bestMatch = findBestVolunteerForRole(eligibleVolunteers, role, event)
      
      if (bestMatch) {
        try {
          // Create volunteer assignment
          const assignment = await prisma.volunteerAssignment.create({
            data: {
              volunteerId: bestMatch.id,
              eventId: event.id,
              title: `${role} - ${event.title}`,
              description: `Asignación automática para ${role}`,
              date: event.startDate,
              startTime: new Date(event.startDate).toTimeString().slice(0, 5),
              endTime: event.endDate ? new Date(event.endDate).toTimeString().slice(0, 5) : '12:00',
              status: 'ASIGNADO_AUTO',
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

          assignments.push(assignment)
          assignedCount++

          // Remove assigned volunteer from eligible list
          const index = eligibleVolunteers.indexOf(bestMatch)
          if (index > -1) eligibleVolunteers.splice(index, 1)
        } catch (error) {
          console.error('Error creating assignment:', error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      assignedCount,
      assignments,
      requiredRoles,
      eligibleVolunteersCount: eligibleVolunteers.length,
      message: assignedCount > 0 
        ? `Se asignaron ${assignedCount} voluntarios automáticamente`
        : 'No se pudieron realizar asignaciones automáticas'
    })
  } catch (error) {
    console.error('Error auto-assigning volunteers:', error)
    return NextResponse.json(
      { error: 'Error en asignación automática' }, 
      { status: 500 }
    )
  }
}

function determineRequiredRoles(event: any): string[] {
  const baseRoles = ['Recepción', 'Apoyo General']
  
  // Add roles based on event category
  switch (event.category) {
    case 'CULTO':
      return [...baseRoles, 'Ujieres', 'Técnico Audio', 'Músico']
    case 'CONFERENCIA':
      return [...baseRoles, 'Técnico Audio', 'Apoyo Logístico']
    case 'SOCIAL':
      return [...baseRoles, 'Coordinador', 'Cocina', 'Limpieza']
    case 'CAPACITACION':
      return [...baseRoles, 'Asistente Instructor', 'Material']
    default:
      return baseRoles
  }
}

function findBestVolunteerForRole(volunteers: any[], role: string, event: any): any {
  if (volunteers.length === 0) return null

  // Score volunteers based on various factors
  const scoredVolunteers = volunteers.map(volunteer => {
    let score = 0
    
    // Base availability score
    score += 10

    // Skill matching
    if (volunteer.skills) {
      const skills = typeof volunteer.skills === 'string' 
        ? JSON.parse(volunteer.skills) 
        : volunteer.skills
      
      if (Array.isArray(skills)) {
        const roleKeywords = role.toLowerCase().split(' ')
        const matchingSkills = skills.filter((skill: string) => 
          roleKeywords.some(keyword => 
            skill.toLowerCase().includes(keyword)
          )
        )
        score += matchingSkills.length * 5
      }
    }

    // Experience level
    if (volunteer.member?.experienceLevel) {
      score += volunteer.member.experienceLevel * 2
    }

    // Spiritual gifts alignment
    if (volunteer.member?.spiritualGifts) {
      const gifts = Array.isArray(volunteer.member.spiritualGifts) 
        ? volunteer.member.spiritualGifts 
        : []
      
      const serviceGifts = ['servicio', 'ayuda', 'administración', 'liderazgo']
      const hasServiceGift = gifts.some((gift: string) => 
        serviceGifts.includes(gift.toLowerCase())
      )
      if (hasServiceGift) score += 8
    }

    // Prefer less loaded volunteers (those with fewer current assignments)
    const currentAssignments = volunteer.assignments?.length || 0
    score -= currentAssignments * 3

    return { volunteer, score }
  })

  // Sort by score and return best match
  scoredVolunteers.sort((a, b) => b.score - a.score)
  return scoredVolunteers[0]?.volunteer || null
}

