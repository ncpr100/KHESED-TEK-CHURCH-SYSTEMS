
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { communicationService } from '@/lib/integrations/communication'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bulkSendSchema = z.object({
  service: z.enum(['email', 'sms', 'whatsapp']),
  recipients: z.array(z.string()).min(1).max(1000), // Limit to 1000 recipients per batch
  message: z.string().min(1),
  subject: z.string().optional(),
  memberFilter: z.enum(['all', 'active', 'inactive', 'new', 'leaders']).optional()
})

// POST - Send bulk messages
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error('Integration bulk-send: No session or email found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const sessionUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!sessionUser) {
      console.error('Integration bulk-send: User not found in database')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    if (!sessionUser.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Only admins and pastors can send bulk messages
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Sin permisos para envío masivo' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = bulkSendSchema.parse(body)

    let recipients = validatedData.recipients

    // If memberFilter is specified, get recipients from member database
    if (validatedData.memberFilter && validatedData.memberFilter !== 'all') {
      const memberQuery: any = {
        where: {
          churchId: sessionUser.churchId,
          isActive: true
        }
      }

      switch (validatedData.memberFilter) {
        case 'active':
          memberQuery.where.isActive = true
          break
        case 'inactive':
          memberQuery.where.isActive = false
          break
        case 'new':
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          memberQuery.where.createdAt = { gte: thirtyDaysAgo }
          break
        case 'leaders':
          memberQuery.where.ministryId = { not: null }
          break
      }

      const members = await prisma.member.findMany({
        ...memberQuery,
        select: {
          email: true,
          phone: true,
          firstName: true,
          lastName: true
        }
      })

      if (validatedData.service === 'email') {
        recipients = members.filter(m => m.email).map(m => m.email!)
      } else {
        recipients = members.filter(m => m.phone).map(m => m.phone!)
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No se encontraron destinatarios válidos' }, { status: 400 })
    }

    let result: any

    switch (validatedData.service) {
      case 'email':
        const emailMessages = recipients.map(recipient => ({
          to: recipient,
          subject: validatedData.subject || 'Mensaje desde Kḥesed-tek',
          html: `<p>${validatedData.message}</p>`,
          text: validatedData.message
        }))
        result = await communicationService.sendBulkEmail(emailMessages)
        break

      case 'sms':
        const smsMessages = recipients.map(recipient => ({
          to: recipient,
          body: validatedData.message
        }))
        result = await communicationService.sendBulkSMS(smsMessages)
        break

      case 'whatsapp':
        result = await communicationService.sendBulkWhatsApp(recipients, validatedData.message)
        break

      default:
        return NextResponse.json({ error: 'Servicio no soportado' }, { status: 400 })
    }

    // Log the bulk send activity
    await prisma.notification.create({
      data: {
        title: `Envío masivo ${validatedData.service}`,
        message: `Se enviaron ${result.successful} mensajes de ${result.total} intentos`,
        type: 'SYSTEM',
        priority: 'NORMAL',
        churchId: sessionUser.churchId,
        createdBy: sessionUser.id
      }
    })

    return NextResponse.json({
      success: result.success,
      service: validatedData.service,
      total: result.total,
      successful: result.successful,
      failed: result.failed,
      results: result.results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error sending bulk messages:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
