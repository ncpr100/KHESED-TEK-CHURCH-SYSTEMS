

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addHours, format, parseISO, isSameDay, differenceInMinutes } from 'date-fns'

// Conflict Resolution System for Intelligent Scheduling
interface SchedulingConflict {
  id: string
  type: 'TIME_OVERLAP' | 'OVERLOAD' | 'SKILL_MISMATCH' | 'AVAILABILITY_CONFLICT'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  memberId: string
  conflictingAssignments: string[]
  description: string
  suggestedResolutions: ConflictResolution[]
}

interface ConflictResolution {
  type: 'REASSIGN' | 'TIME_SHIFT' | 'SPLIT_ASSIGNMENT' | 'FIND_REPLACEMENT'
  description: string
  impact: string
  alternativeMembers?: { memberId: string, name: string, score: number }[]
  timeAdjustments?: { originalTime: string, suggestedTime: string }
}

// Detect scheduling conflicts for a specific member
async function detectMemberConflicts(memberId: string, churchId: string): Promise<SchedulingConflict[]> {
  const conflicts: SchedulingConflict[] = []

  // Get all upcoming assignments for this member
  const assignments = await prisma.volunteerAssignment.findMany({
    where: {
      volunteer: {
        memberId,
        churchId
      },
      date: { gte: new Date() },
      status: { in: ['ASIGNADO', 'CONFIRMADO', 'ASIGNADO_AUTO'] }
    },
    include: {
      volunteer: {
        include: {
          member: true
        }
      },
      event: true
    },
    orderBy: {
      date: 'asc'
    }
  })

  // Check for time overlaps
  for (let i = 0; i < assignments.length; i++) {
    for (let j = i + 1; j < assignments.length; j++) {
      const assignment1 = assignments[i]
      const assignment2 = assignments[j]

      // Check if same day
      if (isSameDay(assignment1.date, assignment2.date)) {
        const start1Minutes = timeToMinutes(assignment1.startTime)
        const end1Minutes = timeToMinutes(assignment1.endTime)
        const start2Minutes = timeToMinutes(assignment2.startTime)
        const end2Minutes = timeToMinutes(assignment2.endTime)

        // Check for overlap
        if (start1Minutes < end2Minutes && end1Minutes > start2Minutes) {
          const overlapMinutes = Math.min(end1Minutes, end2Minutes) - Math.max(start1Minutes, start2Minutes)
          
          conflicts.push({
            id: `overlap-${assignment1.id}-${assignment2.id}`,
            type: 'TIME_OVERLAP',
            severity: overlapMinutes > 60 ? 'CRITICAL' : overlapMinutes > 30 ? 'HIGH' : 'MEDIUM',
            memberId,
            conflictingAssignments: [assignment1.id, assignment2.id],
            description: `Conflicto de tiempo: ${assignment1.title} (${assignment1.startTime}-${assignment1.endTime}) se superpone con ${assignment2.title} (${assignment2.startTime}-${assignment2.endTime}) por ${overlapMinutes} minutos`,
            suggestedResolutions: await generateConflictResolutions(assignment1, assignment2, churchId)
          })
        }
      }
    }
  }

  // Check for volunteer overload (too many assignments in a short period)
  const weeklyLoads: { [week: string]: typeof assignments } = {}
  assignments.forEach(assignment => {
    const week = getWeekKey(assignment.date)
    if (!weeklyLoads[week]) weeklyLoads[week] = []
    weeklyLoads[week].push(assignment)
  })

  // Check for overload conflicts
  for (const [week, weekAssignments] of Object.entries(weeklyLoads)) {
    if (weekAssignments.length > 4) { // More than 4 assignments per week
      const alternatives = await findAlternativeVolunteers(weekAssignments, churchId)
      
      conflicts.push({
        id: `overload-${memberId}-${week}`,
        type: 'OVERLOAD',
        severity: weekAssignments.length > 6 ? 'CRITICAL' : 'HIGH',
        memberId,
        conflictingAssignments: weekAssignments.map(a => a.id),
        description: `Sobrecarga de trabajo: ${weekAssignments.length} asignaciones en la semana del ${week}`,
        suggestedResolutions: [{
          type: 'FIND_REPLACEMENT',
          description: 'Buscar voluntarios alternativos para algunas asignaciones',
          impact: 'Reducirá la carga de trabajo y mejorará la sostenibilidad del voluntario',
          alternativeMembers: alternatives
        }]
      })
    }
  }

  return conflicts
}

