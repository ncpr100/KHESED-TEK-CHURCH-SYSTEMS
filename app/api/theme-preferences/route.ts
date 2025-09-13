
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const themePreferenceSchema = z.object({
  themeName: z.string().optional(),
  themeMode: z.enum(['light', 'dark', 'auto']).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  destructiveColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  foregroundColor: z.string().optional(),
  cardColor: z.string().optional(),
  cardForegroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  mutedColor: z.string().optional(),
  mutedForegroundColor: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.enum(['small', 'medium', 'large', 'xl']).optional(),
  borderRadius: z.string().optional(),
  compactMode: z.boolean().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  brandName: z.string().optional(),
  isPublic: z.boolean().optional(),
})

// GET - Get user's theme preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Get user's theme preference
    let themePreference = await prisma.userThemePreference.findUnique({
      where: { userId: user.id },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    })

    // If no user preference exists, create default one
    if (!themePreference) {
      themePreference = await prisma.userThemePreference.create({
        data: {
          userId: user.id,
          churchId: user.churchId,
          themeName: 'default',
          themeMode: 'light',
        },
        include: {
          church: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        }
      })
    }

    return NextResponse.json(themePreference)
  } catch (error) {
    console.error('Error fetching theme preferences:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Update user's theme preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = themePreferenceSchema.parse(body)

    // Upsert theme preference
    const themePreference = await prisma.userThemePreference.upsert({
      where: { userId: user.id },
      update: {
        ...validatedData,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        churchId: user.churchId,
        themeName: 'custom',
        themeMode: 'light',
        ...validatedData,
      },
      include: {
        church: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    })

    return NextResponse.json(themePreference)
  } catch (error) {
    console.error('Error updating theme preferences:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Reset user's theme preferences to default
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Reset to default theme
    const defaultTheme = await prisma.userThemePreference.upsert({
      where: { userId: user.id },
      update: {
        themeName: 'default',
        themeMode: 'light',
        primaryColor: null,
        secondaryColor: null,
        accentColor: null,
        destructiveColor: null,
        backgroundColor: null,
        foregroundColor: null,
        cardColor: null,
        cardForegroundColor: null,
        borderColor: null,
        mutedColor: null,
        mutedForegroundColor: null,
        fontFamily: 'Inter',
        fontSize: 'medium',
        borderRadius: '0.5rem',
        compactMode: false,
        logoUrl: null,
        faviconUrl: null,
        brandName: null,
        isPublic: false,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        churchId: user.churchId,
        themeName: 'default',
        themeMode: 'light',
        fontFamily: 'Inter',
        fontSize: 'medium',
        borderRadius: '0.5rem',
        compactMode: false,
        isPublic: false,
      }
    })

    return NextResponse.json(defaultTheme)
  } catch (error) {
    console.error('Error resetting theme preferences:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
