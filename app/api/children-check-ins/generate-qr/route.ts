

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Generate QR code for children check-in
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const { eventId, eventTitle } = await request.json()

    // Generate unique QR code
    const qrCode = `CHILD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const qrUrl = `${baseUrl}/public/children-checkin/${qrCode}`

    // Create an empty child check-in record for QR tracking
    const emptyCheckIn = await db.childCheckIn.create({
      data: {
        childName: 'Pendiente de QR', // Placeholder until QR is scanned
        parentName: 'Pendiente de QR',
        parentPhone: 'Pendiente de QR',
        qrCode,
        securityPin: '000000', // Will be updated when QR is completed
        checkedIn: false, // Not checked in until QR form is completed
        checkedOut: false,
        eventId: eventId || null,
        churchId: session.user.churchId,
        requiresBothAuth: true
      }
    })

    // Generate QR code image URL
    const qrDisplayUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&format=png`

    return NextResponse.json({
      success: true,
      qrCode,
      qrUrl,
      qrDisplayUrl,
      checkInId: emptyCheckIn.id,
      eventTitle: eventTitle || 'Evento General',
      instructions: {
        step1: 'Padres escanean este código QR',
        step2: 'Completan información del niño',
        step3: 'Toman fotos de seguridad',
        step4: 'Check-in se registra automáticamente'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error generating children QR code:', error)
    return NextResponse.json(
      { message: 'Error generando código QR para niños' },
      { status: 500 }
    )
  }
}
