#!/usr/bin/env node

/**
 * Railway Logging Test Script
 * 
 * This script demonstrates the new logging features for Railway deployment.
 * It simulates various scenarios to show improved log output.
 */

// Set up test environment
process.env.NODE_ENV = 'production'
process.env.RAILWAY_ENVIRONMENT = 'test'
process.env.RAILWAY_PROJECT_NAME = 'khesed-tek-church-systems'
process.env.RAILWAY_GIT_COMMIT_SHA = 'abc123def456'

// Import the logging modules
const path = require('path')
const { spawn } = require('child_process')

console.log('🚂 Railway Logging Enhancement Test')
console.log('====================================\n')

console.log('1. Testing Environment Validation Logging:')
console.log('-------------------------------------------')

// Test the enhanced environment validation
const envTest = spawn('node', ['scripts/validate-env.js'], {
  cwd: path.join(__dirname, '..'),
  env: {
    ...process.env,
    NEXTAUTH_SECRET: 'test-secret-that-is-long-enough-for-validation',
    NEXTAUTH_URL: 'https://test.railway.app',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/test'
  }
})

envTest.stdout.on('data', (data) => {
  console.log(data.toString())
})

envTest.stderr.on('data', (data) => {
  console.log(data.toString())
})

envTest.on('close', (code) => {
  console.log('\n2. Testing Railway Deployment Script Logging:')
  console.log('---------------------------------------------')
  
  // Test Railway deployment script with proper environment
  const deployTest = spawn('bash', ['scripts/railway-deploy.sh'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      RAILWAY_ENVIRONMENT: 'test',
      RAILWAY_PROJECT_NAME: 'khesed-tek-church-systems',
      NEXTAUTH_SECRET: 'test-secret-that-is-long-enough-for-validation',
      NEXTAUTH_URL: 'https://test.railway.app',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/test'
    }
  })

  deployTest.stdout.on('data', (data) => {
    console.log(data.toString())
  })

  deployTest.stderr.on('data', (data) => {
    console.log(data.toString())
  })

  deployTest.on('close', (deployCode) => {
    console.log('\n3. Testing Prisma Generation with Enhanced Logging:')
    console.log('--------------------------------------------------')
    
    const prismaTest = spawn('npx', ['prisma', 'generate'], {
      cwd: path.join(__dirname, '..')
    })

    prismaTest.stdout.on('data', (data) => {
      console.log(data.toString())
    })

    prismaTest.stderr.on('data', (data) => {
      console.log(data.toString())
    })

    prismaTest.on('close', (prismaCode) => {
      console.log('\n🎉 Railway Logging Enhancement Test Complete!')
      console.log('=============================================')
      console.log(`Environment validation exit code: ${code}`)
      console.log(`Deployment script exit code: ${deployCode}`)
      console.log(`Prisma generation exit code: ${prismaCode}`)
      console.log('\nNew logging features demonstrated:')
      console.log('- ✅ Railway-optimized log formatting')
      console.log('- 🚂 Service-specific prefixes')
      console.log('- 📊 JSON context for better parsing')
      console.log('- 🔍 Environment detection and validation')
      console.log('- 🎯 Enhanced error categorization')
      console.log('- 📈 Performance monitoring setup')
      console.log('\nFor production use, these logs will provide:')
      console.log('- Better Railway log filtering and searching')
      console.log('- Structured data for log analysis tools')
      console.log('- Clear service identification')
      console.log('- Detailed error context for debugging')
      console.log('- Performance metrics for monitoring')
      
      process.exit(0)
    })
  })
})

// Add timeout to prevent hanging
setTimeout(() => {
  console.log('\n⏰ Test timeout reached')
  process.exit(1)
}, 60000) // 60 seconds timeout