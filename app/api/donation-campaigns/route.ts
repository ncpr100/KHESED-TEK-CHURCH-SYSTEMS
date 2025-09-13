
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all donation campaigns for a church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const isActive = searchParams.get('active') === 'true'
    const isPublic = searchParams.get('public') === 'true'

    const where: any = {
      churchId: session.user.churchId
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }
    if (isPublic !== undefined) {
      where.isPublic = isPublic
    }

    const [campaigns, total] = await Promise.all([
      prisma.donationCampaign.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              donations: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.donationCampaign.count({ where })
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// CREATE a new donation campaign
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      goalAmount,
      categoryId,
      isPublic = true,
      coverImage,
      startDate,
      endDate
    } = body

    if (!title) {
      return NextResponse.json(
        { message: 'El título es requerido' },
        { status: 400 }
      )
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.donationCategory.findUnique({
        where: { 
          id: categoryId,
          churchId: session.user.churchId 
        }
      })

      if (!category) {
        return NextResponse.json(
          { message: 'Categoría no encontrada' },
          { status: 404 }
        )
      }
    }

    // Generate unique slug
    let slug = title.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const existingSlug = await prisma.donationCampaign.findFirst({
      where: { slug }
    })

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const campaign = await prisma.donationCampaign.create({
      data: {
        title,
        description,
        goalAmount: goalAmount ? parseFloat(goalAmount.toString()) : null,
        categoryId,
        isPublic,
        slug,
        coverImage,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        churchId: session.user.churchId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(campaign, { status: 201 })

  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
