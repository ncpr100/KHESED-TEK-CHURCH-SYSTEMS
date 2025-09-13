
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
// Import SSE broadcast functions
import { 
  broadcastToUser, 
  broadcastToChurch, 
  broadcastToRole, 
  broadcastToConnections,
  getConnectionStats,
  getConnectedUsers
} from '@/lib/sse-broadcast'
import { z } from 'zod'

const broadcastSchema = z.object({
  type: z.enum(['notification', 'system', 'chat', 'presence']).default('notification'),
  target: z.enum(['user', 'church', 'role', 'global']),
  targetId: z.string().optional(), // userId for 'user', churchId for 'church', role for 'role'
  title: z.string(),
  message: z.string(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  category: z.string().optional(),
  actionUrl: z.string().optional(),
  actionLabel: z.string().optional(),
  data: z.any().optional() // Additional data for the notification
})

// POST - Broadcast real-time notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const sessionUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true, name: true }
    })

    if (!sessionUser || !sessionUser.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 400 })
    }

    // Check permissions - only admins can broadcast
    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(sessionUser.role)) {
      return NextResponse.json({ error: 'Sin permisos para enviar notificaciones en tiempo real' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = broadcastSchema.parse(body)

    // Create the real-time notification message
    const realtimeMessage = {
      id: `rt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: validatedData.type,
      data: {
        title: validatedData.title,
        message: validatedData.message,
        priority: validatedData.priority,
        category: validatedData.category,
        actionUrl: validatedData.actionUrl,
        actionLabel: validatedData.actionLabel,
        senderId: sessionUser.id,
        senderName: sessionUser.name,
        churchId: sessionUser.churchId,
        ...validatedData.data
      },
      userId: validatedData.target === 'user' ? validatedData.targetId : undefined,
      churchId: sessionUser.churchId,
      role: validatedData.target === 'role' ? validatedData.targetId : undefined,
      timestamp: Date.now()
    }

    let success = false
    let targetInfo = ''

    // Broadcast based on target type
    switch (validatedData.target) {
      case 'user':
        if (!validatedData.targetId) {
          return NextResponse.json({ error: 'targetId requerido para target "user"' }, { status: 400 })
        }
        
        // Verify user exists and belongs to same church (unless SUPER_ADMIN)
        if (sessionUser.role !== 'SUPER_ADMIN') {
          const targetUser = await prisma.user.findFirst({
            where: { 
              id: validatedData.targetId,
              churchId: sessionUser.churchId 
            }
          })
          
          if (!targetUser) {
            return NextResponse.json({ error: 'Usuario objetivo no encontrado' }, { status: 404 })
          }
        }
        
        broadcastToUser(validatedData.targetId, realtimeMessage)
        success = true // SSE broadcast doesn't return success status
        targetInfo = `user ${validatedData.targetId}`
        break

      case 'church':
        const targetChurchId = validatedData.targetId || sessionUser.churchId
        
        // SUPER_ADMIN can broadcast to any church, others only to their own
        if (sessionUser.role !== 'SUPER_ADMIN' && targetChurchId !== sessionUser.churchId) {
          return NextResponse.json({ error: 'Sin permisos para enviar a esta iglesia' }, { status: 403 })
        }
        
        broadcastToChurch(targetChurchId, realtimeMessage)
        success = true
        targetInfo = `church ${targetChurchId}`
        break

      case 'role':
        if (!validatedData.targetId) {
          return NextResponse.json({ error: 'targetId (role) requerido para target "role"' }, { status: 400 })
        }
        
        // Check if user can broadcast to this role
        const allowedRoles = ['MIEMBRO', 'VOLUNTARIO', 'LIDER', 'PASTOR', 'ADMIN_IGLESIA']
        if (!allowedRoles.includes(validatedData.targetId)) {
          return NextResponse.json({ error: 'Rol objetivo no válido' }, { status: 400 })
        }
        
        broadcastToRole(validatedData.targetId, realtimeMessage)
        success = true
        targetInfo = `role ${validatedData.targetId}`
        break

      case 'global':
        // Only SUPER_ADMIN can do global broadcasts
        if (sessionUser.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ error: 'Solo SUPER_ADMIN puede hacer broadcasts globales' }, { status: 403 })
        }
        
        broadcastToConnections(realtimeMessage)
        success = true
        targetInfo = 'global'
        break

      default:
        return NextResponse.json({ error: 'Tipo de target no válido' }, { status: 400 })
    }

    if (!success && validatedData.target === 'user') {
      return NextResponse.json({ 
        success: false,
        message: 'Usuario no está conectado, notificación no enviada en tiempo real',
        realtimeMessage 
      })
    }

    console.log(`📡 Real-time notification broadcast to ${targetInfo}: ${validatedData.title}`)

    return NextResponse.json({
      success: true,
      target: targetInfo,
      messageId: realtimeMessage.id,
      timestamp: realtimeMessage.timestamp
    })

  } catch (error) {
    console.error('Error broadcasting real-time notification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET - Get real-time connection status and statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, churchId: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 400 })
    }

    // Get connection stats and users from SSE
    const stats = getConnectionStats()
    
    let connectedUsers = []
    if (['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(user.role)) {
      // Admins can see connected users
      if (user.role === 'SUPER_ADMIN') {
        connectedUsers = getConnectedUsers() // All users
      } else {
        connectedUsers = getConnectedUsers(user.churchId || undefined) // Church users only
      }
    }

    // Check if current user is online by looking at connected users
    const isOnline = connectedUsers.some(u => u.userId === user.id)

    return NextResponse.json({
      stats,
      isOnline,
      connectedUsers: connectedUsers.map(u => ({
        userId: u.userId,
        name: u.name,
        role: u.role,
        status: u.status,
        currentPage: u.currentPage,
        lastSeen: u.lastSeen
      }))
    })

  } catch (error) {
    console.error('Error getting real-time status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
