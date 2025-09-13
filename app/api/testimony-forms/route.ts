
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

    const forms = await prisma.testimonyForm.findMany({
      where: {
        churchId: session.user.churchId
      },
      include: {
        _count: {
          select: {
            qrCodes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ forms })
  } catch (error) {
    console.error('Error fetching testimony forms:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      fields,
      style = {},
      isActive = true,
      isPublic = true,
      slug
    } = body

    // Validate required fields
    if (!name?.trim() || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Nombre y campos son requeridos' },
        { status: 400 }
      )
    }

    // Generate slug if not provided
    const finalSlug = slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

    // Check for duplicate slug
    const existingForm = await prisma.testimonyForm.findFirst({
      where: {
        slug: finalSlug,
        churchId: session.user.churchId
      }
    })

    if (existingForm) {
      return NextResponse.json(
        { error: 'Ya existe un formulario con este slug' },
        { status: 400 }
      )
    }

    const form = await prisma.testimonyForm.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        fields,
        style,
        isActive,
        isPublic,
        slug: finalSlug,
        churchId: session.user.churchId
      },
      include: {
        _count: {
          select: {
            qrCodes: true
          }
        }
      }
    })

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error('Error creating testimony form:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
