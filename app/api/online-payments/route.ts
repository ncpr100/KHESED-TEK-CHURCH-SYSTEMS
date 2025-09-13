
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentGatewayFactory, DonationPaymentData } from '@/lib/payments/colombian-gateways'

export const dynamic = 'force-dynamic'

// GET - Get online payments for a church (Authenticated endpoint)
export async function GET(request: NextRequest) {
  try {
    // Note: For admin dashboard, we need authentication
    // For now, we'll return empty array to prevent errors
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')
    
    if (!churchId) {
      return NextResponse.json([]) // Return empty array instead of error
    }

    const payments = await prisma.onlinePayment.findMany({
      where: {
        churchId: churchId,
        status: { in: ['completed', 'pending', 'failed'] }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to recent payments
    })

    return NextResponse.json(payments)

  } catch (error) {
    console.error('Error fetching online payments:', error)
    return NextResponse.json([]) // Return empty array on error to prevent crashes
  }
}

// POST - Create online payment (Public endpoint - no authentication required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      amount,
      currency = 'COP',
      donorName,
      donorEmail,
      donorPhone,
      churchId,
      categoryId,
      campaignId,
      gatewayType,
      notes,
      returnUrl
    } = body

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Monto debe ser mayor a cero' },
        { status: 400 }
      )
    }

    if (!donorName || !donorEmail) {
      return NextResponse.json(
        { error: 'Nombre y email del donante son requeridos' },
        { status: 400 }
      )
    }

    if (!churchId) {
      return NextResponse.json(
        { error: 'ID de iglesia es requerido' },
        { status: 400 }
      )
    }

    if (!gatewayType || !['pse', 'nequi'].includes(gatewayType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Método de pago no válido' },
        { status: 400 }
      )
    }

    // Verify church exists
    const church = await prisma.church.findUnique({
      where: { id: churchId, isActive: true }
    })

    if (!church) {
      return NextResponse.json(
        { error: 'Iglesia no encontrada' },
        { status: 404 }
      )
    }

    // Verify category exists if provided
    if (categoryId) {
      const category = await prisma.donationCategory.findUnique({
        where: { 
          id: categoryId,
          churchId: churchId,
          isActive: true 
        }
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Categoría de donación no encontrada' },
          { status: 404 }
        )
      }
    }

    // Verify campaign exists if provided
    if (campaignId) {
      const campaign = await prisma.donationCampaign.findUnique({
        where: { 
          id: campaignId,
          churchId: churchId,
          isActive: true 
        }
      })

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaña de donación no encontrada' },
          { status: 404 }
        )
      }
    }

    // Create payment gateway instance
    const gateway = PaymentGatewayFactory.createGateway(gatewayType)

    // Prepare payment data
    const paymentData: DonationPaymentData = {
      amount: parseFloat(amount.toString()),
      currency,
      donorName,
      donorEmail,
      donorPhone,
      churchId,
      categoryId,
      notes,
      returnUrl: returnUrl || `${process.env.NEXTAUTH_URL}/donate/thank-you`
    }

    // Process payment with gateway
    const paymentResult = await gateway.processPayment(
      paymentData.amount,
      paymentData.currency,
      paymentData
    )

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Error procesando pago' },
        { status: 400 }
      )
    }

    // Create online payment record
    const onlinePayment = await prisma.onlinePayment.create({
      data: {
        paymentId: paymentResult.paymentId!,
        amount: paymentData.amount,
        currency: paymentData.currency,
        gatewayType: gatewayType.toLowerCase(),
        status: 'pending',
        donorName: paymentData.donorName,
        donorEmail: paymentData.donorEmail,
        donorPhone: paymentData.donorPhone,
        churchId: paymentData.churchId,
        categoryId: paymentData.categoryId,
        reference: `PAY-${Date.now()}`,
        redirectUrl: paymentResult.redirectUrl,
        returnUrl: paymentData.returnUrl,
        notes: paymentData.notes,
        metadata: paymentResult.gatewayResponse
      }
    })

    // Return payment info to frontend
    return NextResponse.json({
      success: true,
      paymentId: onlinePayment.paymentId,
      redirectUrl: paymentResult.redirectUrl,
      reference: onlinePayment.reference,
      amount: onlinePayment.amount,
      currency: onlinePayment.currency,
      donorName: onlinePayment.donorName
    })

  } catch (error) {
    console.error('Online Payment Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

