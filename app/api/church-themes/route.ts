
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const churchThemeSchema = z.object({
  themeName: z.string().optional(),
  themeConfig: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  brandColors: z.string().optional(),
  primaryFont: z.string().optional(),
  headingFont: z.string().optional(),
  layoutStyle: z.enum(['default', 'modern', 'classic', 'minimal']).optional(),
  allowMemberThemes: z.boolean().optional(),
  allowColorChanges: z.boolean().optional(),
  allowFontChanges: z.boolean().optional(),
  allowLayoutChanges: z.boolean().optional(),
})

// GET - Get church theme configuration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Get church theme configuration
    let churchTheme = await prisma.churchTheme.findUnique({
      where: { churchId: user.churchId },
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

    // If no church theme exists, create default one
    if (!churchTheme) {
      churchTheme = await prisma.churchTheme.create({
        data: {
          churchId: user.churchId,
          themeName: 'church-default',
          themeConfig: JSON.stringify({
            primaryColor: '220.9 39.3% 11%',
            secondaryColor: '220 14.3% 95.9%',
            accentColor: '220 14.3% 95.9%',
            backgroundColor: '0 0% 100%',
            foregroundColor: '224 71.4% 4.1%'
          }),
          layoutStyle: 'default',
          primaryFont: 'Inter',
          headingFont: 'Inter',
          allowMemberThemes: true,
          allowColorChanges: true,
          allowFontChanges: true,
          allowLayoutChanges: false,
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

    return NextResponse.json(churchTheme)
  } catch (error) {
    console.error('Error fetching church theme:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Update church theme configuration (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user || !user.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Check if user has permission to modify church theme
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos para modificar tema de iglesia' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = churchThemeSchema.parse(body)

    // Upsert church theme
    const churchTheme = await prisma.churchTheme.upsert({
      where: { churchId: user.churchId },
      update: {
        ...validatedData,
        updatedAt: new Date(),
      },
      create: {
        churchId: user.churchId,
        themeName: 'church-custom',
        themeConfig: JSON.stringify({}),
        layoutStyle: 'default',
        primaryFont: 'Inter',
        headingFont: 'Inter',
        allowMemberThemes: true,
        allowColorChanges: true,
        allowFontChanges: true,
        allowLayoutChanges: false,
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

    return NextResponse.json(churchTheme)
  } catch (error) {
    console.error('Error updating church theme:', error)
    
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
