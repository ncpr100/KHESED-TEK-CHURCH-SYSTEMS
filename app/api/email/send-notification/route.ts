
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  emailQueue, 
  renderEmailTemplate, 
  getEmailSubjectPrefix,
  shouldSendEmailNotification,
  NotificationEmailData 
} from '@/lib/email'
import { NotificationEmail } from '@/components/email-templates/notification-email'
import { z } from 'zod'

const sendNotificationEmailSchema = z.object({
  notificationId: z.string(),
  userId: z.string().optional(), // If not provided, send to all eligible users
  forceOverridePreferences: z.boolean().optional().default(false), // For urgent system notifications
})

// POST - Send notification email
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const sessionUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!sessionUser || !sessionUser.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Check if user has permission to send notification emails
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Sin permisos para enviar emails de notificación' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = sendNotificationEmailSchema.parse(body)

    // Get notification details
    const notification = await prisma.notification.findFirst({
      where: {
        id: validatedData.notificationId,
        churchId: sessionUser.churchId
      },
      include: {
        church: {
          select: { name: true }
        },
        creator: {
          select: { name: true, email: true }
        }
      }
    })

    if (!notification) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 })
    }

    // Determine target users
    let targetUsers: any[] = []

    if (validatedData.userId) {
      // Send to specific user
      const user = await prisma.user.findFirst({
        where: {
          id: validatedData.userId,
          churchId: sessionUser.churchId
        },
        include: {
          notificationPreferences: true
        }
      })

      if (user) {
        targetUsers = [user]
      }
    } else {
      // Determine target users based on notification settings
      let userQuery: any = {
        churchId: sessionUser.churchId,
        isActive: true
      }

      if (notification.targetRole) {
        userQuery.role = notification.targetRole
      } else if (notification.targetUser) {
        userQuery.id = notification.targetUser
      }
      // If notification.isGlobal is true, send to all users (no additional filter)

      targetUsers = await prisma.user.findMany({
        where: userQuery,
        include: {
          notificationPreferences: true
        }
      })
    }

    // Filter users based on email preferences (unless forced override)
    const eligibleUsers = targetUsers.filter(user => {
      if (validatedData.forceOverridePreferences) {
        return true // Send to everyone if force override
      }

      // Default preferences if user has none
      const preferences = user.notificationPreferences || {
        emailEnabled: true,
        emailEvents: true,
        emailDonations: true,
        emailCommunications: true,
        emailSystemUpdates: true,
        quietHoursEnabled: false,
        weekendNotifications: true,
        digestEnabled: false
      }

      // Check if user should receive this email
      const categoryMap: Record<string, string> = {
        'EVENT': 'events',
        'DONATION': 'donations', 
        'COMMUNICATION': 'communications',
        'SYSTEM': 'systemUpdates'
      }

      const notificationCategory = notification.category 
        ? categoryMap[notification.category] || 'communications'
        : 'communications'

      return shouldSendEmailNotification(preferences, notificationCategory)
    })

    if (eligibleUsers.length === 0) {
      return NextResponse.json({ 
        message: 'No hay usuarios elegibles para recibir este email',
        sent: 0 
      })
    }

    // Prepare emails for queue
    const emails = eligibleUsers.map(user => {
      const emailData: NotificationEmailData = {
        user: {
          email: user.email,
          name: user.name || undefined
        },
        church: {
          name: notification.church.name,
          id: sessionUser.churchId!
        },
        notification: {
          title: notification.title,
          message: notification.message,
          type: notification.type as any,
          category: notification.category || undefined,
          priority: notification.priority as any,
          actionUrl: notification.actionUrl || undefined,
          actionLabel: notification.actionLabel || undefined,
          createdAt: notification.createdAt.toISOString()
        }
      }

      const emailComponent = NotificationEmail({
        userName: emailData.user.name,
        churchName: emailData.church.name,
        notification: emailData.notification
      })
      const emailHtml = renderEmailTemplate(emailComponent)
      const subjectPrefix = getEmailSubjectPrefix(notification.type, notification.priority)

      return {
        to: user.email,
        subject: `${subjectPrefix}${notification.title} - ${notification.church.name}`,
        html: emailHtml,
        churchName: notification.church.name,
        userName: user.name || 'Estimado miembro'
      }
    })

    // Add emails to queue
    await emailQueue.addBulk(emails)

    // Log the email sending activity
    console.log(`📧 Queued ${emails.length} notification emails for notification: ${notification.title}`)

    return NextResponse.json({
      success: true,
      notificationId: notification.id,
      sent: emails.length,
      recipients: eligibleUsers.map(u => ({ 
        email: u.email, 
        name: u.name 
      }))
    })

  } catch (error) {
    console.error('Error sending notification email:', error)
    
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

// GET - Get email sending status and queue information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (!user || !['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    return NextResponse.json({
      queueLength: emailQueue.getQueueLength(),
      status: 'active',
      emailConfig: {
        development: process.env.NODE_ENV === 'development',
        fromEmail: process.env.FROM_EMAIL || 'noreply@khesed-tek.com'
      }
    })
  } catch (error) {
    console.error('Error getting email status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
