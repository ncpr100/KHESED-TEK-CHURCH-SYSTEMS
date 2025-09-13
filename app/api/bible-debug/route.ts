
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { reference, version } = await request.json()
    console.log(`🔍 DEBUG: Testing ${reference} in ${version}`)
    
    // Step 1: Test direct Bible API call
    const refString = `${reference}`
    const url = `https://bible-api.com/${encodeURIComponent(refString)}`
    
    console.log(`🔗 Testing URL: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'KhesedTek-Church-System/1.0'
      }
    })
    
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url: url
      })
    }
    
    const data = await response.json()
    console.log(`📖 Raw API data:`, data)
    
    return NextResponse.json({
      success: true,
      url: url,
      status: response.status,
      data: {
        text: data.text,
        book: data.book_name || data.book,
        chapter: data.chapter,
        verse: data.verse
      },
      raw: data
    })
    
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
