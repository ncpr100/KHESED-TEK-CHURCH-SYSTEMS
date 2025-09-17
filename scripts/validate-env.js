#!/usr/bin/env node

/**
 * Environment Validation Script
 * 
 * This script validates that all required environment variables are set
 * before starting the application. It provides helpful error messages
 * and setup instructions for missing configuration.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

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
    description: 'PostgreSQL database connection string with Railway optimization',
    example: 'postgresql://username:password@localhost:5432/database_name?connection_limit=20&pool_timeout=60',
    validation: (value) => {
      if (!value || !value.startsWith('postgresql://')) {
        return false
      }
      
      // Check for Railway optimization parameters
      const hasConnectionLimit = value.includes('connection_limit=')
      const hasPoolTimeout = value.includes('pool_timeout=')
      
      if (!hasConnectionLimit || !hasPoolTimeout) {
        console.warn('⚠️  DATABASE_URL missing Railway optimization parameters')
        console.warn('   Consider adding: ?connection_limit=20&pool_timeout=60&connect_timeout=30')
      }
      
      return true
    }
  }
}

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n')
  
  let hasErrors = false
  const errors = []
  const warnings = []

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, config]) => {
    const value = process.env[key]
    
    if (!value) {
      hasErrors = true
      errors.push(`❌ ${key} is missing`)
      console.error(`❌ Missing required environment variable: ${key}`)
      console.error(`   Description: ${config.description}`)
      console.error(`   Example: ${config.example}\n`)
    } else if (config.validation && !config.validation(value)) {
      hasErrors = true
      errors.push(`❌ ${key} is invalid`)
      console.error(`❌ Invalid environment variable: ${key}`)
      console.error(`   Description: ${config.description}`)
      console.error(`   Example: ${config.example}\n`)
    } else {
      console.log(`✅ ${key} is configured`)
    }
  })

  // Check for common issues
  if (process.env.NEXTAUTH_SECRET === 'your-nextauth-secret-here') {
    warnings.push('⚠️  NEXTAUTH_SECRET is using example value')
    console.warn('⚠️  NEXTAUTH_SECRET appears to be using the example value')
    console.warn('   Generate a secure secret with: openssl rand -base64 32\n')
  }

  // Railway-specific validation: Allow Railway domains and internal URLs
  const isRailwayDomain = process.env.NEXTAUTH_URL?.includes('railway.app') || 
                         process.env.NEXTAUTH_URL?.includes('railway.internal')
  
  if (process.env.NEXTAUTH_URL?.includes('localhost') && 
      process.env.NODE_ENV === 'production' && 
      !isRailwayDomain) {
    warnings.push('⚠️  NEXTAUTH_URL points to localhost in production')
    console.warn('⚠️  NEXTAUTH_URL is set to localhost in production environment')
    console.warn('   Update to your production domain\n')
  }

  // Railway-specific validation: Allow Railway database URLs
  const isRailwayDatabase = process.env.DATABASE_URL?.includes('railway.app') || 
                           process.env.DATABASE_URL?.includes('railway.internal')
  
  if (process.env.DATABASE_URL?.includes('localhost') && 
      process.env.NODE_ENV === 'production' && 
      !isRailwayDatabase) {
    warnings.push('⚠️  DATABASE_URL points to localhost in production')
    console.warn('⚠️  DATABASE_URL points to localhost in production environment')
    console.warn('   Update to your production database\n')
  }

  // Railway-specific checks
  if (process.env.RAILWAY_ENVIRONMENT) {
    console.log('🚂 Railway deployment detected')
    console.log(`   Environment: ${process.env.RAILWAY_ENVIRONMENT}`)
    
    // Check for Railway-specific optimizations
    if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('connection_limit')) {
      warnings.push('⚠️  DATABASE_URL missing Railway connection pool optimization')
      console.warn('⚠️  Consider adding connection pool parameters for Railway:')
      console.warn('   ?connection_limit=20&pool_timeout=60&connect_timeout=30\n')
    }
  }

  // Summary
  console.log('📋 Validation Summary:')
  if (hasErrors) {
    console.error(`❌ ${errors.length} error(s) found`)
    errors.forEach(error => console.error(`   ${error}`))
  } else {
    console.log('✅ All required environment variables are configured')
  }

  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} warning(s):`)
    warnings.forEach(warning => console.warn(`   ${warning}`))
  }

  if (hasErrors) {
    console.error('\n🚨 Cannot start application with missing configuration')
    console.error('\n📚 Quick setup guide:')
    console.error('1. Copy .env.example to .env.local (development) or set in deployment platform')
    console.error('2. Generate NEXTAUTH_SECRET: openssl rand -base64 32')
    console.error('3. Set NEXTAUTH_URL to your domain')
    console.error('4. Configure DATABASE_URL with your PostgreSQL connection')
    console.error('5. Restart the application')
    console.error('\nFor detailed instructions, see: DEPLOYMENT.md')
    
    process.exit(1)
  }

  console.log('\n🚀 Environment validation passed! Starting application...\n')
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateEnvironment()
}

module.exports = { validateEnvironment }