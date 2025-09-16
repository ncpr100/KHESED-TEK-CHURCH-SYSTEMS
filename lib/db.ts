
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Railway-optimized Prisma client configuration
const createPrismaClient = () => {
  // Railway-specific database URL optimization
  const databaseUrl = process.env.DATABASE_URL
  
  // Add connection pooling parameters for Railway if not present
  const optimizedUrl = databaseUrl && !databaseUrl.includes('connection_limit') 
    ? `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}connection_limit=20&pool_timeout=60&connect_timeout=30`
    : databaseUrl

  console.log('[Prisma] Initializing client with Railway-optimized configuration')
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] 
      : ['warn', 'error'],
    datasources: {
      db: {
        url: optimizedUrl
      }
    }
  })

  // Enhanced connection error handling with retry logic
  const connectWithRetry = async (maxRetries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Prisma] Connection attempt ${attempt}/${maxRetries}`)
        await client.$connect()
        console.log('[Prisma] Database connection established successfully')
        
        // Test the connection with a simple query
        await client.$queryRaw`SELECT 1`
        console.log('[Prisma] Database health check passed')
        
        return
      } catch (error: any) {
        console.error(`[Prisma] Connection attempt ${attempt} failed:`, {
          name: error.name,
          code: error.code,
          message: error.message
        })
        
        if (attempt === maxRetries) {
          console.error('[Prisma] All connection attempts failed. Database may be unavailable.')
          // Don't throw in production to allow graceful degradation
          if (process.env.NODE_ENV === 'production') {
            console.error('[Prisma] Production mode: Continuing with potential database issues')
          } else {
            throw error
          }
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay * attempt))
        }
      }
    }
  }

  // Attempt initial connection
  connectWithRetry().catch((error) => {
    console.error('[Prisma] Initial database connection failed:', error)
  })

  // Add connection pool health monitoring with proper typing
  const originalQueryRaw = client.$queryRaw
  const enhancedQueryRaw = async function<T = unknown>(
    query: TemplateStringsArray | any,
    ...values: any[]
  ): Promise<T> {
    try {
      if (typeof query === 'string' || Array.isArray(query)) {
        return await originalQueryRaw.call(client, query, ...values) as T
      } else {
        return await originalQueryRaw.call(client, query) as T
      }
    } catch (error: any) {
      // Log connection pool issues specifically
      if (error.code === 'P2024' || error.message?.includes('connection pool')) {
        console.error('[Prisma] Connection pool error detected:', {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString()
        })
        
        // Attempt to reconnect on pool exhaustion
        if (error.code === 'P2024') {
          console.log('[Prisma] Attempting to recover from pool exhaustion...')
          try {
            await client.$disconnect()
            await client.$connect()
            console.log('[Prisma] Pool recovery successful')
          } catch (reconnectError) {
            console.error('[Prisma] Pool recovery failed:', reconnectError)
          }
        }
      }
      throw error
    }
  }
  
  client.$queryRaw = enhancedQueryRaw as typeof client.$queryRaw

  return client
}

// Database health check function
export const checkDatabaseHealth = async () => {
  try {
    await db.$queryRaw`SELECT 1`
    return { healthy: true, message: 'Database connection is healthy' }
  } catch (error: any) {
    console.error('[Prisma] Database health check failed:', error)
    return { 
      healthy: false, 
      message: `Database connection failed: ${error.message}`,
      code: error.code 
    }
  }
}

// Connection pool status
export const getConnectionPoolStatus = async () => {
  try {
    // This will help monitor connection pool usage
    const result = await db.$queryRaw`
      SELECT 
        numbackends as active_connections,
        setting as max_connections
      FROM pg_stat_database 
      CROSS JOIN pg_settings 
      WHERE datname = current_database() 
        AND name = 'max_connections'
      LIMIT 1
    ` as any[]
    
    return {
      active: result[0]?.active_connections || 0,
      max: result[0]?.max_connections || 'unknown'
    }
  } catch (error) {
    console.warn('[Prisma] Could not retrieve connection pool status:', error)
    return { active: 'unknown', max: 'unknown' }
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
