
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { communicationService } from '@/lib/integrations/communication'
import { z } from 'zod'

const testIntegrationSchema = z.object({
  service: z.enum(['email', 'sms', 'whatsapp']),
  recipient: z.string().min(1),
  message: z.string().min(1).optional(),
  subject: z.string().optional()
})

// POST - Test integration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error('Integration test: No session or email found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get full user data to check role
    const sessionUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, churchId: true }
    })

    if (!sessionUser) {
      console.error('Integration test: User not found in database')
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
    }

    // Only admins can test integrations
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Sin permisos para probar integraciones' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = testIntegrationSchema.parse(body)

    const testMessage = validatedData.message || 'Mensaje de prueba desde Kḥesed-tek Church Management Systems'
    const testSubject = validatedData.subject || 'Prueba de Integración - Kḥesed-tek'

    let result: any

    switch (validatedData.service) {
      case 'email':
        result = await communicationService.sendEmail({
          to: validatedData.recipient,
          subject: testSubject,
          html: `<p>${testMessage}</p>`,
          text: testMessage
        })
        break

      case 'sms':
        result = await communicationService.sendSMS({
          to: validatedData.recipient,
          body: testMessage
        })
        break

      case 'whatsapp':
        result = await communicationService.sendWhatsApp(
          validatedData.recipient,
          testMessage
        )
        break

      default:
        return NextResponse.json({ error: 'Servicio no soportado' }, { status: 400 })
    }

    return NextResponse.json({
      success: result.success,
      service: validatedData.service,
      provider: result.provider,
      messageId: result.messageId,
      error: result.error,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error testing integration:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
