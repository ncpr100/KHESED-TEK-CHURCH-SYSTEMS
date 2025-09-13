

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch all invoices (SUPER_ADMIN only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const churchId = searchParams.get('churchId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status && status !== 'ALL') where.status = status
    if (churchId) where.churchId = churchId

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          church: {
            select: { id: true, name: true, email: true }
          },
          subscription: {
            select: { id: true, planId: true }
          },
          lineItems: true,
          payments: {
            include: {
              verifier: {
                select: { id: true, name: true }
              }
            }
          },
          _count: {
            select: { communications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.invoice.count({ where })
    ])

    return NextResponse.json({
      invoices,
      total,
      page,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Create new invoice (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const data = await request.json()
    const {
      churchId,
      subscriptionId,
      type = 'SUBSCRIPTION',
      dueDate,
      isRecurrent = false,
      recurrentConfig,
      notes,
      lineItems
    } = data

    // Validate required fields
    if (!churchId || !dueDate || !lineItems || lineItems.length === 0) {
      return NextResponse.json({ 
        error: 'Church ID, fecha de vencimiento y items de factura son obligatorios' 
      }, { status: 400 })
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
    const settings = await prisma.platformSettings.findFirst()
    const taxRate = settings?.taxRate || 0
    const taxAmount = subtotal * (taxRate / 100)
    const totalAmount = subtotal + taxAmount

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`

    // Create invoice with line items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        churchId,
        subscriptionId,
        type,
        currency: settings?.currency || 'USD',
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

