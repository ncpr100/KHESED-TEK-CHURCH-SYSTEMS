
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing external fetch from server...')
    
    // Test 1: Bible API direct call
    const bibleResponse = await fetch('https://bible-api.com/James%203:5?translation=kjv')
    const bibleData = await bibleResponse.json()
    
    // Test 2: Simple HTTP call
    const httpResponse = await fetch('https://httpbin.org/get')
    const httpData = await httpResponse.json()
    
    return NextResponse.json({
      success: true,
      bibleApi: {
        status: bibleResponse.status,
        text: bibleData.text || 'No text found'
      },
      httpTest: {
        status: httpResponse.status,
        origin: httpData.origin || 'No origin'
      }
    })
    
  } catch (error) {
    console.error('Test fetch error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
