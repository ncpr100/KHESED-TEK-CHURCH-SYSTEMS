
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener una solicitud específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const websiteRequest = await prisma.websiteRequest.findFirst({
      where: {
        id: params.id,
        // Solo permitir acceso si es SUPER_ADMIN o es de su iglesia
        ...(session.user.role === 'SUPER_ADMIN' 
          ? {} 
          : { churchId: session.user.churchId || undefined }
        )
      },
      include: {
        church: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    })

    if (!websiteRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(websiteRequest)
  } catch (error) {
    console.error('Error fetching website request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar solicitud (principalmente para SUPER_ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Solo SUPER_ADMIN puede actualizar el estado y notas administrativas
    if (session.user.role === 'SUPER_ADMIN') {
      const updatedRequest = await prisma.websiteRequest.update({
        where: { id: params.id },
        data: {
          ...body,
          ...(body.status === 'completed' && { completedAt: new Date() })
        },
        include: {
          church: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })

      return NextResponse.json(updatedRequest)
    } 
    
    // Los usuarios regulares solo pueden actualizar ciertos campos de sus propias solicitudes
    else if (session.user.churchId) {
      const websiteRequest = await prisma.websiteRequest.findFirst({
        where: {
          id: params.id,
          churchId: session.user.churchId
        }
      })

      if (!websiteRequest) {
        return NextResponse.json(
          { error: 'Solicitud no encontrada' },
          { status: 404 }
        )
      }

      // Permitir actualizar solo ciertos campos
      const allowedFields = ['description', 'phone', 'metadata']
      const updateData: any = {}
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          updateData[field] = body[field]
        }
      }

      const updatedRequest = await prisma.websiteRequest.update({
        where: { id: params.id },
        data: updateData
      })

      return NextResponse.json(updatedRequest)
    }

    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    )
  } catch (error) {
    console.error('Error updating website request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar solicitud
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo SUPER_ADMIN o la iglesia propietaria puede eliminar
    const websiteRequest = await prisma.websiteRequest.findFirst({
      where: {
        id: params.id,
        ...(session.user.role === 'SUPER_ADMIN' 
          ? {} 
          : { churchId: session.user.churchId || undefined }
        )
      }
    })

    if (!websiteRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    await prisma.websiteRequest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Solicitud eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting website request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
