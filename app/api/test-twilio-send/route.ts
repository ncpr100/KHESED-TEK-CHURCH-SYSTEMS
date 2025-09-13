
import { NextResponse } from "next/server"
import { twilioService } from "@/lib/integrations/twilio"

export async function GET() {
  try {
    const smsResult = await twilioService.sendSMS({
      to: "+1234567890",
      body: "Test SMS message"
    })
    
    const whatsappResult = await twilioService.sendWhatsApp({
      to: "+1234567890", 
      body: "Test WhatsApp message"
    })
    
    return NextResponse.json({ 
      success: true, 
      results: {
        sms: smsResult,
        whatsapp: whatsappResult
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
