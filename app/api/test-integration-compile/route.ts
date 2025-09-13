
import { NextResponse } from "next/server"
import { mailgunService } from "@/lib/integrations/mailgun"

export async function GET() {
  try {
    const status = mailgunService.getStatus()
    return NextResponse.json({ success: true, status })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
