

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Regenerate system keys endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    // Generate new system keys
    const timestamp = new Date().toISOString()
    const keyOperations = {
      timestamp,
      keys_regenerated: [] as Array<{
        name: string;
        length: number;
        status: string;
      }>
    }

    // Generate new NextAuth secret (32 bytes)
    const newNextAuthSecret = crypto.randomBytes(32).toString('hex')
    keyOperations.keys_regenerated.push({
      name: 'NEXTAUTH_SECRET',
      length: 64,
      status: 'generated'
    })

    // Generate new API key (24 bytes)
    const newApiKey = crypto.randomBytes(24).toString('hex')
    keyOperations.keys_regenerated.push({
      name: 'API_KEY',
      length: 48,
      status: 'generated'
    })

    // Generate new webhook secret (16 bytes)  
    const newWebhookSecret = crypto.randomBytes(16).toString('hex')
    keyOperations.keys_regenerated.push({
      name: 'WEBHOOK_SECRET',
      length: 32,
      status: 'generated'
    })

    // Generate new encryption key (32 bytes)
    const newEncryptionKey = crypto.randomBytes(32).toString('hex')
    keyOperations.keys_regenerated.push({
      name: 'ENCRYPTION_KEY',
      length: 64,
      status: 'generated'
    })

    // Generate new JWT signing key (32 bytes)
    const newJwtSecret = crypto.randomBytes(32).toString('hex')  
    keyOperations.keys_regenerated.push({
      name: 'JWT_SECRET',
      length: 64,
      status: 'generated'
    })

    console.log('🔐 System keys regenerated:', {
      timestamp,
      keys_count: keyOperations.keys_regenerated.length
    })

    // In production, you would:
    // 1. Update environment variables in your deployment platform
    // 2. Restart the application to load new keys
    // 3. Invalidate existing sessions/tokens
    // 4. Notify administrators
    
    const response = {
      message: 'Claves del sistema regeneradas exitosamente',
      operations: keyOperations,
      warning: 'Las nuevas claves requieren reinicio de la aplicación para tomar efecto',
      next_steps: [
        'Actualizar variables de entorno en el servidor',
        'Reiniciar la aplicación',
        'Verificar que todos los servicios funcionen correctamente',
        'Los usuarios deberán iniciar sesión nuevamente'
      ],
      // Only show keys in development
      ...(process.env.NODE_ENV === 'development' && {
        new_keys: {
          NEXTAUTH_SECRET: newNextAuthSecret,
          API_KEY: newApiKey,
          WEBHOOK_SECRET: newWebhookSecret, 
          ENCRYPTION_KEY: newEncryptionKey,
          JWT_SECRET: newJwtSecret
        }
      })
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error regenerating system keys:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

