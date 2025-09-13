
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const church = await prisma.church.findUnique({
      where: {
        id: session.user.churchId
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        description: true,
        logo: true,
        founded: true,
        isActive: true
      }
    })

    if (!church) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    return NextResponse.json({ church })
  } catch (error) {
    console.error('Error fetching church profile:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.churchId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check if user has permission to update church profile
    // For now, we'll allow all authenticated users, but this could be restricted to admins
    const body = await request.json()
    const {
      name,
      address,
      phone,
      email,
      website,
      description,
      logo
    } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la iglesia es requerido' },
        { status: 400 }
      )
    }

    // Update church profile
    const updatedChurch = await prisma.church.update({
      where: {
        id: session.user.churchId
      },
      data: {
        name: name.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        website: website?.trim() || null,
        description: description?.trim() || null,
        logo: logo?.trim() || null
      },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        description: true,
        logo: true,
        founded: true,
        isActive: true
      }
    })

    return NextResponse.json({ 
      message: 'Perfil actualizado exitosamente',
      church: updatedChurch 
    })
  } catch (error) {
    console.error('Error updating church profile:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
