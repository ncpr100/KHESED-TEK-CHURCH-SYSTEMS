
import { NextResponse } from "next/server"
import { communicationService } from "@/lib/integrations/communication"

export async function GET() {
  try {
    // Test email
    const emailResult = await communicationService.sendEmail({
      to: "test@example.com",
      subject: "Test Email",
      text: "Test email message"
    })
    
    // Test SMS
    const smsResult = await communicationService.sendSMS({
      to: "+1234567890",
      body: "Test SMS message"
    })
    
    // Test WhatsApp
    const whatsappResult = await communicationService.sendWhatsApp(
      "+1234567890",
      "Test WhatsApp message"
    )
    
    // Get overall status
    const status = communicationService.getStatus()
    
    return NextResponse.json({ 
      success: true,
      integrations: {
        email: emailResult,
        sms: smsResult,
        whatsapp: whatsappResult
      },
      status: status
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
