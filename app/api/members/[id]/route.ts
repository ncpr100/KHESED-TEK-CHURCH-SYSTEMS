
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const data = await request.json()
    const memberId = params.id

    // Verify member belongs to user's church
    const existingMember = await db.member.findFirst({
      where: {
        id: memberId,
        churchId: session.user.churchId
      }
    })

    if (!existingMember) {
      return NextResponse.json({ message: 'Miembro no encontrado' }, { status: 404 })
    }

    const updatedMember = await db.member.update({
      where: { id: memberId },
      data: data
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
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
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const memberId = params.id

    // Verify member belongs to user's church
    const existingMember = await db.member.findFirst({
      where: {
        id: memberId,
        churchId: session.user.churchId
      }
    })

    if (!existingMember) {
      return NextResponse.json({ message: 'Miembro no encontrado' }, { status: 404 })
    }

    // Soft delete
    await db.member.update({
      where: { id: memberId },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Miembro eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
