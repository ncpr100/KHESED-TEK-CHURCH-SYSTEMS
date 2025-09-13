
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from "@/lib/db"
import twilio from 'twilio'

// Función para obtener la configuración de Twilio
async function getTwilioConfig(churchId: string) {
  const config = await db.integrationConfig.findFirst({
    where: {
      churchId,
      service: 'TWILIO',
      isActive: true
    }
  })

  if (!config) return null

  const twilioConfig = JSON.parse(config.config)
  return twilioConfig
}

// Función para reemplazar variables en templates
function replaceVariables(content: string, variables: Record<string, string>) {
  let result = content
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value || '')
  })
  return result
}

// Función para obtener destinatarios basado en el grupo objetivo
async function getRecipients(targetGroup: string, churchId: string) {
  let recipients: Array<{ name: string; phone?: string; email?: string }> = []

  switch (targetGroup) {
    case 'TODOS':
      const allMembers = await db.member.findMany({
        where: { churchId, isActive: true },
        select: { firstName: true, lastName: true, phone: true, email: true }
      })
      recipients = allMembers.map(m => ({
        name: `${m.firstName} ${m.lastName}`,
        phone: m.phone || undefined,
        email: m.email || undefined
      }))
      break
    
    case 'VOLUNTARIOS':
      const volunteers = await db.volunteer.findMany({
        where: { churchId, isActive: true },
        select: { firstName: true, lastName: true, phone: true, email: true }
      })
      recipients = volunteers.map(v => ({
        name: `${v.firstName} ${v.lastName}`,
        phone: v.phone || undefined,
        email: v.email || undefined
      }))
      break
    
    case 'LIDERES':
      const leaders = await db.user.findMany({
        where: { 
          churchId, 
          isActive: true,
          role: { in: ['PASTOR', 'LIDER', 'ADMIN_IGLESIA'] }
        },
        include: { member: true }
      })
      recipients = leaders.map(l => ({
        name: l.member ? `${l.member.firstName} ${l.member.lastName}` : l.name || 'Usuario',
        phone: l.member?.phone || undefined,
        email: l.email
      }))
      break
    
    default:
      break
  }

  return recipients
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      title, 
      content, 
      type, 
      targetGroup, 
      templateId, 
      scheduledAt,
      templateVariables 
    } = body

    if (!title || !type || !targetGroup) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    // Obtener contenido final (desde template o directo)
    let finalContent = content
    if (templateId) {
      const template = await db.communicationTemplate.findFirst({
        where: {
          id: templateId,
          churchId: session.user.churchId,
          isActive: true
        }
      })

      if (!template) {
        return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
      }

      finalContent = template.content
      if (templateVariables) {
        finalContent = replaceVariables(finalContent, templateVariables)
      }
    }

    // Obtener destinatarios
    const recipients = await getRecipients(targetGroup, session.user.churchId)

    // Crear el registro de comunicación
    const communication = await db.communication.create({
      data: {
        title,
        content: finalContent,
        type,
        targetGroup,
        recipients: recipients.length,
        status: scheduledAt ? 'PROGRAMADO' : 'ENVIADO',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        sentAt: scheduledAt ? undefined : new Date(),
        sentBy: session.user.id!,
        templateId: templateId || undefined,
        churchId: session.user.churchId
      }
    })

    // Si no está programado, enviar inmediatamente
    if (!scheduledAt) {
      try {
        if (type === 'SMS') {
          const twilioConfig = await getTwilioConfig(session.user.churchId)
          
          if (!twilioConfig) {
            await db.communication.update({
              where: { id: communication.id },
              data: { status: 'FALLIDO' }
            })
            return NextResponse.json({ 
              error: 'Configuración de Twilio no encontrada' 
            }, { status: 400 })
          }

          const client = twilio(twilioConfig.accountSid, twilioConfig.authToken)
          
          // Enviar SMS a todos los destinatarios con teléfono
          const smsPromises = recipients
            .filter(r => r.phone)
            .map(recipient => 
              client.messages.create({
                body: finalContent,
                from: twilioConfig.phoneNumber,
                to: recipient.phone!
              }).catch(error => {
                console.error(`Error sending SMS to ${recipient.phone}:`, error)
                return null
              })
            )

          await Promise.all(smsPromises)
        }

        // Actualizar estado a enviado
        await db.communication.update({
          where: { id: communication.id },
          data: { 
            status: 'ENVIADO',
            sentAt: new Date()
          }
        })
      } catch (error) {
        console.error('Error sending communications:', error)
        await db.communication.update({
          where: { id: communication.id },
          data: { status: 'FALLIDO' }
        })
      }
    }

    return NextResponse.json(communication)
  } catch (error) {
    console.error('Error in mass communication:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
