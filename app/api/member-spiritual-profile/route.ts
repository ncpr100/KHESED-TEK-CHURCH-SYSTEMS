
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Spiritual Profile API Called ===')
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user ? `${session.user.email} (${session.user.role})` : 'NO SESSION')
    
    if (!session?.user) {
      console.log('❌ REJECTED: No session/user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
      console.log('❌ REJECTED: Insufficient role. User role:', session.user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('✅ AUTHORIZED: Proceeding with request')

    const requestBody = await request.json()
    console.log('📝 Request payload:', requestBody)
    
    const {
      memberId,
      primaryGifts,
      secondaryGifts,
      spiritualCalling,
      ministryPassions,
      experienceLevel,
      leadershipScore,
      servingMotivation,
      previousExperience,
      trainingCompleted
    } = requestBody

    if (!memberId) {
      console.log('❌ REJECTED: No memberId provided')
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Create or update spiritual profile
    console.log('🔄 PRE-UPSERT: About to create/update spiritual profile for member:', memberId)
    
    let profile;
    try {
      console.log('🔄 UPSERT START: Entering upsert operation...')
      profile = await prisma.memberSpiritualProfile.upsert({
      where: { memberId },
      update: {
        primaryGifts: primaryGifts || [],
        secondaryGifts: secondaryGifts || [],
        spiritualCalling,
        ministryPassions: ministryPassions || [],
        experienceLevel: experienceLevel || 1,
        leadershipScore: leadershipScore || 1,
        servingMotivation,
        previousExperience: previousExperience || [],
        trainingCompleted: trainingCompleted || [],
        assessmentDate: new Date(),
      },
      create: {
        memberId,
        primaryGifts: primaryGifts || [],
        secondaryGifts: secondaryGifts || [],
        spiritualCalling,
        ministryPassions: ministryPassions || [],
        experienceLevel: experienceLevel || 1,
        leadershipScore: leadershipScore || 1,
        servingMotivation,
        previousExperience: previousExperience || [],
        trainingCompleted: trainingCompleted || [],
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    console.log('🔄 UPSERT COMPLETE: Operation finished successfully')
    } catch (upsertError: any) {
      console.error('❌ UPSERT FAILED:', {
        memberId,
        error: upsertError?.message,
        code: upsertError?.code,
        meta: upsertError?.meta,
        stack: upsertError?.stack
      })
      throw upsertError; // Re-throw to be caught by outer try-catch
    }

    console.log('💾 UPSERT SUCCESS: Profile created/updated with ID:', profile.id)
    console.log('📋 UPSERT RESULT: Profile object:', JSON.stringify(profile, null, 2))
    console.log('🔄 CHECKPOINT 1: Starting Member table update process...')
    
    // CRITICAL: Add server logs to response for browser visibility
    const serverLogs = []
    serverLogs.push('SERVER LOG: Profile upsert successful')
    serverLogs.push('SERVER LOG: Starting Member table update...')

    // CRITICAL: Wrap entire member update in separate try-catch to isolate issues
    try {
      console.log('🔄 CHECKPOINT 2: Inside member update try block')
      serverLogs.push('SERVER LOG: Checkpoint 2 - Inside member update try block')
      console.log('🔄 CHECKPOINT 3: Member ID received:', memberId)
      serverLogs.push(`SERVER LOG: Checkpoint 3 - Member ID: ${memberId}`)
      console.log('🔄 CHECKPOINT 4: Primary gifts received:', primaryGifts)
      serverLogs.push(`SERVER LOG: Checkpoint 4 - Primary gifts: ${JSON.stringify(primaryGifts)}`)

      // First, verify the member exists
      console.log('🔄 CHECKPOINT 5: About to find member...')
      serverLogs.push('SERVER LOG: Checkpoint 5 - About to find member...')
      const existingMember = await prisma.member.findUnique({
        where: { id: memberId }
      })
      
      console.log('🔄 CHECKPOINT 6: Member query result:', existingMember ? 'FOUND' : 'NOT FOUND')
      serverLogs.push(`SERVER LOG: Checkpoint 6 - Member query result: ${existingMember ? 'FOUND' : 'NOT FOUND'}`)
      
      if (!existingMember) {
        console.error('❌ Member not found:', memberId)
        serverLogs.push(`SERVER LOG: ERROR - Member not found: ${memberId}`)
        // Don't return error, just log and continue - the spiritual profile was saved
        console.warn('⚠️  Continuing without member table update')
        serverLogs.push('SERVER LOG: WARNING - Continuing without member table update')
      } else {
        console.log('✅ CHECKPOINT 7: Member found:', `${existingMember.firstName} ${existingMember.lastName}`)
        serverLogs.push(`SERVER LOG: Checkpoint 7 - Member found: ${existingMember.firstName} ${existingMember.lastName}`)
        
        const memberUpdateData = {
          spiritualGifts: primaryGifts || [],
          secondaryGifts: secondaryGifts || [],
          spiritualCalling,
          ministryPassion: ministryPassions || [],
          experienceLevel: experienceLevel || 1,
          leadershipReadiness: leadershipScore || 1,
        }
        
        console.log('📝 CHECKPOINT 8: Member update data:', memberUpdateData)
        serverLogs.push(`SERVER LOG: Checkpoint 8 - Member update data prepared`)
        
        console.log('🔄 CHECKPOINT 9: About to update member...')
        serverLogs.push('SERVER LOG: Checkpoint 9 - About to update member table...')
        const updatedMember = await prisma.member.update({
          where: { id: memberId },
          data: memberUpdateData
        })
        
        console.log('✅ CHECKPOINT 10: Member updated successfully:', {
          id: updatedMember.id,
          name: `${updatedMember.firstName} ${updatedMember.lastName}`,
          hasSpiritual: updatedMember.spiritualGifts ? (updatedMember.spiritualGifts as any[]).length : 0,
          spiritualGifts: updatedMember.spiritualGifts,
          secondaryGifts: updatedMember.secondaryGifts
        })
        serverLogs.push(`SERVER LOG: SUCCESS - Member table updated! Spiritual gifts count: ${updatedMember.spiritualGifts ? (updatedMember.spiritualGifts as any[]).length : 0}`)
      }
    } catch (memberUpdateError: any) {
      console.error('❌ MEMBER UPDATE EXCEPTION at checkpoint:', {
        memberId,
        error: memberUpdateError?.message,
        code: memberUpdateError?.code,
        meta: memberUpdateError?.meta,
        stack: memberUpdateError?.stack
      })
      serverLogs.push(`SERVER LOG: EXCEPTION - Member update failed: ${memberUpdateError?.message}`)
      
      // Don't fail the entire operation, but log the issue
      console.warn('⚠️ Spiritual profile was saved but member table update failed')
      serverLogs.push('SERVER LOG: WARNING - Spiritual profile was saved but member table update failed')
    }

    console.log('🔄 CHECKPOINT 11: About to trigger metrics update...')
    
    // Trigger metrics/cache update - this ensures smart lists reflect changes
    try {
      // Update any cached metrics that depend on member spiritual profiles
      // For now, we'll just ensure the response includes a trigger for client-side cache refresh
      console.log(`🔄 CHECKPOINT 12: Spiritual profile updated for member ${memberId}, metrics may need refresh`)
    } catch (error) {
      console.warn('Metrics update failed:', error)
      // Don't fail the main operation if metrics update fails
    }

    const response = {
      success: true,
      profile,
      message: 'Perfil espiritual actualizado exitosamente',
      refreshMetrics: true, // Flag to trigger client-side cache refresh
      serverLogs: serverLogs // Include server logs for browser visibility
    }

    console.log('🔄 CHECKPOINT 13: About to return success response...')
    console.log('📤 Final API response:', response)
    console.log('✅ SUCCESS: Spiritual profile saved successfully')
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ MAJOR ERROR in spiritual profile API:', error)
    console.error('❌ Error stack:', error?.stack)
    console.error('❌ Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code
    })
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    const profile = await prisma.memberSpiritualProfile.findUnique({
      where: { memberId },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            ministryId: true,
            ministry: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching spiritual profile:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
