
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const sermons = await db.sermon.findMany({
      where: {
        churchId: session.user.churchId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sermons)
  } catch (error) {
    console.error('Error fetching sermons:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.churchId) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Sin permisos' }, { status: 403 })
    }

    const data = await request.json()

    // Validation
    if (!data.title) {
      return NextResponse.json(
        { message: 'El título es requerido' },
        { status: 400 }
      )
    }

    const sermon = await db.sermon.create({
      data: {
        title: data.title,
        content: data.content || '',
        outline: data.outline || '',
        scripture: data.scripture || '',
        speaker: session.user.name || '',
        churchId: session.user.churchId,
        isPublic: false
      }
    })

    return NextResponse.json(sermon, { status: 201 })
  } catch (error) {
    console.error('Error creating sermon:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
