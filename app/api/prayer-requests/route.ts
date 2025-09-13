
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/prayer-requests - List prayer requests with filters
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const categoryId = searchParams.get('categoryId')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where = {
      churchId: user.churchId,
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(priority && { priority })
    }

    const [requests, total] = await Promise.all([
      prisma.prayerRequest.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
              preferredContact: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true
            }
          },
          approval: {
            include: {
              approver: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.prayerRequest.count({ where })
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching prayer requests:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/prayer-requests - Create new prayer request (public form submission)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      fullName, 
      phone, 
      email, 
      categoryId, 
      message,
      preferredContact = 'sms',
      isAnonymous = false,
      priority = 'normal',
      churchId,
      formId,
      qrCodeId
    } = body

    if (!fullName || !categoryId || !churchId) {
      return NextResponse.json({ 
        error: 'Nombre, categoría y iglesia son requeridos' 
      }, { status: 400 })
    }

    if (!phone && !email) {
      return NextResponse.json({ 
        error: 'Teléfono o email son requeridos' 
      }, { status: 400 })
    }

    // Verify church exists
    const church = await prisma.church.findFirst({
      where: {
        id: churchId,
        isActive: true
      }
    })

    if (!church) {
      return NextResponse.json({ error: 'Iglesia no encontrada' }, { status: 404 })
    }

    // Verify category exists and belongs to church
    const category = await prisma.prayerCategory.findFirst({
      where: {
        id: categoryId,
        churchId: churchId,
        isActive: true
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
    }

    // Find or create prayer contact
    let contact = null
    
    if (phone) {
      contact = await prisma.prayerContact.findFirst({
        where: {
          churchId,
          phone: phone.trim()
        }
      })
    }
    
    if (!contact && email) {
      contact = await prisma.prayerContact.findFirst({
        where: {
          churchId,
          email: email.trim().toLowerCase()
        }
      })
    }

    if (!contact) {
      contact = await prisma.prayerContact.create({
        data: {
          fullName: fullName.trim(),
          phone: phone?.trim(),
          email: email?.trim().toLowerCase(),
          preferredContact,
          churchId,
          source: formId ? 'prayer_form' : 'direct'
        }
      })
    } else {
      // Update existing contact with latest info
      contact = await prisma.prayerContact.update({
        where: { id: contact.id },
        data: {
          fullName: fullName.trim(),
          phone: phone?.trim() || contact.phone,
          email: email?.trim().toLowerCase() || contact.email,
          preferredContact
        }
      })
    }

    // Create prayer request
    const prayerRequest = await prisma.prayerRequest.create({
      data: {
        contactId: contact.id,
        categoryId,
        message: message?.trim(),
        isAnonymous,
        priority,
        churchId,
        formId,
        qrCodeId,
        status: 'pending'
      },
      include: {
        contact: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            preferredContact: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true
          }
        }
      }
    })

    // Create approval record for pastor review
    await prisma.prayerApproval.create({
      data: {
        requestId: prayerRequest.id,
        contactId: contact.id,
        approvedBy: churchId, // Temporary - will be set when pastor approves
        churchId,
        status: 'pending'
      }
    })

    // Update QR code scan count if applicable
    if (qrCodeId) {
      await prisma.prayerQRCode.update({
        where: { id: qrCodeId },
        data: {
          scanCount: { increment: 1 },
          lastScan: new Date()
        }
      }).catch(() => {}) // Don't fail if QR code update fails
    }

    return NextResponse.json({ 
      request: prayerRequest,
      message: 'Petición de oración enviada. Recibirás una respuesta pronto.'
    })
  } catch (error) {
    console.error('Error creating prayer request:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
