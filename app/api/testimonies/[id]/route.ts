
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const testimony = await prisma.prayerTestimony.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      },
      include: {
        contact: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        },
        prayerRequest: {
          select: {
            id: true,
            message: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!testimony) {
      return NextResponse.json(
        { error: 'Testimonio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ testimony })
  } catch (error) {
    console.error('Error fetching testimony:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      message,
      category,
      isAnonymous,
      imageUrl,
      tags,
      status,
      isPublic
    } = body

    // Check if testimony exists and belongs to this church
    const existingTestimony = await prisma.prayerTestimony.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!existingTestimony) {
      return NextResponse.json(
        { error: 'Testimonio no encontrado' },
        { status: 404 }
      )
    }

    const updatedData: any = {}

    if (title !== undefined) updatedData.title = title.trim()
    if (message !== undefined) updatedData.message = message.trim()
    if (category !== undefined) updatedData.category = category
    if (isAnonymous !== undefined) updatedData.isAnonymous = isAnonymous
    if (imageUrl !== undefined) updatedData.imageUrl = imageUrl
    if (tags !== undefined) updatedData.tags = tags

    // Status changes require admin approval
    if (status !== undefined) {
      updatedData.status = status
      if (status === 'approved') {
        updatedData.approvedBy = session.user.id
        updatedData.approvedAt = new Date()
        updatedData.isPublic = isPublic !== undefined ? isPublic : true
      } else if (status === 'rejected') {
        updatedData.approvedBy = session.user.id
        updatedData.approvedAt = new Date()
        updatedData.isPublic = false
      }
    }

    const testimony = await prisma.prayerTestimony.update({
      where: { id: params.id },
      data: updatedData,
      include: {
        contact: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
          }
        },
        prayerRequest: {
          select: {
            id: true,
            message: true,
            category: {
              select: {
                id: true,
                name: true,
                color: true
              }
            }
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ testimony })
  } catch (error) {
    console.error('Error updating testimony:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if testimony exists and belongs to this church
    const existingTestimony = await prisma.prayerTestimony.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!existingTestimony) {
      return NextResponse.json(
        { error: 'Testimonio no encontrado' },
        { status: 404 }
      )
    }

    await prisma.prayerTestimony.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Testimonio eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting testimony:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
