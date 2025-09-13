

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Record payment for invoice
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const data = await request.json()
    const {
      amount,
      currency = 'USD',
      paymentMethod,
      reference,
      notes
    } = data

    // Validate required fields
    if (!amount || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Cantidad y método de pago son obligatorios' 
      }, { status: 400 })
    }

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        payments: true
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 })
    }

    // Calculate total payments
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0)
    const newTotalPaid = totalPaid + amount

    // Create payment record
    const payment = await prisma.invoicePayment.create({
      data: {
        invoiceId: params.id,
        amount,
        currency,
        paymentMethod,
        reference,
        notes,
        verifiedBy: session.user.id,
        verifiedAt: new Date()
      }
    })

    // Update invoice status if fully paid
    if (newTotalPaid >= invoice.totalAmount) {
      await prisma.invoice.update({
        where: { id: params.id },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error recording payment:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

