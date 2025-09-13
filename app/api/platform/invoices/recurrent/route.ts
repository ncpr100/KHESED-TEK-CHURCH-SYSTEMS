

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch recurrent invoice configurations
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const recurrentInvoices = await prisma.invoice.findMany({
      where: { 
        isRecurrent: true,
        status: { in: ['PAID', 'SENT'] } // Only active recurrent invoices
      },
      include: {
        church: {
          select: { id: true, name: true, email: true }
        },
        subscription: {
          include: {
            plan: { select: { displayName: true } }
          }
        },
        lineItems: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(recurrentInvoices)
  } catch (error) {
    console.error('Error fetching recurrent invoices:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Generate next recurrent invoices
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const { invoiceId, forceGenerate = false } = body

    // Get the base recurrent invoice
    const baseInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lineItems: true,
        church: true
      }
    })

    if (!baseInvoice || !baseInvoice.isRecurrent) {
      return NextResponse.json({ 
        error: 'Factura recurrente no encontrada' 
      }, { status: 404 })
    }

    const recurrentConfig = baseInvoice.recurrentConfig as any
    if (!recurrentConfig) {
      return NextResponse.json({ 
        error: 'Configuración de recurrencia no encontrada' 
      }, { status: 400 })
    }

    // Calculate next due date based on frequency
    const { frequency, interval = 1 } = recurrentConfig
    const lastDueDate = new Date(baseInvoice.dueDate)
    const nextDueDate = new Date(lastDueDate)

    switch (frequency) {
      case 'MONTHLY':
        nextDueDate.setMonth(nextDueDate.getMonth() + interval)
        break
      case 'QUARTERLY':
        nextDueDate.setMonth(nextDueDate.getMonth() + (3 * interval))
        break
      case 'YEARLY':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + interval)
        break
      default:
        return NextResponse.json({ 
          error: 'Frecuencia de recurrencia no válida' 
        }, { status: 400 })
    }

    // Check if we should generate (due date approaching or force generate)
    const today = new Date()
    const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (!forceGenerate && daysUntilDue > 7) {
      return NextResponse.json({ 
        message: 'Próxima factura no es necesaria aún',
        nextDueDate: nextDueDate.toISOString(),
        daysUntilDue 
      })
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`

    // Create new recurrent invoice
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        churchId: baseInvoice.churchId,
        subscriptionId: baseInvoice.subscriptionId,
        type: baseInvoice.type,
        currency: baseInvoice.currency,
        subtotal: baseInvoice.subtotal,
        taxAmount: baseInvoice.taxAmount,
        totalAmount: baseInvoice.totalAmount,
        dueDate: nextDueDate,
        isRecurrent: true,
        recurrentConfig: recurrentConfig,
        notes: `Factura recurrente generada automáticamente`,
        createdBy: session.user.id,
        lineItems: {
          create: baseInvoice.lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            metadata: item.metadata as any
          }))
        }
      },
      include: {
        church: {
          select: { id: true, name: true, email: true }
        },
        lineItems: true
      }
    })

    // Send automatic email notification
    try {
      await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'INVOICE_GENERATED',
          recipientEmail: baseInvoice.church.email,
          recipientName: baseInvoice.church.name,
          subject: `Nueva Factura ${invoiceNumber} - ${baseInvoice.church.name}`,
          template: 'invoice-generated',
          data: {
            churchName: baseInvoice.church.name,
            invoiceNumber: invoiceNumber,
            totalAmount: baseInvoice.totalAmount,
            currency: baseInvoice.currency,
            dueDate: nextDueDate.toISOString(),
            platformUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
          }
        })
      })

      // Mark invoice as sent
      await prisma.invoice.update({
        where: { id: newInvoice.id },
        data: { 
          status: 'SENT',
          sentAt: new Date()
        }
      })
    } catch (emailError) {
      console.error('Error sending invoice email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Factura recurrente generada exitosamente',
      invoice: newInvoice
    })
  } catch (error) {
    console.error('Error generating recurrent invoice:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

