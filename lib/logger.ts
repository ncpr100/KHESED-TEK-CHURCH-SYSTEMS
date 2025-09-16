/**
 * Railway-optimized Logger
 * 
 * Provides structured logging with proper formatting for Railway logs
 * and better error tracking for production deployments.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

interface LogContext {
  service?: string
  userId?: string
  requestId?: string
  timestamp?: string
  [key: string]: any
}

class RailwayLogger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    
    // Railway-optimized format with clear prefixes
    const prefix = this.getPrefix(level)
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    
    if (this.isRailway) {
      // Railway prefers structured logs
      return `[${timestamp}] ${prefix} ${message}${contextStr}`
    } else if (this.isDevelopment) {
      // Development format with colors (if supported)
      return `${prefix} ${message}${contextStr}`
    } else {
      // Production format
      return `[${timestamp}] ${prefix} ${message}${contextStr}`
    }
  }

  private getPrefix(level: LogLevel): string {
    const prefixes = {
      info: '🔍 [INFO]',
      warn: '⚠️  [WARN]',
      error: '❌ [ERROR]',
      debug: '🐛 [DEBUG]',
      success: '✅ [SUCCESS]'
    }
    return prefixes[level]
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = error instanceof Error ? {
      ...context,
      error: error.message,
      stack: error.stack
    } : { ...context, error: String(error) }
    
    console.error(this.formatMessage('error', message, errorContext))
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment || process.env.LOG_LEVEL === 'debug') {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  success(message: string, context?: LogContext): void {
    console.log(this.formatMessage('success', message, context))
  }

  // Railway-specific logging methods
  railwayInfo(service: string, message: string, context?: LogContext): void {
    this.info(message, { service, ...context })
  }

  railwayError(service: string, message: string, error?: Error | unknown, context?: LogContext): void {
    this.error(message, error, { service, ...context })
  }

  // Database operation logging
  dbOperation(operation: string, table?: string, duration?: number, context?: LogContext): void {
    this.debug(`Database ${operation}${table ? ` on ${table}` : ''}${duration ? ` (${duration}ms)` : ''}`, {
      service: 'database',
      operation,
      table,
      duration,
      ...context
    })
  }

  // Authentication logging
  authOperation(operation: string, email?: string, success: boolean = true, context?: LogContext): void {
    const level = success ? 'info' : 'warn'
    const message = `Auth ${operation}${email ? ` for ${email}` : ''} - ${success ? 'Success' : 'Failed'}`
    
    if (level === 'info') {
      this.info(message, { service: 'auth', operation, email, success, ...context })
    } else {
      this.warn(message, { service: 'auth', operation, email, success, ...context })
    }
  }

  // API request logging
  apiRequest(method: string, path: string, statusCode: number, duration?: number, context?: LogContext): void {
    const message = `${method} ${path} - ${statusCode}${duration ? ` (${duration}ms)` : ''}`
    const level = statusCode >= 400 ? 'warn' : 'info'
    
    if (level === 'info') {
      this.info(message, { service: 'api', method, path, statusCode, duration, ...context })
    } else {
      this.warn(message, { service: 'api', method, path, statusCode, duration, ...context })
    }
  }

  // Startup logging
  startup(service: string, port?: number, env?: string): void {
    const message = `${service} started${port ? ` on port ${port}` : ''}${env ? ` (${env})` : ''}`
    this.success(message, { service: 'startup', port, environment: env })
  }

  // Environment validation logging
  envValidation(variable: string, status: 'valid' | 'missing' | 'invalid', value?: string): void {
    const message = `Environment variable ${variable}: ${status.toUpperCase()}`
    const level = status === 'valid' ? 'success' : status === 'missing' ? 'error' : 'warn'
    
    const context = { 
      service: 'env-validation', 
      variable, 
      status,
      hasValue: !!value
    }
    
    switch (level) {
      case 'success':
        this.success(message, context)
        break
      case 'error':
        this.error(message, undefined, context)
        break
      case 'warn':
        this.warn(message, context)
        break
    }
  }
}

// Export singleton instance
export const logger = new RailwayLogger()

// Backward compatibility exports
export const log = logger
export default logger