
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      churchName,
      firstName,
      lastName,
      email,
      subscriptionPlan
    } = body

    // Validaciones
    if (!churchName || !firstName || !lastName || !email || !subscriptionPlan) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que no exista ya un usuario registrado con este email
    const existingUser = await db.user.findUnique({
      where: { email: email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ya existe un usuario registrado con este email' },
        { status: 400 }
      )
    }

    // Por ahora, solo registramos la solicitud en logs para procesamiento manual
    // El SUPER_ADMIN puede crear las iglesias usando el wizard existente
    const requestId = `church-req-${Date.now()}`
    
    console.log('🎯 NUEVA SOLICITUD DE CUENTA RECIBIDA:', {
      requestId,
      churchName,
      contactName: `${firstName} ${lastName}`,
      email,
      plan: subscriptionPlan,
      timestamp: new Date().toISOString()
    })

    // TODO: Integrar con sistema de notificaciones para SUPER_ADMIN
    // TODO: Enviar email de confirmación al solicitante
    // TODO: Crear dashboard para gestionar estas solicitudes

    return NextResponse.json({
      message: 'Solicitud de cuenta creada exitosamente',
      requestId: requestId
    }, { status: 201 })

  } catch (error: any) {

    console.error('Error al crear solicitud de cuenta:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
