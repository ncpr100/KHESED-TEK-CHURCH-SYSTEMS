#!/usr/bin/env node

/**
 * Railway-Specific Environment Validation Script
 * 
 * This script provides Railway-optimized validation that's more tolerant
 * of temporary database unavailability during deployments
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

function validateRailwayEnvironment() {
  console.log('🚂 Railway Environment Validation\n')
  
  let hasErrors = false
  const warnings = []
  
  // Check Railway-specific environment
  const isRailway = process.env.RAILWAY_ENVIRONMENT || 
                   process.env.NEXTAUTH_URL?.includes('railway.app') ||
                   process.env.DATABASE_URL?.includes('railway.app')
  
  if (isRailway) {
    console.log('✅ Railway deployment environment detected')
    console.log(`   Railway Environment: ${process.env.RAILWAY_ENVIRONMENT || 'Unknown'}`)
    console.log(`   Railway Service: ${process.env.RAILWAY_SERVICE_NAME || 'Unknown'}`)
    console.log(`   Git Commit: ${process.env.RAILWAY_GIT_COMMIT_SHA?.substring(0, 8) || 'Unknown'}`)
  } else {
    console.log('ℹ️  Non-Railway environment detected')
  }
  
  // Essential environment variables
  const essentialVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'DATABASE_URL']
  
  essentialVars.forEach(varName => {
    if (!process.env[varName]) {
      hasErrors = true
      console.error(`❌ Missing critical variable: ${varName}`)
    } else {
      console.log(`✅ ${varName} configured`)
    }
  })
  
  // Railway-specific optimizations check
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL
    const hasOptimizations = dbUrl.includes('connection_limit=') && 
                            dbUrl.includes('pool_timeout=') && 
                            dbUrl.includes('connect_timeout=')
    
    if (!hasOptimizations && isRailway) {
      warnings.push('Database URL missing Railway optimization parameters')
      console.warn('⚠️  Database URL could be optimized for Railway')
      console.warn('   Consider adding: ?connection_limit=20&pool_timeout=60&connect_timeout=30')
    } else if (hasOptimizations) {
      console.log('✅ Database URL includes Railway optimizations')
    }
  }
  
  // NEXTAUTH_URL validation for Railway
  if (process.env.NEXTAUTH_URL) {
    if (process.env.NEXTAUTH_URL.includes('localhost') && isRailway) {
      warnings.push('NEXTAUTH_URL points to localhost in Railway')
      console.warn('⚠️  NEXTAUTH_URL should point to your Railway domain')
    } else if (isRailway && process.env.NEXTAUTH_URL.includes('railway.app')) {
      console.log('✅ NEXTAUTH_URL configured for Railway domain')
    }
  }
  
  // Security check
  if (process.env.NEXTAUTH_SECRET === 'your-nextauth-secret-here') {
    hasErrors = true
    console.error('❌ NEXTAUTH_SECRET is using default/example value')
  }
  
  // Summary
  console.log('\n📋 Railway Validation Summary:')
  
  if (hasErrors) {
    console.error(`❌ ${hasErrors ? '1 or more' : '0'} critical error(s) found`)
    console.error('\n🚨 Critical errors must be resolved before deployment')
    process.exit(1)
  }
  
  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} optimization recommendation(s):`)
    warnings.forEach((warning, i) => console.warn(`   ${i + 1}. ${warning}`))
    console.warn('\n💡 These are recommendations and won\'t prevent deployment')
  }
  
  console.log('✅ Railway environment validation passed!')
  console.log('🚀 Ready for Railway deployment\n')
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateRailwayEnvironment()
}

module.exports = { validateRailwayEnvironment }