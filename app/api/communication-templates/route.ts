
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    const whereClause: any = {
      churchId: session.user.churchId,
      isActive: true
    }

    if (type) {
      whereClause.type = type
    }

    const templates = await db.communicationTemplate.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching communication templates:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { name, subject, content, type, variables, category } = body

    if (!name || !content || !type) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 })
    }

    const template = await db.communicationTemplate.create({
      data: {
        name,
        subject,
        content,
        type,
        variables: variables ? JSON.stringify(variables) : null,
        category,
        churchId: session.user.churchId
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating communication template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
