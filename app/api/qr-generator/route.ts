

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Generate QR code data URL
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { data, size = 200 } = await request.json()

    if (!data) {
      return NextResponse.json(
        { message: 'Datos requeridos para generar QR' },
        { status: 400 }
      )
    }

    // Generate QR code using a simple approach
    // In production, you might want to use a QR code library
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&format=png`

    return NextResponse.json({ 
      qrCodeUrl,
      data,
      size 
    })

  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { message: 'Error generando código QR' },
      { status: 500 }
    )
  }
}

