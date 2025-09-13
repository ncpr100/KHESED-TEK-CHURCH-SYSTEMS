
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const churchId = searchParams.get('churchId')

    if (!churchId) {
      return NextResponse.json({ error: 'Church ID es requerido' }, { status: 400 })
    }

    // Get communication history/logs
    const communications = await db.communication.findMany({
      where: {
        churchId: churchId,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        template: true
      }
    })

    return NextResponse.json(communications)
  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      title, 
      content, 
      type, 
      targetGroup, 
      templateId, 
      churchId,
      scheduledAt 
    } = body

    // Create mass communication entry
    const communication = await db.communication.create({
      data: {
        title,
        content,
        type,
        targetGroup,
        churchId,
        sentBy: session.user.id,
        templateId: templateId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'PROGRAMADO' : 'ENVIADO',
        recipients: 0 // Will be updated after sending
      },
      include: {
        template: true
      }
    })

    return NextResponse.json(communication, { status: 201 })
  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
