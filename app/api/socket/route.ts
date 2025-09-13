
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // This endpoint is for Server-Sent Events compatibility check
  return new Response('Real-time server is running (SSE)', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

export async function POST(request: NextRequest) {
  // This endpoint is for Server-Sent Events compatibility check
  return new Response('Real-time server is running (SSE)', { 
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// Note: Real-time functionality now uses Server-Sent Events (SSE)
// available at /api/realtime/events
