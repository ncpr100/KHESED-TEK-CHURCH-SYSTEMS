

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET child check-in by QR code (public endpoint for parent QR scanning)
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const childCheckIn = await db.childCheckIn.findUnique({
      where: {
        qrCode: params.code
      },
      include: {
        event: true,
        church: true
      }
    })

    if (!childCheckIn) {
      return NextResponse.json(
        { message: 'Check-in de niño no encontrado' },
        { status: 404 }
      )
    }

    // Return public-safe data for QR form completion
    return NextResponse.json({
      id: childCheckIn.id,
      qrCode: childCheckIn.qrCode,
      childName: childCheckIn.childName,
      childAge: childCheckIn.childAge,
      parentName: childCheckIn.parentName,
      parentPhone: childCheckIn.parentPhone,
      parentEmail: childCheckIn.parentEmail,
      emergencyContact: childCheckIn.emergencyContact,
      emergencyPhone: childCheckIn.emergencyPhone,
      allergies: childCheckIn.allergies,
      specialNeeds: childCheckIn.specialNeeds,
      checkedIn: childCheckIn.checkedIn,
      checkedOut: childCheckIn.checkedOut,
      checkedInAt: childCheckIn.checkedInAt,
      event: childCheckIn.event ? {
        title: childCheckIn.event.title,
        startDate: childCheckIn.event.startDate
      } : null,
      church: {
        name: childCheckIn.church.name
      },
      // Security info (non-sensitive)
      securityPin: childCheckIn.securityPin,
      requiresBothAuth: childCheckIn.requiresBothAuth
    })

  } catch (error) {
    console.error('Error fetching child check-in by QR:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Complete QR-based check-in with photos
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const {
      childName,
      childAge,
      parentName,
      parentPhone,
      parentEmail,
      emergencyContact,
      emergencyPhone,
      allergies,
      specialNeeds,
      childPhoto,
      parentPhoto,
      eventId,
      churchId
    } = await request.json()

    if (!childName || !parentName || !parentPhone) {
      return NextResponse.json(
        { message: 'Nombre del niño, nombre del padre y teléfono son requeridos' },
        { status: 400 }
      )
    }

    // Generate security PIN
    const securityPin = Math.floor(100000 + Math.random() * 900000).toString()

    // Create complete child check-in via QR
    const childCheckIn = await db.childCheckIn.create({
      data: {
        childName,
        childAge: childAge ? parseInt(childAge) : null,
        parentName,
        parentPhone,
        parentEmail,
        emergencyContact,
        emergencyPhone,
        allergies,
        specialNeeds,
        qrCode: params.code,
        securityPin,
        childPhotoUrl: childPhoto || null,
        parentPhotoUrl: parentPhoto || null,
        photoTakenAt: childPhoto || parentPhoto ? new Date() : null,
        requiresBothAuth: !!(childPhoto && parentPhoto),
        eventId,
        churchId,
        checkedIn: true,
        checkedOut: false,
        backupAuthCodes: [
          Math.floor(100000 + Math.random() * 900000).toString(),
          Math.floor(100000 + Math.random() * 900000).toString()
        ]
      },
      include: {
        event: true,
        church: true
      }
    })

    return NextResponse.json({
      success: true,
      checkIn: childCheckIn,
      securityPin: childCheckIn.securityPin,
      message: '✅ Check-in completado exitosamente via QR'
    }, { status: 201 })

  } catch (error) {
    console.error('Error completing QR child check-in:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
