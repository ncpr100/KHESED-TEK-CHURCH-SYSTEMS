
/**
 * Bible API Health Check Endpoint
 * Returns status of Bible API services
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Test external Bible API connectivity
    const testResponse = await fetch('https://bible-api.com/john%203:16', {
      method: 'GET',
      headers: {
        'User-Agent': 'KhesedTek-Church-System'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    let status = 'unknown'
    
    if (testResponse.ok) {
      const data = await testResponse.json()
      if (data.text) {
        status = 'healthy'
      } else {
        status = 'degraded'
      }
    } else {
      status = 'degraded'
    }

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        'bible-api.com': testResponse.ok ? 'online' : 'offline'
      }
    })
  } catch (error) {
    console.error('Bible API health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Failed to connect to external Bible APIs'
    })
  }
}