// Generate resolution suggestions for conflicts
async function generateConflictResolutions(assignment1: any, assignment2: any, churchId: string): Promise<ConflictResolution[]> {
  const resolutions: ConflictResolution[] = []

  // Time shift resolution
  const duration1 = timeToMinutes(assignment1.endTime) - timeToMinutes(assignment1.startTime)
  const duration2 = timeToMinutes(assignment2.endTime) - timeToMinutes(assignment2.startTime)

  // Suggest shifting the shorter assignment
  if (duration1 <= duration2) {
    const newStartTime = assignment2.endTime
    const newEndTime = minutesToTime(timeToMinutes(newStartTime) + duration1)
    
    resolutions.push({
      type: 'TIME_SHIFT',
      description: `Mover "${assignment1.title}" a ${newStartTime}-${newEndTime}`,
      impact: 'Eliminará el conflicto de horario manteniendo ambas asignaciones',
      timeAdjustments: {
        originalTime: `${assignment1.startTime}-${assignment1.endTime}`,
        suggestedTime: `${newStartTime}-${newEndTime}`
      }
    })
  } else {
    const newStartTime = assignment1.endTime
    const newEndTime = minutesToTime(timeToMinutes(newStartTime) + duration2)
    
    resolutions.push({
      type: 'TIME_SHIFT',
      description: `Mover "${assignment2.title}" a ${newStartTime}-${newEndTime}`,
      impact: 'Eliminará el conflicto de horario manteniendo ambas asignaciones',
      timeAdjustments: {
        originalTime: `${assignment2.startTime}-${assignment2.endTime}`,
        suggestedTime: `${newStartTime}-${newEndTime}`
      }
    })
  }

  // Find replacement volunteers
  const alternatives1 = await findAlternativeVolunteers([assignment1], churchId)
  const alternatives2 = await findAlternativeVolunteers([assignment2], churchId)

  if (alternatives1.length > 0) {
    resolutions.push({
      type: 'REASSIGN',
      description: `Reasignar "${assignment1.title}" a otro voluntario`,
      impact: 'Resolverá el conflicto y distribuirá la carga de trabajo',
      alternativeMembers: alternatives1
    })
  }

  if (alternatives2.length > 0) {
    resolutions.push({
      type: 'REASSIGN',
      description: `Reasignar "${assignment2.title}" a otro voluntario`,
      impact: 'Resolverá el conflicto y distribuirá la carga de trabajo',
      alternativeMembers: alternatives2
    })
  }

  return resolutions
}

// Find alternative volunteers for assignments
async function findAlternativeVolunteers(assignments: any[], churchId: string) {
  const alternatives: { memberId: string, name: string, score: number }[] = []

  // Get available members who aren't overloaded
  const availableMembers = await prisma.member.findMany({
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
              date: { gte: new Date() },
              status: { in: ['ASIGNADO', 'CONFIRMADO'] }
            }
          }
        }
      }
    }
  })

  for (const member of availableMembers) {
    const currentLoad = member.volunteers.reduce((total, v) => total + v.assignments.length, 0)
    
    // Skip overloaded members
    if (currentLoad > 3) continue

    // Check for conflicts with existing assignments for each target assignment
    let hasConflicts = false
    for (const assignment of assignments) {
      const hasConflict = await checkSchedulingConflicts(
        member.id,
        assignment.date,
        assignment.startTime,
        assignment.endTime,
        churchId
      )
      if (hasConflict) {
        hasConflicts = true
        break
      }
    }

    if (!hasConflicts) {
      // Calculate suitability score
      const availabilityScore = 100 - (currentLoad * 20) // Less load = higher score
      const experienceScore = (member.experienceLevel || 1) * 10
      const score = (availabilityScore + experienceScore) / 2

      alternatives.push({
        memberId: member.id,
        name: `${member.firstName} ${member.lastName}`,
        score: Math.round(score)
      })
    }
  }

  return alternatives.sort((a, b) => b.score - a.score).slice(0, 3)
}

// Utility functions
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function getWeekKey(date: Date): string {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  return format(startOfWeek, 'yyyy-MM-dd')
}

