
import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Production-optimized Prisma client configuration
const createPrismaClient = () => {
  logger.railwayInfo('database', 'Initializing Prisma client')
  
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  // Setup custom logging for Railway
  client.$on('query', (e) => {
    logger.dbOperation('query', undefined, e.duration, {
      query: e.query.substring(0, 100) + (e.query.length > 100 ? '...' : ''),
      params: e.params
    })
  })

  client.$on('error', (e) => {
    logger.railwayError('database', 'Prisma error occurred', e, {
      target: e.target
    })
  })

  client.$on('info', (e) => {
    logger.railwayInfo('database', e.message, {
      target: e.target
    })
  })

  client.$on('warn', (e) => {
    logger.warn(e.message, {
      service: 'database',
      target: e.target
    })
  })

  // Handle connection errors gracefully with better logging
  client.$connect().then(() => {
    logger.success('Database connection established successfully')
  }).catch((error) => {
    logger.railwayError('database', 'Database connection failed', error, {
      databaseUrl: process.env.DATABASE_URL ? 'configured' : 'missing'
    })
  })

  return client
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
