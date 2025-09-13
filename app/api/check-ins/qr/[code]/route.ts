

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET check-in by QR code (public endpoint for QR scanning)
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const checkIn = await db.checkIn.findUnique({
      where: {
        qrCode: params.code
      },
      include: {
        event: true,
        church: true,
        followUps: true
      }
    })

    if (!checkIn) {
      return NextResponse.json(
        { message: 'Check-in no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(checkIn)

  } catch (error) {
    console.error('Error fetching check-in by QR:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

