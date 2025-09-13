
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  emailQueue, 
  renderEmailTemplate,
  shouldSendDigest,
  DigestEmailData 
} from '@/lib/email'
import { DigestEmail } from '@/components/email-templates/digest-email'
import { z } from 'zod'

const sendDigestEmailSchema = z.object({
  period: z.enum(['DAILY', 'WEEKLY']),
  churchId: z.string().optional(), // If not provided, send for all churches
  userId: z.string().optional(), // If not provided, send to all eligible users
  dateOverride: z.string().optional(), // For testing or manual sending
})

// POST - Send digest emails
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

    if (!sessionUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    // Check if user has permission to send digest emails
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Sin permisos para enviar emails digest' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = sendDigestEmailSchema.parse(body)

    // Calculate date range for digest
    const endDate = validatedData.dateOverride ? new Date(validatedData.dateOverride) : new Date()
    const startDate = new Date(endDate)
    
    if (validatedData.period === 'DAILY') {
      startDate.setDate(startDate.getDate() - 1)
    } else {
      startDate.setDate(startDate.getDate() - 7)
    }

    // Determine target churches
    const churches = validatedData.churchId 
      ? [{ id: validatedData.churchId }]
      : sessionUser.role === 'SUPER_ADMIN' 
        ? await prisma.church.findMany({ select: { id: true, name: true } })
        : [{ id: sessionUser.churchId!, name: '' }]

    let totalSent = 0
    const results = []

    for (const church of churches) {
      // Get church details
      const churchDetails = await prisma.church.findUnique({
        where: { id: church.id },
        select: { name: true }
      })

      if (!churchDetails) continue

      // Get users eligible for digest emails
      let userQuery: any = {
        churchId: church.id,
        isActive: true,
        notificationPreferences: {
          digestEnabled: true,
          digestFrequency: validatedData.period,
          emailEnabled: true
        }
      }

      if (validatedData.userId) {
        userQuery.id = validatedData.userId
      }

      const users = await prisma.user.findMany({
        where: userQuery,
        include: {
          notificationPreferences: true
        }
      })

      // Filter users that should receive digest
      const eligibleUsers = users.filter(user => {
        const preferences = user.notificationPreferences
        if (!preferences) return false
        
        return shouldSendDigest(preferences, validatedData.period)
      })

      if (eligibleUsers.length === 0) {
        results.push({
          churchId: church.id,
          churchName: churchDetails.name,
          sent: 0,
          reason: 'No eligible users'
        })
        continue
      }

      // Get notifications for the period for this church
      const notifications = await prisma.notification.findMany({
        where: {
          churchId: church.id,
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          // Only include notifications that would be sent via email
          OR: [
            { isGlobal: true },
            { targetRole: { in: eligibleUsers.map(u => u.role) } },
            { targetUser: { in: eligibleUsers.map(u => u.id) } }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      if (notifications.length === 0) {
        results.push({
          churchId: church.id,
          churchName: churchDetails.name,
          sent: 0,
          reason: 'No notifications in period'
        })
        continue
      }

      // Prepare digest emails for each eligible user
      const emails = eligibleUsers.map(user => {
        // Filter notifications relevant to this user
        const userNotifications = notifications.filter(notification => {
          if (notification.isGlobal) return true
          if (notification.targetUser === user.id) return true
          if (notification.targetRole === user.role) return true
          return false
        })

        if (userNotifications.length === 0) return null

        const emailData: DigestEmailData = {
          user: {
            email: user.email,
            name: user.name || undefined
          },
          church: {
            name: churchDetails.name,
            id: church.id
          },
          notifications: userNotifications.map(n => ({
            title: n.title,
            message: n.message,
            type: n.type as any,
            category: n.category || undefined,
            priority: n.priority as any,
            actionUrl: n.actionUrl || undefined,
            actionLabel: n.actionLabel || undefined,
            createdAt: n.createdAt.toISOString()
          })),
          period: validatedData.period,
          date: endDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }

        const emailComponent = DigestEmail({
          userName: emailData.user.name,
          churchName: emailData.church.name,
          notifications: emailData.notifications,
          period: emailData.period,
          date: emailData.date
        })
        const emailHtml = renderEmailTemplate(emailComponent)
        const periodLabel = validatedData.period === 'DAILY' ? 'Diario' : 'Semanal'

        return {
          to: user.email,
          subject: `📊 Resumen ${periodLabel} - ${churchDetails.name} (${userNotifications.length} notificaciones)`,
          html: emailHtml,
          churchName: churchDetails.name,
          userName: user.name || 'Estimado miembro'
        }
      }).filter(Boolean) as any[]

      if (emails.length > 0) {
        await emailQueue.addBulk(emails)
        totalSent += emails.length

        console.log(`📊 Queued ${emails.length} digest emails for ${churchDetails.name} (${validatedData.period})`)
      }

      results.push({
        churchId: church.id,
        churchName: churchDetails.name,
        sent: emails.length,
        notificationCount: notifications.length,
        eligibleUsers: eligibleUsers.length
      })
    }

    return NextResponse.json({
      success: true,
      period: validatedData.period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      totalSent,
      churches: results
    })

  } catch (error) {
    console.error('Error sending digest emails:', error)
    
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

// GET - Preview digest content
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true, name: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') || 'DAILY') as 'DAILY' | 'WEEKLY'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date(endDate)
    
    if (period === 'DAILY') {
      startDate.setDate(startDate.getDate() - 1)
    } else {
      startDate.setDate(startDate.getDate() - 7)
    }

    // Get church details
    const church = await prisma.church.findUnique({
      where: { id: user.churchId },
      select: { name: true }
    })

    if (!church) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    // Get notifications for the period
    const notifications = await prisma.notification.findMany({
      where: {
        churchId: user.churchId,
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        OR: [
          { isGlobal: true },
          { targetRole: user.role },
          { targetUser: user.id }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      church: church.name,
      user: {
        name: user.name,
        email: session.user.email
      },
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        category: n.category,
        priority: n.priority,
        actionUrl: n.actionUrl,
        actionLabel: n.actionLabel,
        createdAt: n.createdAt.toISOString()
      })),
      preview: notifications.length > 0
    })

  } catch (error) {
    console.error('Error getting digest preview:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
