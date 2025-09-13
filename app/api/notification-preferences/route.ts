
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const notificationPreferencesSchema = z.object({
  // Email Notifications
  emailEnabled: z.boolean().optional(),
  emailEvents: z.boolean().optional(),
  emailDonations: z.boolean().optional(),
  emailCommunications: z.boolean().optional(),
  emailSystemUpdates: z.boolean().optional(),
  
  // In-App Notifications
  inAppEnabled: z.boolean().optional(),
  inAppEvents: z.boolean().optional(),
  inAppDonations: z.boolean().optional(),
  inAppCommunications: z.boolean().optional(),
  inAppSystemUpdates: z.boolean().optional(),
  
  // Push Notifications
  pushEnabled: z.boolean().optional(),
  pushEvents: z.boolean().optional(),
  pushDonations: z.boolean().optional(),
  pushCommunications: z.boolean().optional(),
  pushSystemUpdates: z.boolean().optional(),
  
  // Notification Timing
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  weekendNotifications: z.boolean().optional(),
  
  // Frequency Settings
  digestEnabled: z.boolean().optional(),
  digestFrequency: z.enum(['DAILY', 'WEEKLY']).optional(),
})

// GET - Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Get user's notification preferences or create default ones
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.id }
    })

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          // All defaults are set in the schema
        }
      })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Update user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = notificationPreferencesSchema.parse(body)

    // Validate quiet hours format if provided
    if (validatedData.quietHoursStart && !validatedData.quietHoursStart.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return NextResponse.json({ error: 'Formato de hora inválido para inicio de horas silenciosas' }, { status: 400 })
    }
    
    if (validatedData.quietHoursEnd && !validatedData.quietHoursEnd.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      return NextResponse.json({ error: 'Formato de hora inválido para fin de horas silenciosas' }, { status: 400 })
    }

    // Upsert notification preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {
        ...validatedData,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        ...validatedData,
      }
    })

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    
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

// DELETE - Reset notification preferences to default
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Reset to default preferences
    const defaultPreferences = await prisma.notificationPreference.upsert({
      where: { userId: user.id },
      update: {
        // Email Notifications
        emailEnabled: true,
        emailEvents: true,
        emailDonations: true,
        emailCommunications: true,
        emailSystemUpdates: true,
        
        // In-App Notifications
        inAppEnabled: true,
        inAppEvents: true,
        inAppDonations: true,
        inAppCommunications: true,
        inAppSystemUpdates: true,
        
        // Push Notifications
        pushEnabled: false,
        pushEvents: true,
        pushDonations: false,
        pushCommunications: true,
        pushSystemUpdates: true,
        
        // Notification Timing
        quietHoursEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        weekendNotifications: true,
        
        // Frequency Settings
        digestEnabled: false,
        digestFrequency: 'DAILY',
        
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        // Defaults are already set in schema
      }
    })

    return NextResponse.json(defaultPreferences)
  } catch (error) {
    console.error('Error resetting notification preferences:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
