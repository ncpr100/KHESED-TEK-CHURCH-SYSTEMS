

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get payment alerts and overdue invoices
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const today = new Date()
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Get overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'SENT',
        dueDate: { lt: today }
      },
      include: {
        church: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    // Get invoices due soon
    const dueSoonInvoices = await prisma.invoice.findMany({
      where: {
        status: 'SENT',
        dueDate: { 
          gte: today,
          lte: weekFromNow 
        }
      },
      include: {
        church: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    // Get trial expirations
    const trialExpirations = await prisma.churchSubscription.findMany({
      where: {
        status: 'TRIAL',
        trialEnd: {
          gte: today,
          lte: weekFromNow
        }
      },
      include: {
        church: {
          select: { id: true, name: true, email: true }
        },
        plan: {
          select: { displayName: true }
        }
      },
      orderBy: { trialEnd: 'asc' }
    })

    // Get pending payments count
    const pendingPaymentsCount = await prisma.invoice.count({
      where: { status: 'SENT' }
    })

    return NextResponse.json({
      overdueInvoices,
      dueSoonInvoices,
      trialExpirations,
      pendingPaymentsCount,
      summary: {
        overdue: overdueInvoices.length,
        dueSoon: dueSoonInvoices.length,
        trialsExpiring: trialExpirations.length,
        totalPending: pendingPaymentsCount
      }
    })
  } catch (error) {
    console.error('Error fetching payment alerts:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Send payment reminder
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const data = await request.json()
    const { invoiceIds, type = 'PAYMENT_REMINDER' } = data

    if (!invoiceIds || !Array.isArray(invoiceIds)) {
      return NextResponse.json({ 
        error: 'Lista de facturas requerida' 
      }, { status: 400 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { id: { in: invoiceIds } },
      include: {
        church: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    const results = []
    for (const invoice of invoices) {
      try {
        // Create communication record
        await prisma.invoiceCommunication.create({
          data: {
            invoiceId: invoice.id,
            type: 'EMAIL',
            direction: 'OUTBOUND',
            subject: `Recordatorio de Pago - Factura ${invoice.invoiceNumber}`,
            message: `Estimado equipo de ${invoice.church.name}, \n\nEste es un recordatorio amigable sobre el pago pendiente de la factura ${invoice.invoiceNumber} por $${invoice.totalAmount} USD.\n\nFecha de vencimiento: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nPor favor, proceda con el pago a la brevedad posible.`,
            sentBy: session.user.id,
            sentTo: invoice.church.email
          }
        })

        // Send email
        await fetch('/api/communications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'PAYMENT_REMINDER',
            recipientEmail: invoice.church.email,
            recipientName: invoice.church.name,
            subject: `Recordatorio de Pago - Factura ${invoice.invoiceNumber}`,
            template: 'payment-reminder',
            data: {
              churchName: invoice.church.name,
              invoiceNumber: invoice.invoiceNumber,
              totalAmount: invoice.totalAmount,
              currency: invoice.currency,
              dueDate: invoice.dueDate,
              platformUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
            }
          })
        })

        results.push({ 
          invoiceId: invoice.id, 
          status: 'sent', 
          church: invoice.church.name 
        })
      } catch (error) {
        console.error(`Error sending reminder for invoice ${invoice.invoiceNumber}:`, error)
        results.push({ 
          invoiceId: invoice.id, 
          status: 'failed', 
          church: invoice.church.name,
          error: 'Email failed' 
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Recordatorios enviados: ${results.filter(r => r.status === 'sent').length}/${results.length}`,
      results
    })
  } catch (error) {
    console.error('Error sending payment reminders:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