async function checkSchedulingConflicts(memberId: string, date: Date, startTime: string, endTime: string, churchId: string): Promise<boolean> {
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

// POST: Detect and resolve scheduling conflicts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { memberId, autoResolve = false } = await request.json()

    let allConflicts: SchedulingConflict[] = []

    if (memberId) {
      // Detect conflicts for specific member
      const conflicts = await detectMemberConflicts(memberId, session.user.churchId)
      allConflicts = conflicts
    } else {
      // Detect conflicts for all members
      const activeMembers = await prisma.member.findMany({
        where: {
          churchId: session.user.churchId,
          isActive: true,
          volunteers: {
            some: {
              isActive: true
            }
          }
        },
        select: { id: true }
      })

      for (const member of activeMembers) {
        const memberConflicts = await detectMemberConflicts(member.id, session.user.churchId)
        allConflicts.push(...memberConflicts)
      }
    }

    // Auto-resolve if requested
    const resolvedConflicts = []
    if (autoResolve) {
      for (const conflict of allConflicts.filter(c => c.severity === 'CRITICAL')) {
        const resolution = conflict.suggestedResolutions[0] // Take first resolution
        if (resolution) {
          // Implement the resolution (simplified implementation)
          if (resolution.type === 'TIME_SHIFT' && resolution.timeAdjustments) {
            // Update assignment time
            const assignmentId = conflict.conflictingAssignments[0]
            const [newStart, newEnd] = resolution.timeAdjustments.suggestedTime.split('-')
            
            await prisma.volunteerAssignment.update({
              where: { id: assignmentId },
              data: {
                startTime: newStart,
                endTime: newEnd,
                notes: `Auto-resuelto: ${resolution.description}`
              }
            })

            resolvedConflicts.push({
              conflictId: conflict.id,
              resolution: resolution.description,
              status: 'RESOLVED'
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      conflicts: allConflicts,
      summary: {
        totalConflicts: allConflicts.length,
        criticalConflicts: allConflicts.filter(c => c.severity === 'CRITICAL').length,
        highConflicts: allConflicts.filter(c => c.severity === 'HIGH').length,
        conflictsByType: {
          timeOverlap: allConflicts.filter(c => c.type === 'TIME_OVERLAP').length,
          overload: allConflicts.filter(c => c.type === 'OVERLOAD').length,
          skillMismatch: allConflicts.filter(c => c.type === 'SKILL_MISMATCH').length,
          availabilityConflict: allConflicts.filter(c => c.type === 'AVAILABILITY_CONFLICT').length
        },
        autoResolved: resolvedConflicts.length
      },
      resolvedConflicts
    })
  } catch (error) {
    console.error('❌ Error en sistema de resolución de conflictos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

// GET: Get current conflicts summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    let conflicts: SchedulingConflict[] = []

    if (memberId) {
      conflicts = await detectMemberConflicts(memberId, session.user.churchId)
    } else {
      // Quick summary for all active volunteers
      const activeVolunteers = await prisma.member.count({
        where: {
          churchId: session.user.churchId,
          isActive: true,
          volunteers: {
            some: {
              isActive: true,
              assignments: {
                some: {
                  date: { gte: new Date() },
                  status: { in: ['ASIGNADO', 'CONFIRMADO'] }
                }
              }
            }
          }
        }
      })

      const totalAssignments = await prisma.volunteerAssignment.count({
        where: {
          volunteer: {
            churchId: session.user.churchId
          },
          date: { gte: new Date() },
          status: { in: ['ASIGNADO', 'CONFIRMADO'] }
        }
      })

      return NextResponse.json({
        quickSummary: {
          activeVolunteers,
          totalUpcomingAssignments: totalAssignments,
          averageAssignmentsPerVolunteer: Math.round(totalAssignments / Math.max(1, activeVolunteers) * 10) / 10
        }
      })
    }

    return NextResponse.json({
      conflicts,
      summary: {
        totalConflicts: conflicts.length,
        criticalConflicts: conflicts.filter(c => c.severity === 'CRITICAL').length,
        resolutionsAvailable: conflicts.reduce((sum, c) => sum + c.suggestedResolutions.length, 0)
      }
    })
  } catch (error) {
    console.error('Error fetching conflicts:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
