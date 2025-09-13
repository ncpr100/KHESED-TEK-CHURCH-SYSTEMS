
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bulkNotificationSchema = z.object({
  templateId: z.string().optional(),
  title: z.string().min(1, 'Título es requerido'),
  message: z.string().min(1, 'Mensaje es requerido'),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).default('INFO'),
  category: z.enum(['EVENT', 'DONATION', 'COMMUNICATION', 'SYSTEM', 'CUSTOM']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  expiresAt: z.string().optional(), // ISO date string
  
  // Targeting options
  targetType: z.enum(['ALL', 'ROLE', 'USERS', 'GLOBAL']),
  targetRole: z.string().optional(),
  targetUserIds: z.array(z.string()).optional(),
  
  // Template variables (if using template)
  variables: z.record(z.string()).optional(),
})

// Helper function to replace template variables
function replaceTemplateVariables(template: string, variables: Record<string, string> = {}): string {
  let result = template
  
  // Replace all {{variableName}} with actual values
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi')
    result = result.replace(regex, value)
  })
  
  // Remove any remaining unreplaced variables
  result = result.replace(/{{[^}]+}}/g, '[Variable no definida]')
  
  return result
}

// POST - Send bulk notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Check if user has permission to send bulk notifications
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para enviar notificaciones masivas' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = bulkNotificationSchema.parse(body)

    let finalTitle = validatedData.title
    let finalMessage = validatedData.message
    let finalType = validatedData.type
    let finalCategory = validatedData.category
    let finalPriority = validatedData.priority

    // If using a template, fetch and apply it
    if (validatedData.templateId) {
      const template = await prisma.notificationTemplate.findFirst({
        where: {
          id: validatedData.templateId,
          OR: [
            { churchId: user.churchId },
            { churchId: null, isSystem: true }
          ],
          isActive: true
        }
      })

      if (!template) {
        return NextResponse.json({ error: 'Plantilla no encontrada o inactiva' }, { status: 400 })
      }

      // Apply template with variable replacement
      finalTitle = replaceTemplateVariables(template.titleTemplate, validatedData.variables)
      finalMessage = replaceTemplateVariables(template.messageTemplate, validatedData.variables)
      finalType = template.type as 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
      finalCategory = template.category as 'EVENT' | 'DONATION' | 'COMMUNICATION' | 'SYSTEM' | 'CUSTOM'
      finalPriority = template.priority as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    }

    // Parse expiration date if provided
    let expiresAt: Date | undefined = undefined
    if (validatedData.expiresAt) {
      expiresAt = new Date(validatedData.expiresAt)
      if (isNaN(expiresAt.getTime())) {
        return NextResponse.json({ error: 'Fecha de expiración inválida' }, { status: 400 })
      }
    }

    // Determine notification configuration based on target type
    let notificationData: any = {
      title: finalTitle,
      message: finalMessage,
      type: finalType,
      category: finalCategory,
      priority: finalPriority,
      actionUrl: validatedData.actionUrl,
      actionLabel: validatedData.actionLabel,
      expiresAt: expiresAt,
      churchId: user.churchId,
      createdBy: user.id,
      isRead: false,
    }

    let createdNotifications: any[] = []

    switch (validatedData.targetType) {
      case 'GLOBAL':
        // Global notification for entire church
        notificationData.isGlobal = true
        const globalNotification = await prisma.notification.create({
          data: notificationData,
          include: { church: { select: { name: true } } }
        })
        createdNotifications.push(globalNotification)
        break

      case 'ROLE':
        if (!validatedData.targetRole) {
          return NextResponse.json({ error: 'Rol objetivo requerido' }, { status: 400 })
        }
        
        notificationData.targetRole = validatedData.targetRole
        const roleNotification = await prisma.notification.create({
          data: notificationData,
          include: { church: { select: { name: true } } }
        })
        createdNotifications.push(roleNotification)
        break

      case 'USERS':
        if (!validatedData.targetUserIds || validatedData.targetUserIds.length === 0) {
          return NextResponse.json({ error: 'IDs de usuarios objetivo requeridos' }, { status: 400 })
        }

        // Verify all target users belong to the same church
        const targetUsers = await prisma.user.findMany({
          where: {
            id: { in: validatedData.targetUserIds },
            churchId: user.churchId
          },
          select: { id: true }
        })

        if (targetUsers.length !== validatedData.targetUserIds.length) {
          return NextResponse.json({ 
            error: 'Algunos usuarios objetivo no pertenecen a esta iglesia' 
          }, { status: 400 })
        }

        // Create individual notifications for each user
        for (const targetUser of targetUsers) {
          const userNotification = await prisma.notification.create({
            data: {
              ...notificationData,
              targetUser: targetUser.id
            },
            include: { church: { select: { name: true } } }
          })
          createdNotifications.push(userNotification)
        }
        break

      case 'ALL':
        // Send to all users in the church
        const allChurchUsers = await prisma.user.findMany({
          where: {
            churchId: user.churchId,
            isActive: true
          },
          select: { id: true }
        })

        for (const churchUser of allChurchUsers) {
          const userNotification = await prisma.notification.create({
            data: {
              ...notificationData,
              targetUser: churchUser.id
            },
            include: { church: { select: { name: true } } }
          })
          createdNotifications.push(userNotification)
        }
        break
    }

    // Send real-time notifications for immediate delivery
    let realTimeSent = 0
    for (const notification of createdNotifications) {
      try {
        // Make internal API call to broadcast real-time notification
        const realtimeResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/realtime/broadcast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('Cookie') || ''
          },
          body: JSON.stringify({
            type: 'notification',
            target: notification.targetUser ? 'user' : notification.targetRole ? 'role' : 'church',
            targetId: notification.targetUser || notification.targetRole || user.churchId,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            category: notification.category,
            actionUrl: notification.actionUrl,
            actionLabel: notification.actionLabel,
            data: {
              notificationId: notification.id,
              createdAt: notification.createdAt.toISOString(),
              isGlobal: notification.isGlobal
            }
          })
        })
        
        if (realtimeResponse.ok) {
          realTimeSent++
          console.log(`📡 Real-time notification sent: ${notification.title}`)
        }
      } catch (realtimeError) {
        console.error('Error sending real-time notification:', realtimeError)
        // Don't fail the whole operation if real-time fails
      }
    }
    
    // Send email notifications automatically for all created notifications
    let emailsSent = 0
    for (const notification of createdNotifications) {
      try {
        // Make internal API call to send notification email
        const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/email/send-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('Cookie') || ''
          },
          body: JSON.stringify({
            notificationId: notification.id,
            forceOverridePreferences: finalPriority === 'URGENT' // Override preferences for urgent notifications
          })
        })
        
        if (emailResponse.ok) {
          const emailResult = await emailResponse.json()
          emailsSent += emailResult.sent || 0
        }
      } catch (emailError) {
        console.error('Error sending notification email:', emailError)
        // Don't fail the whole operation if email fails
      }
    }
    
    return NextResponse.json({
      success: true,
      notificationsCreated: createdNotifications.length,
      notifications: createdNotifications,
      realTimeSent,
      emailsSent
    }, { status: 201 })

  } catch (error) {
    console.error('Error sending bulk notifications:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
