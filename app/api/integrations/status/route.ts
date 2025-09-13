
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { communicationService } from '@/lib/integrations/communication'
import { mailgunService } from '@/lib/integrations/mailgun'
import { twilioService } from '@/lib/integrations/twilio'
import { whatsappBusinessService } from '@/lib/integrations/whatsapp'

// GET - Get integration status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error('Integration status: No session or email found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get full user data to check role
    const sessionUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, churchId: true }
    })

    if (!sessionUser) {
      console.error('Integration status: User not found in database')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    // Only admins can view integration status
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Sin permisos para ver integraciones' }, { status: 403 })
    }

    const status = {
      communication: communicationService.getStatus(),
      services: {
        mailgun: mailgunService.getStatus(),
        twilio: twilioService.getStatus(),
        whatsapp: whatsappBusinessService.getStatus()
      },
      environment: {
        mailgun_configured: !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN),
        twilio_configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
        whatsapp_configured: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
        providers_enabled: {
          mailgun: process.env.ENABLE_MAILGUN === 'true',
          twilio: process.env.ENABLE_TWILIO_SMS === 'true',
          whatsapp: process.env.ENABLE_WHATSAPP === 'true'
        }
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching integration status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
