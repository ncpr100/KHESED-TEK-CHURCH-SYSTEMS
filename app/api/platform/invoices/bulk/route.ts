

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Create bulk invoices for multiple churches
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const data = await request.json()
    const {
      churchIds,
      type = 'SUBSCRIPTION',
      dueDate,
      isRecurrent = false,
      recurrentConfig,
      notes,
      lineItems
    } = data

    // Validate required fields
    if (!churchIds || !Array.isArray(churchIds) || churchIds.length === 0) {
      return NextResponse.json({ 
        error: 'Lista de iglesias es obligatoria' 
      }, { status: 400 })
    }

    if (!dueDate || !lineItems || lineItems.length === 0) {
      return NextResponse.json({ 
        error: 'Fecha de vencimiento y items de factura son obligatorios' 
      }, { status: 400 })
    }

    // Get platform settings
    const settings = await prisma.platformSettings.findFirst()
    const taxRate = settings?.taxRate || 0
    const currency = settings?.currency || 'USD'

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const taxAmount = subtotal * (taxRate / 100)
    const totalAmount = subtotal + taxAmount

    // Get invoice count for numbering
    const invoiceCount = await prisma.invoice.count()
    
    // Create invoices for all churches
    const createdInvoices = []
    for (let i = 0; i < churchIds.length; i++) {
      const churchId = churchIds[i]
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + i + 1).padStart(4, '0')}`

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          churchId,
          type,
          currency,
          subtotal,
          taxAmount,
          totalAmount,
          dueDate: new Date(dueDate),
          isRecurrent,
          recurrentConfig,
          notes,
          createdBy: session.user.id,
          lineItems: {
            create: lineItems.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
              metadata: item.metadata
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

      createdInvoices.push(invoice)
    }

    return NextResponse.json({
      success: true,
      message: `${createdInvoices.length} facturas creadas exitosamente`,
      invoices: createdInvoices
    })
  } catch (error) {
    console.error('Error creating bulk invoices:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

