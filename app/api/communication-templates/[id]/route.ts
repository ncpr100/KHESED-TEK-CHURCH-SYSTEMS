
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const template = await db.communicationTemplate.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching communication template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { name, subject, content, type, variables, category, isActive } = body

    const template = await db.communicationTemplate.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    const updatedTemplate = await db.communicationTemplate.update({
      where: { id: params.id },
      data: {
        name: name || template.name,
        subject: subject !== undefined ? subject : template.subject,
        content: content || template.content,
        type: type || template.type,
        variables: variables ? JSON.stringify(variables) : template.variables,
        category: category !== undefined ? category : template.category,
        isActive: isActive !== undefined ? isActive : template.isActive
      }
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error('Error updating communication template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const template = await db.communicationTemplate.findFirst({
      where: {
        id: params.id,
        churchId: session.user.churchId
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template no encontrado' }, { status: 404 })
    }

    await db.communicationTemplate.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Template eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting communication template:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
