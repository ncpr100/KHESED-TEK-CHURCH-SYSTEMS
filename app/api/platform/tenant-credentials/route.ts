

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Fetch tenant credentials (SUPER_ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')

    const where: any = {}
    if (churchId) where.churchId = churchId

    const credentials = await prisma.tenantCredentials.findMany({
      where,
      include: {
        church: {
          select: { id: true, name: true, email: true, isActive: true }
        },
        creator: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(credentials)
  } catch (error) {
    console.error('Error fetching tenant credentials:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Create/Generate tenant credentials (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const data = await request.json()
    const { churchId, loginEmail, tempPassword, sendEmail = true } = data

    // Validate required fields
    if (!churchId || !loginEmail) {
      return NextResponse.json({ 
        error: 'Church ID y email de acceso son obligatorios' 
      }, { status: 400 })
    }

    // Check if church exists
    const church = await prisma.church.findUnique({
      where: { id: churchId }
    })

    if (!church) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    // Generate temporary password if not provided
    const password = tempPassword || Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create or update credentials
    const credentials = await prisma.tenantCredentials.upsert({
      where: { churchId },
      update: {
        loginEmail,
        tempPassword: hashedPassword,
        isFirstLogin: true,
        lastSentAt: sendEmail ? new Date() : null
      },
      create: {
        churchId,
        loginEmail,
        tempPassword: hashedPassword,
        isFirstLogin: true,
        sentAt: sendEmail ? new Date() : null,
        createdBy: session.user.id
      },
      include: {
        church: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Create or update the user account for the church
    await prisma.user.upsert({
      where: { email: loginEmail },
      update: {
        password: hashedPassword,
        isActive: true
      },
      create: {
        email: loginEmail,
        password: hashedPassword,
        name: `Admin ${church.name}`,
        role: 'ADMIN_IGLESIA',
        churchId: churchId,
        isActive: true
      }
    })

    // Send email if requested
    if (sendEmail) {
      try {
        await fetch('/api/communications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'TENANT_CREDENTIALS',
            recipientEmail: loginEmail,
            recipientName: church.name,
            subject: `Credenciales de Acceso - ${church.name}`,
            template: 'tenant-credentials',
            data: {
              churchName: church.name,
              loginEmail: loginEmail,
              tempPassword: password,
              platformUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
              supportEmail: 'soporte@khesedtek.com'
            }
          })
        })
      } catch (emailError) {
        console.error('Error sending credentials email:', emailError)
        // Don't fail the whole operation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Credenciales generadas exitosamente',
      credentials: {
        ...credentials,
        tempPassword: password // Return plain password for SUPER_ADMIN reference
      }
    })
  } catch (error) {
    console.error('Error creating tenant credentials:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

