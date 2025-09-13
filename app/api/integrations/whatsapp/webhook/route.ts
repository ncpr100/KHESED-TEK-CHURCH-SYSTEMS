
import { NextRequest, NextResponse } from 'next/server'
import { whatsappBusinessService } from '@/lib/integrations/whatsapp'

// GET - Webhook verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token && challenge) {
      const verification = whatsappBusinessService.verifyWebhook(token, challenge)
      
      if (verification.success && verification.challenge) {
        return new NextResponse(verification.challenge)
      }
    }

    return NextResponse.json({ error: 'Invalid verification request' }, { status: 400 })
  } catch (error) {
    console.error('WhatsApp webhook verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

// POST - Webhook message handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log incoming webhook (for debugging)
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2))

    // Process incoming messages/status updates
    if (body.entry && body.entry[0]?.changes) {
      const changes = body.entry[0].changes
      
      for (const change of changes) {
        if (change.value.messages) {
          // Handle incoming messages
          const messages = change.value.messages
          for (const message of messages) {
            console.log('Received WhatsApp message:', {
              from: message.from,
              type: message.type,
              text: message.text?.body,
              timestamp: message.timestamp
            })
            
            // Here you could:
            // 1. Save message to database
            // 2. Auto-respond to certain messages
            // 3. Notify church staff of new messages
            // 4. Integrate with prayer request system, etc.
          }
        }

        if (change.value.statuses) {
          // Handle message status updates (sent, delivered, read, failed)
          const statuses = change.value.statuses
          for (const status of statuses) {
            console.log('WhatsApp message status:', {
              messageId: status.id,
              status: status.status,
              timestamp: status.timestamp
            })
            
            // Here you could update message delivery status in database
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WhatsApp webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
