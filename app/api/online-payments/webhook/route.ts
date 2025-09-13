
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentGatewayFactory } from '@/lib/payments/colombian-gateways'

export const dynamic = 'force-dynamic'

// POST - Handle payment webhook from Colombian gateways
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('signature') || request.headers.get('x-signature')
    
    // Log webhook for debugging
    console.log('Payment Webhook received:', {
      headers: Object.fromEntries(request.headers.entries()),
      body
    })

    // Determine gateway type from headers or body
    let gatewayType: string
    if (request.headers.get('user-agent')?.includes('PSE')) {
      gatewayType = 'pse'
    } else if (request.headers.get('user-agent')?.includes('Nequi')) {
      gatewayType = 'nequi'
    } else if (body.gateway || body.source) {
      gatewayType = (body.gateway || body.source).toLowerCase()
    } else {
      return NextResponse.json(
        { error: 'Cannot determine gateway type' },
        { status: 400 }
      )
    }

    // Extract payment ID from webhook payload
    const paymentId = body.payment_id || body.transaction_id || body.id || body.paymentId

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID not found in webhook' },
        { status: 400 }
      )
    }

    // Find payment record
    const payment = await prisma.onlinePayment.findUnique({
      where: { paymentId: paymentId.toString() }
    })

    if (!payment) {
      console.warn(`Webhook received for unknown payment: ${paymentId}`)
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify payment status with gateway
    try {
      const gateway = PaymentGatewayFactory.createGateway(gatewayType)
      const statusResult = await gateway.verifyPayment(paymentId.toString())
      
      // Update payment record
      const updatedPayment = await prisma.onlinePayment.update({
        where: { id: payment.id },
        data: {
          status: statusResult.status,
          completedAt: statusResult.status === 'completed' ? new Date() : undefined,
          webhookReceived: true,
          metadata: {
            ...payment.metadata as any,
            webhook: body,
            verified: true
          },
          updatedAt: new Date()
        }
      })

      // If payment completed and no donation exists, create it
      if (statusResult.status === 'completed' && !payment.donationId) {
        await createDonationFromPayment(payment.id)
        
        // Send confirmation email to donor
        await sendDonationConfirmationEmail(payment.id)
        
        // Update campaign total if applicable
        if (payment.categoryId) {
          await updateCampaignTotal(payment.categoryId, payment.amount)
        }
      }

      console.log(`Payment ${paymentId} updated to status: ${statusResult.status}`)

      return NextResponse.json({
        message: 'Webhook processed successfully',
        paymentId,
        status: statusResult.status
      })

    } catch (error) {
      console.error(`Error verifying payment ${paymentId}:`, error)
      
      // Still mark webhook as received even if verification failed
      await prisma.onlinePayment.update({
        where: { id: payment.id },
        data: {
          webhookReceived: true,
          metadata: {
            ...payment.metadata as any,
            webhook: body,
            error: error instanceof Error ? error.message : 'Verification failed'
          },
          updatedAt: new Date()
        }
      })

      return NextResponse.json(
        { error: 'Error verifying payment' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

// Helper function to create donation from completed payment
async function createDonationFromPayment(onlinePaymentId: string) {
  const payment = await prisma.onlinePayment.findUnique({
    where: { id: onlinePaymentId }
  })

  if (!payment || payment.donationId) {
    return // Payment not found or already has donation
  }

  // Find or create payment method for this gateway
  let paymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      churchId: payment.churchId,
      name: payment.gatewayType.toUpperCase(),
      isActive: true
    }
  })

  if (!paymentMethod) {
    paymentMethod = await prisma.paymentMethod.create({
      data: {
        name: payment.gatewayType.toUpperCase(),
        description: `Pago online ${payment.gatewayType}`,
        isDigital: true,
        churchId: payment.churchId
      }
    })
  }

  // Create donation record
  const donation = await prisma.donation.create({
    data: {
      amount: payment.amount,
      currency: payment.currency,
      donorName: payment.donorName,
      donorEmail: payment.donorEmail,
      donorPhone: payment.donorPhone,
      categoryId: payment.categoryId!,
      paymentMethodId: paymentMethod.id,
      reference: `ONLINE-${payment.reference}`,
      notes: payment.notes,
      isAnonymous: false,
      status: 'COMPLETADA',
      donationDate: payment.completedAt || new Date(),
      churchId: payment.churchId
    }
  })

  // Link payment to donation
  await prisma.onlinePayment.update({
    where: { id: onlinePaymentId },
    data: { donationId: donation.id }
  })

  return donation
}

// Helper function to send confirmation email
async function sendDonationConfirmationEmail(onlinePaymentId: string) {
  try {
    const payment = await prisma.onlinePayment.findUnique({
      where: { id: onlinePaymentId },
      include: {
        church: true,
        category: true,
        donation: true
      }
    })

    if (!payment || !payment.donorEmail) {
      return
    }

    // Here you would integrate with your email service
    // For now, we'll just log it
    console.log('Donation confirmation email should be sent to:', {
      email: payment.donorEmail,
      donor: payment.donorName,
      church: payment.church.name,
      amount: payment.amount,
      currency: payment.currency,
      reference: payment.reference
    })

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    
  } catch (error) {
    console.error('Error sending confirmation email:', error)
  }
}

// Helper function to update campaign totals
async function updateCampaignTotal(categoryId: string, amount: number) {
  try {
    // Find campaigns using this category
    const campaigns = await prisma.donationCampaign.findMany({
      where: {
        categoryId,
        isActive: true
      }
    })

    // Update current amounts
    for (const campaign of campaigns) {
      await prisma.donationCampaign.update({
        where: { id: campaign.id },
        data: {
          currentAmount: {
            increment: amount
          }
        }
      })
    }
    
  } catch (error) {
    console.error('Error updating campaign total:', error)
  }
}
