
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-approvals/[id] - Get single prayer approval
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    // Check user permissions (PASTOR or above)
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const approval = await prisma.prayerApproval.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId
      },
      include: {
        request: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                color: true
              }
            }
          }
        },
        contact: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            preferredContact: true,
            notes: true
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

    if (!approval) {
      return NextResponse.json({ error: 'Aprobación no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ approval })
  } catch (error) {
    console.error('Error fetching prayer approval:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/prayer-approvals/[id] - Update prayer approval (approve/reject single)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    // Check user permissions (PASTOR or above)
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
    }

    const body = await request.json()
    const { action, notes } = body // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
    }

    const approval = await prisma.prayerApproval.findFirst({
      where: {
        id: params.id,
        churchId: user.churchId,
        status: 'pending'
      },
      include: {
        request: true
      }
    })

    if (!approval) {
      return NextResponse.json({ 
        error: 'Aprobación no encontrada o ya procesada' 
      }, { status: 404 })
    }

    const now = new Date()
    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update approval
    const updatedApproval = await prisma.prayerApproval.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        approvedBy: user.id,
        approvedAt: now,
        notes: notes?.trim()
      }
    })

    // Update prayer request
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected'
    }

    // If approved, schedule for sending (1-4 hours from now to look human)
    if (action === 'approve') {
      const randomDelay = Math.floor(Math.random() * 3 + 1) * 60 * 60 * 1000 // 1-4 hours
      updateData.scheduledAt = new Date(Date.now() + randomDelay)
    }

    await prisma.prayerRequest.update({
      where: { id: approval.requestId },
      data: updateData
    })

    return NextResponse.json({ 
      approval: updatedApproval,
      message: `Petición ${action === 'approve' ? 'aprobada' : 'rechazada'}`
    })
  } catch (error) {
    console.error('Error updating prayer approval:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
