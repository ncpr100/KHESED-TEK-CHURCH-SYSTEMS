

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch invoice communications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const invoiceId = searchParams.get('invoiceId')

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID requerido' }, { status: 400 })
    }

    const communications = await prisma.invoiceCommunication.findMany({
      where: { invoiceId },
      include: {
        sender: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(communications)
  } catch (error) {
    console.error('Error fetching invoice communications:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Send invoice communication
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const data = await request.json()
    const {
      invoiceId,
      type = 'EMAIL',
      subject,
      message,
      sentTo
    } = data

    // Validate required fields
    if (!invoiceId || !message || !sentTo) {
      return NextResponse.json({ 
        error: 'Invoice ID, mensaje y destinatario son obligatorios' 
      }, { status: 400 })
    }

    // Get invoice details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        church: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    // Create communication record
    const communication = await prisma.invoiceCommunication.create({
      data: {
        invoiceId,
        type,
        direction: 'OUTBOUND',
        subject,
        message,
        sentBy: session.user.id,
        sentTo: sentTo,
        status: 'SENT'
      }
    })

    // Send actual communication based on type
    try {
      if (type === 'EMAIL') {
        await fetch('/api/communications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'INVOICE_COMMUNICATION',
            recipientEmail: sentTo,
            recipientName: invoice.church.name,
            subject: subject || `Factura ${invoice.invoiceNumber}`,
            template: 'invoice-communication',
            data: {
              churchName: invoice.church.name,
              invoiceNumber: invoice.invoiceNumber,
              totalAmount: invoice.totalAmount,
              currency: invoice.currency,
              dueDate: invoice.dueDate,
              message: message,
              platformUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
            }
          })
        })
      } else if (type === 'WHATSAPP') {
        // WhatsApp integration would go here
        console.log('WhatsApp message would be sent:', message)
      }
    } catch (commError) {
      console.error('Error sending communication:', commError)
      // Update communication status to failed
      await prisma.invoiceCommunication.update({
        where: { id: communication.id },
        data: { status: 'FAILED' }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Comunicación enviada exitosamente',
      communication
    })
  } catch (error) {
    console.error('Error sending invoice communication:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

