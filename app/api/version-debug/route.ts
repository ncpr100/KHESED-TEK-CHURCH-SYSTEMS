
import { NextRequest, NextResponse } from 'next/server'
import { getBibleVersionById } from '@/lib/bible-config'

export async function POST(request: NextRequest) {
  try {
    const { version } = await request.json()
    
    const versionInfo = getBibleVersionById(version)
    
    return NextResponse.json({
      version: version,
      versionInfo: versionInfo,
      language: versionInfo?.language,
      isSpanish: versionInfo?.language === 'es',
      isEnglish: versionInfo?.language === 'en'
    })
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
