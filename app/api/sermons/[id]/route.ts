
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function DELETE(
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

    const sermonId = params.id

    // Verify sermon belongs to user's church
    const existingSermon = await db.sermon.findFirst({
      where: {
        id: sermonId,
        churchId: session.user.churchId
      }
    })

    if (!existingSermon) {
      return NextResponse.json({ message: 'Sermón no encontrado' }, { status: 404 })
    }

    await db.sermon.delete({
      where: { id: sermonId }
    })

    return NextResponse.json({ message: 'Sermón eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting sermon:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
