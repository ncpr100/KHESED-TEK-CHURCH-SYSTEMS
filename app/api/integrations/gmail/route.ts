import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { gmailService } from '@/lib/integrations/gmail'

// GET - Get Gmail integration status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Only SUPER_ADMIN can view Gmail configuration details
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo SUPER_ADMIN puede ver configuración de Gmail' },
        { status: 403 }
      )
    }

    const status = gmailService.getStatus()
    
    return NextResponse.json({
      status: status,
      environment: {
        gmail_configured: status.configured,
        gmail_enabled: status.enabled,
        required_env_vars: [
          'GMAIL_CLIENT_ID',
          'GMAIL_CLIENT_SECRET', 
          'GMAIL_REFRESH_TOKEN',
          'GMAIL_FROM_EMAIL',
          'ENABLE_GMAIL'
        ]
      }
    })
  } catch (error) {
    console.error('Error getting Gmail status:', error)
    return NextResponse.json(
      { error: 'Error al obtener estado de Gmail' },
      { status: 500 }
    )
  }
}

// POST - Test Gmail integration or setup OAuth
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Only SUPER_ADMIN can configure Gmail
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo SUPER_ADMIN puede configurar Gmail' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, testEmail, subject, message, authCode } = body

    if (action === 'test') {
      // Test Gmail sending
      if (!testEmail) {
        return NextResponse.json(
          { error: 'Email de prueba es requerido' },
          { status: 400 }
        )
      }

      const testMessage = {
        to: testEmail,
        subject: subject || 'Prueba de Gmail API - Khesed-tek Systems',
        html: `
          <h2>Prueba de Integración Gmail API</h2>
          <p>Este es un mensaje de prueba del sistema Khesed-tek.</p>
          <p><strong>Mensaje personalizado:</strong></p>
          <p>${(message || 'Sistema funcionando correctamente').replace(/\n/g, '<br>')}</p>
          <hr>
          <p><em>Enviado desde: ${gmailService.getStatus().config.fromEmail}</em></p>
          <p><em>Fecha: ${new Date().toLocaleString('es-ES')}</em></p>
        `,
        text: `
Prueba de Integración Gmail API - Khesed-tek Systems

Este es un mensaje de prueba del sistema Khesed-tek.

Mensaje personalizado:
${message || 'Sistema funcionando correctamente'}

---
Enviado desde: ${gmailService.getStatus().config.fromEmail}
Fecha: ${new Date().toLocaleString('es-ES')}
        `
      }

      const result = await gmailService.sendEmail(testMessage)

      return NextResponse.json({
        success: result.success,
        message: result.success ? 
          'Email de prueba enviado exitosamente' : 
          'Error al enviar email de prueba',
        details: {
          messageId: result.messageId,
          error: result.error,
          provider: 'gmail'
        }
      })
    } else if (action === 'getAuthUrl') {
      // Get OAuth authorization URL for initial setup
      try {
        const authUrl = gmailService.getAuthUrl()
        return NextResponse.json({
          success: true,
          authUrl,
          message: 'URL de autorización generada. Visite el enlace para autorizar la aplicación.'
        })
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Error al generar URL de autorización',
          details: error instanceof Error ? error.message : 'Error desconocido'
        })
      }
    } else if (action === 'exchangeCode') {
      // Exchange authorization code for tokens
      if (!authCode) {
        return NextResponse.json(
          { error: 'Código de autorización es requerido' },
          { status: 400 }
        )
      }

      const result = await gmailService.getTokensFromAuthCode(authCode)
      
      if (result.success && result.tokens) {
        return NextResponse.json({
          success: true,
          message: 'Tokens obtenidos exitosamente. Configure las siguientes variables de entorno:',
          tokens: {
            access_token: result.tokens.access_token,
            refresh_token: result.tokens.refresh_token,
            expires_in: result.tokens.expiry_date
          },
          envVars: {
            GMAIL_ACCESS_TOKEN: result.tokens.access_token,
            GMAIL_REFRESH_TOKEN: result.tokens.refresh_token
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: 'Error al intercambiar código por tokens',
          details: result.error
        })
      }
    } else if (action === 'refresh') {
      // Refresh access token
      const result = await gmailService.refreshAccessToken()
      
      return NextResponse.json({
        success: result.success,
        message: result.success ? 
          'Token de acceso renovado exitosamente' : 
          'Error al renovar token de acceso',
        error: result.error
      })
    } else {
      return NextResponse.json(
        { error: 'Acción no válida' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in Gmail API:', error)
    return NextResponse.json(
      { error: 'Error en la integración de Gmail' },
      { status: 500 }
    )
  }
}