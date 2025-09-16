/**
 * Railway-specific logging utilities
 * 
 * This module provides specialized logging functions for Railway deployment
 * monitoring and debugging.
 */

import { logger } from './logger'

interface RailwayMetrics {
  memory?: {
    used: number
    total: number
    percentage: number
  }
  uptime?: number
  environment?: string
  buildVersion?: string
}

class RailwayMonitor {
  private startTime = Date.now()
  
  /**
   * Log Railway deployment start
   */
  deploymentStart(): void {
    const environment = process.env.RAILWAY_ENVIRONMENT || 'unknown'
    const projectName = process.env.RAILWAY_PROJECT_NAME || 'unknown'
    
    logger.success('Railway deployment started', {
      service: 'railway-deployment',
      environment,
      projectName,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log Railway deployment success
   */
  deploymentSuccess(port?: number): void {
    const environment = process.env.RAILWAY_ENVIRONMENT || 'unknown'
    const uptime = Date.now() - this.startTime
    
    logger.success('Railway deployment completed successfully', {
      service: 'railway-deployment',
      environment,
      port,
      startupTime: `${uptime}ms`,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log Railway deployment failure
   */
  deploymentFailure(error: Error | unknown): void {
    logger.railwayError('railway-deployment', 'Railway deployment failed', error, {
      environment: process.env.RAILWAY_ENVIRONMENT,
      projectName: process.env.RAILWAY_PROJECT_NAME,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Log system metrics for Railway monitoring
   */
  logMetrics(): void {
    if (process.env.NODE_ENV !== 'production') return

    const memUsage = process.memoryUsage()
    const metrics: RailwayMetrics = {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
      },
      uptime: Math.round(process.uptime()),
      environment: process.env.RAILWAY_ENVIRONMENT,
      buildVersion: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7)
    }

    logger.info('System metrics', {
      service: 'railway-metrics',
      ...metrics
    })
  }

  /**
   * Log Railway-specific connection test results
   */
  connectionTest(service: string, success: boolean, details?: any): void {
    const message = `${service} connection ${success ? 'successful' : 'failed'}`
    
    if (success) {
      logger.success(message, {
        service: 'railway-connection-test',
        target: service,
        ...details
      })
    } else {
      logger.error(message, undefined, {
        service: 'railway-connection-test',
        target: service,
        ...details
      })
    }
  }

  /**
   * Start periodic metrics logging (useful for Railway monitoring)
   */
  startMetricsLogging(intervalMs: number = 300000): void { // 5 minutes default
    if (process.env.NODE_ENV !== 'production') return
    
    logger.info('Starting Railway metrics logging', {
      service: 'railway-metrics',
      interval: `${intervalMs / 1000}s`
    })

    setInterval(() => {
      this.logMetrics()
    }, intervalMs)
  }

  /**
   * Log Railway build information
   */
  logBuildInfo(): void {
    const buildInfo = {
      commitSha: process.env.RAILWAY_GIT_COMMIT_SHA,
      commitMessage: process.env.RAILWAY_GIT_COMMIT_MESSAGE,
      branch: process.env.RAILWAY_GIT_BRANCH,
      author: process.env.RAILWAY_GIT_AUTHOR,
      buildDate: process.env.RAILWAY_GIT_COMMIT_DATE,
      environment: process.env.RAILWAY_ENVIRONMENT,
      projectName: process.env.RAILWAY_PROJECT_NAME
    }

    logger.info('Railway build information', {
      service: 'railway-build-info',
      ...buildInfo
    })
  }

  /**
   * Log HTTP request metrics optimized for Railway
   */
  logHttpRequest(req: any, res: any, duration: number): void {
    const statusCode = res?.statusCode || 0
    const method = req?.method || 'UNKNOWN'
    const url = req?.url || '/'
    const userAgent = req?.headers?.['user-agent'] || 'unknown'
    
    logger.apiRequest(method, url, statusCode, duration, {
      userAgent: userAgent.slice(0, 100), // Truncate to avoid too long logs
      ip: req?.ip || req?.connection?.remoteAddress || 'unknown',
      referrer: req?.headers?.referer || 'direct'
    })
  }

  /**
   * Log database performance metrics
   */
  logDatabaseMetrics(operation: string, duration: number, recordCount?: number): void {
    logger.dbOperation(operation, undefined, duration, {
      recordCount,
      performance: duration > 1000 ? 'slow' : duration > 500 ? 'medium' : 'fast'
    })
  }
}

// Export singleton instance
export const railwayMonitor = new RailwayMonitor()

// Helper function to log unhandled errors
export function setupRailwayErrorHandling(): void {
  process.on('uncaughtException', (error) => {
    logger.railwayError('railway-system', 'Uncaught exception', error)
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    logger.railwayError('railway-system', 'Unhandled promise rejection', reason, {
      promise: promise.toString()
    })
  })

  // Log process signals
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, graceful shutdown', {
      service: 'railway-system'
    })
  })

  process.on('SIGINT', () => {
    logger.info('Received SIGINT, graceful shutdown', {
      service: 'railway-system'
    })
  })
}

export default railwayMonitor