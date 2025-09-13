
import { NextResponse } from "next/server"
import { mailgunService } from "@/lib/integrations/mailgun"

export async function GET() {
  try {
    const result = await mailgunService.sendEmail({
      to: "test@example.com",
      subject: "Test Message",
      text: "This is a test message"
    })
    return NextResponse.json({ success: true, result })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
