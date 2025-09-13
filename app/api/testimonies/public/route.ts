
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      title,
      message,
      category = 'general',
      isAnonymous = false,
      contactInfo,
      prayerRequestId,
      imageUrl,
      tags = [],
      formId,
      qrCodeId
    } = body

    // Validate required fields
    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Título y mensaje son requeridos' },
        { status: 400 }
      )
    }

    let churchId: string | undefined
    let contactId: string | undefined

    // Get church ID from form or QR code
    if (formId) {
      const form = await prisma.testimonyForm.findUnique({
        where: { id: formId },
        select: { churchId: true }
      })
      churchId = form?.churchId
    } else if (qrCodeId) {
      const qrCode = await prisma.testimonyQRCode.findUnique({
        where: { id: qrCodeId },
        select: { churchId: true }
      })
      churchId = qrCode?.churchId
    }

    if (!churchId) {
      return NextResponse.json(
        { error: 'No se pudo determinar la iglesia' },
        { status: 400 }
      )
    }

    // Handle contact information
    if (!isAnonymous && contactInfo) {
      const { fullName, phone, email } = contactInfo

      if (fullName?.trim()) {
        // Try to find existing contact
        let contact = null
        
        if (phone) {
          contact = await prisma.prayerContact.findFirst({
            where: {
              churchId,
              phone
            }
          })
        }
        
        if (!contact && email) {
          contact = await prisma.prayerContact.findFirst({
            where: {
              churchId,
              email
            }
          })
        }

        // Create new contact if not found
        if (!contact) {
          contact = await prisma.prayerContact.create({
            data: {
              fullName: fullName.trim(),
              phone: phone || null,
              email: email || null,
              churchId,
              source: 'testimony_form'
            }
          })
        }

        contactId = contact.id
      }
    }

    // Create the testimony
    const testimony = await prisma.prayerTestimony.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        contactId: contactId || null,
        prayerRequestId: prayerRequestId || null,
        category,
        isAnonymous,
        imageUrl: imageUrl || null,
        tags: tags,
        churchId,
        formId: formId || null,
        qrCodeId: qrCodeId || null,
        status: 'pending' // All public submissions need approval
      }
    })

    // Update QR code scan count if applicable
    if (qrCodeId) {
      await prisma.testimonyQRCode.update({
        where: { id: qrCodeId },
        data: {
          scanCount: { increment: 1 },
          lastScan: new Date()
        }
      })
    }

    return NextResponse.json(
      {
        message: 'Testimonio enviado exitosamente. Será revisado antes de ser publicado.',
        testimony: {
          id: testimony.id,
          title: testimony.title,
          status: testimony.status
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating public testimony:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
