
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const spiritualGifts = await prisma.spiritualGift.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    // Group by category for easier UI consumption
    const giftsByCategory = spiritualGifts.reduce((acc, gift) => {
      if (!acc[gift.category]) {
        acc[gift.category] = []
      }
      acc[gift.category].push(gift)
      return acc
    }, {} as Record<string, typeof spiritualGifts>)

    return NextResponse.json({
      gifts: spiritualGifts,
      categories: giftsByCategory
    })
  } catch (error) {
    console.error('Error fetching spiritual gifts:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
