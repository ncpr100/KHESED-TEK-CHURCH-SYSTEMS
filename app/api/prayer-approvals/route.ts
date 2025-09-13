
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-approvals - List prayer approvals pending review
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      churchId: user.churchId,
      status
    }

    const [approvals, total] = await Promise.all([
      prisma.prayerApproval.findMany({
        where,
        include: {
          request: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
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
              preferredContact: true
            }
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          { request: { priority: 'desc' } },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.prayerApproval.count({ where })
    ])

    return NextResponse.json({
      approvals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching prayer approvals:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/prayer-approvals - Bulk approval/rejection
export async function POST(request: Request) {
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
    const { approvalIds, action, notes } = body // action: 'approve' | 'reject'

    if (!approvalIds || !Array.isArray(approvalIds) || approvalIds.length === 0) {
      return NextResponse.json({ error: 'IDs de aprobación requeridos' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
    }

    // Verify all approvals belong to this church and are pending
    const validApprovals = await prisma.prayerApproval.findMany({
      where: {
        id: { in: approvalIds },
        churchId: user.churchId,
        status: 'pending'
      },
      include: {
        request: true
      }
    })

    if (validApprovals.length !== approvalIds.length) {
      return NextResponse.json({ 
        error: 'Algunas aprobaciones no son válidas' 
      }, { status: 400 })
    }

    const now = new Date()
    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update approvals
    await prisma.prayerApproval.updateMany({
      where: {
        id: { in: approvalIds },
        churchId: user.churchId
      },
      data: {
        status: newStatus,
        approvedBy: user.id,
        approvedAt: now,
        notes: notes?.trim()
      }
    })

    // Update prayer requests status
    const requestIds = validApprovals.map(a => a.requestId)
    await prisma.prayerRequest.updateMany({
      where: {
        id: { in: requestIds }
      },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected'
      }
    })

    // If approved, schedule for sending (1-4 hours from now to look human)
    if (action === 'approve') {
      const randomDelay = Math.floor(Math.random() * 3 + 1) * 60 * 60 * 1000 // 1-4 hours
      const scheduledAt = new Date(Date.now() + randomDelay)

      await prisma.prayerRequest.updateMany({
        where: {
          id: { in: requestIds }
        },
        data: {
          scheduledAt,
          status: 'approved'
        }
      })
    }

    return NextResponse.json({ 
      message: `${validApprovals.length} peticiones ${action === 'approve' ? 'aprobadas' : 'rechazadas'}`,
      processedCount: validApprovals.length
    })
  } catch (error) {
    console.error('Error processing prayer approvals:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
