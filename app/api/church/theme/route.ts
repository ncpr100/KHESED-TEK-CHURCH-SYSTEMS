
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const theme = await prisma.churchTheme.findUnique({
      where: {
        churchId: session.user.churchId
      }
    })

    return NextResponse.json({ theme })
  } catch (error) {
    console.error('Error fetching church theme:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      primaryColor,
      secondaryColor,
      accentColor,
      primaryFont,
      headingFont,
      badgeStyle
    } = body

    // Prepare theme configuration
    const themeConfig = JSON.stringify({
      primaryColor,
      secondaryColor,
      accentColor,
      badgeStyle
    })

    const brandColors = JSON.stringify({
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor
    })

    // Upsert church theme (create or update)
    const updatedTheme = await prisma.churchTheme.upsert({
      where: {
        churchId: session.user.churchId
      },
      update: {
        themeConfig,
        brandColors,
        primaryFont,
        headingFont,
        themeName: 'custom'
      },
      create: {
        churchId: session.user.churchId,
        themeConfig,
        brandColors,
        primaryFont,
        headingFont,
        themeName: 'custom'
      }
    })

    return NextResponse.json({ 
      message: 'Tema actualizado exitosamente',
      theme: updatedTheme 
    })
  } catch (error) {
    console.error('Error updating church theme:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
