#!/usr/bin/env node

/**
 * Environment Validation Script with Railway-optimized logging
 * 
 * This script validates that all required environment variables are set
 * before starting the application. It provides helpful error messages
 * and setup instructions for missing configuration.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

// Simple logger for Node.js script (before the main app logger is available)
const logger = {
  info: (msg, ctx = {}) => console.log(`🔍 [INFO] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  success: (msg, ctx = {}) => console.log(`✅ [SUCCESS] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  warn: (msg, ctx = {}) => console.warn(`⚠️  [WARN] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  error: (msg, ctx = {}) => console.error(`❌ [ERROR] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : ''),
  railway: (service, msg, ctx = {}) => console.log(`🚂 [${service.toUpperCase()}] ${msg}`, Object.keys(ctx).length ? JSON.stringify(ctx) : '')
}

const requiredEnvVars = {
  NEXTAUTH_SECRET: {
    description: 'Secret key for NextAuth.js JWT encryption',
    example: 'Generate with: openssl rand -base64 32',
    validation: (value) => value && value.length >= 32
  },
  NEXTAUTH_URL: {
    description: 'Base URL of your application',
    example: 'https://your-domain.com or http://localhost:3000',
    validation: (value) => value && (value.startsWith('http://') || value.startsWith('https://'))
  },
  DATABASE_URL: {
    description: 'PostgreSQL database connection string',
    example: 'postgresql://username:password@localhost:5432/database_name',
    validation: (value) => value && value.startsWith('postgresql://')
  }
}

function validateEnvironment() {
  logger.railway('env-validation', 'Starting environment configuration validation')
  
  let hasErrors = false
  const errors = []
  const warnings = []

  // Railway environment detection
  const isRailway = process.env.RAILWAY_ENVIRONMENT !== undefined
  const environment = process.env.NODE_ENV || 'development'
  
  logger.info(`Environment: ${environment}${isRailway ? ' (Railway)' : ''}`, {
    railway: isRailway,
    environment,
    railwayEnv: process.env.RAILWAY_ENVIRONMENT || 'not-set'
  })

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const value = process.env[key]
    
    if (!value) {
      hasErrors = true
      errors.push(`❌ ${key} is missing`)
      logger.error(`Missing required environment variable: ${key}`, {
        variable: key,
        description: config.description,
        example: config.example
      })
    } else if (config.validation && !config.validation(value)) {
      hasErrors = true
      errors.push(`❌ ${key} is invalid`)
      logger.error(`Invalid environment variable: ${key}`, {
        variable: key,
        description: config.description,
        example: config.example
      })
    } else {
      logger.success(`${key} is configured`, {
        variable: key,
        hasValue: true
      })
    }
  })

  // Check for common issues
  if (process.env.NEXTAUTH_SECRET === 'your-nextauth-secret-here') {
    warnings.push('⚠️  NEXTAUTH_SECRET is using example value')
    logger.warn('NEXTAUTH_SECRET appears to be using the example value', {
      variable: 'NEXTAUTH_SECRET',
      issue: 'example-value'
    })
  }

  if (process.env.NEXTAUTH_URL?.includes('localhost') && environment === 'production') {
    warnings.push('⚠️  NEXTAUTH_URL points to localhost in production')
    logger.warn('NEXTAUTH_URL is set to localhost in production environment', {
      variable: 'NEXTAUTH_URL',
      issue: 'localhost-in-production',
      environment
    })
  }

  if (process.env.DATABASE_URL?.includes('localhost') && environment === 'production') {
    warnings.push('⚠️  DATABASE_URL points to localhost in production')
    logger.warn('DATABASE_URL points to localhost in production environment', {
      variable: 'DATABASE_URL',
      issue: 'localhost-in-production',
      environment
    })
  }

  // Railway-specific checks
  if (isRailway) {
    logger.railway('env-validation', 'Running Railway-specific validation checks')
    
    // Check for Railway-provided variables
    const railwayVars = [
      'RAILWAY_ENVIRONMENT',
      'RAILWAY_ENVIRONMENT_NAME',
      'RAILWAY_PROJECT_NAME'
    ]
    
    railwayVars.forEach(varName => {
      if (process.env[varName]) {
        logger.info(`Railway variable ${varName} detected`, {
          variable: varName,
          value: process.env[varName]
        })
      }
    })
  }

  // Summary
  logger.railway('env-validation', 'Validation Summary')
  if (hasErrors) {
    logger.error(`${errors.length} error(s) found`, {
      errorCount: errors.length,
      errors: errors
    })
  } else {
    logger.success('All required environment variables are configured', {
      validationPassed: true
    })
  }

  if (warnings.length > 0) {
    logger.warn(`${warnings.length} warning(s)`, {
      warningCount: warnings.length,
      warnings: warnings
    })
  }

  if (hasErrors) {
    logger.error('Cannot start application with missing configuration', {
      canStart: false,
      hasErrors: true
    })
    
    logger.error('📚 Quick setup guide:')
    logger.error('1. Copy .env.example to .env.local (development) or set in deployment platform')
    logger.error('2. Generate NEXTAUTH_SECRET: openssl rand -base64 32')
    logger.error('3. Set NEXTAUTH_URL to your domain')
    logger.error('4. Configure DATABASE_URL with your PostgreSQL connection')
    logger.error('5. Restart the application')
    logger.error('')
    logger.error('For detailed instructions, see: DEPLOYMENT.md')
    
    process.exit(1)
  }

  logger.railway('env-validation', 'Environment validation passed! Application can start', {
    validationPassed: true,
    environment,
    railway: isRailway
  })
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateEnvironment()
}

module.exports = { validateEnvironment }