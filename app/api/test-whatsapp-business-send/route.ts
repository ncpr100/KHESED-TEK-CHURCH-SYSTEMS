
import { NextResponse } from "next/server"
import { whatsappBusinessService } from "@/lib/integrations/whatsapp"

export async function GET() {
  try {
    const textResult = await whatsappBusinessService.sendTextMessage("+1234567890", "Test WhatsApp Business message")
    
    const templateResult = await whatsappBusinessService.sendTemplate(
      "+1234567890",
      "hello_world",
      "es"
    )
    
    return NextResponse.json({ 
      success: true, 
      results: {
        textMessage: textResult,
        templateMessage: templateResult
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
