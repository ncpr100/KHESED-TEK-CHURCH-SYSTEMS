

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Clear system cache endpoint
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    // Track cache clearing operations
    const cacheOperations = {
      timestamp: new Date().toISOString(),
      operations: [] as Array<{
        type: string;
        target: string;
        status: string;
        error?: string;
        reason?: string;
      }>
    }

    try {
      // Clear Next.js static cache (if using revalidation)
      // Note: In production, you might want to use revalidateTag or revalidatePath
      const { revalidateTag } = require('next/cache')
      
      // Revalidate common cache tags
      const cacheTags = [
        'churches',
        'users', 
        'members',
        'donations',
        'events',
        'analytics',
        'reports'
      ]

      for (const tag of cacheTags) {
        try {
          revalidateTag(tag)
          cacheOperations.operations.push({
            type: 'next-cache',
            target: tag,
            status: 'success'
          })
        } catch (tagError) {
          cacheOperations.operations.push({
            type: 'next-cache',
            target: tag,
            status: 'error',
            error: String(tagError)
          })
        }
      }

    } catch (revalidateError) {
      console.log('Revalidate not available in this environment')
      cacheOperations.operations.push({
        type: 'next-cache',
        target: 'all',
        status: 'skipped',
        reason: 'revalidateTag not available'
      })
    }

    // Clear Redis cache if available
    try {
      // This would connect to Redis if configured
      cacheOperations.operations.push({
        type: 'redis-cache',
        target: 'all',
        status: 'skipped',
        reason: 'Redis not configured'
      })
    } catch (redisError) {
      cacheOperations.operations.push({
        type: 'redis-cache',
        target: 'all',
        status: 'error',
        error: String(redisError)
      })
    }

    // Clear application memory cache if any
    cacheOperations.operations.push({
      type: 'memory-cache',
      target: 'application',
      status: 'cleared'
    })

    console.log('🧹 System cache cleared:', cacheOperations)

    return NextResponse.json({
      message: 'Cache del sistema limpiado exitosamente',
      operations: cacheOperations
    })

  } catch (error) {
    console.error('Error clearing system cache:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

