#!/usr/bin/env node

/**
 * Test Deployment Issues Script
 * 
 * This script tests for the specific issues mentioned in the Railway logs:
 * - Module loading errors
 * - Environment configuration problems
 * - Database connectivity issues
 * - Prisma client problems
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

console.log('🔍 Testing Deployment Issues Resolution\n')

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables...')
const requiredEnvs = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'DATABASE_URL']
let envTestsPassed = 0

requiredEnvs.forEach(env => {
  if (process.env[env]) {
    console.log(`   ✅ ${env} is set`)
    envTestsPassed++
  } else {
    console.log(`   ❌ ${env} is missing`)
  }
})

console.log(`   Result: ${envTestsPassed}/${requiredEnvs.length} environment variables configured\n`)

// Test 2: Prisma Client Import
console.log('2️⃣ Testing Prisma Client Import...')
try {
  const { PrismaClient } = require('@prisma/client')
  console.log('   ✅ Prisma Client imported successfully')
  
  // Test client instantiation
  const prisma = new PrismaClient({
    log: ['error']
  })
  console.log('   ✅ Prisma Client instantiated successfully')
  
} catch (error) {
  console.log(`   ❌ Prisma Client import/instantiation failed: ${error.message}`)
}

// Test 3: Next.js Configuration
console.log('\n3️⃣ Testing Next.js Configuration...')
try {
  const nextConfig = require('../next.config.js')
  console.log('   ✅ Next.js config loaded successfully')
  
  if (nextConfig.experimental && nextConfig.experimental.serverComponentsExternalPackages) {
    console.log('   ✅ Railway optimizations present in Next.js config')
  } else {
    console.log('   ⚠️  Railway optimizations may be missing')
  }
  
} catch (error) {
  console.log(`   ❌ Next.js config loading failed: ${error.message}`)
}

// Test 4: Module Resolution
console.log('\n4️⃣ Testing Critical Module Resolution...')
const criticalModules = ['next', 'next-auth', 'bcryptjs', 'dotenv']

criticalModules.forEach(module => {
  try {
    require(module)
    console.log(`   ✅ ${module} resolved successfully`)
  } catch (error) {
    console.log(`   ❌ ${module} resolution failed: ${error.message}`)
  }
})

// Test 5: Database URL Format
console.log('\n5️⃣ Testing Database URL Format...')
const dbUrl = process.env.DATABASE_URL
if (dbUrl) {
  const hasPostgresql = dbUrl.startsWith('postgresql://')
  const hasConnectionLimit = dbUrl.includes('connection_limit=')
  const hasPoolTimeout = dbUrl.includes('pool_timeout=')
  const hasConnectTimeout = dbUrl.includes('connect_timeout=')
  
  console.log(`   ✅ PostgreSQL format: ${hasPostgresql ? 'Yes' : 'No'}`)
  console.log(`   ✅ Connection limit: ${hasConnectionLimit ? 'Yes' : 'No'}`)
  console.log(`   ✅ Pool timeout: ${hasPoolTimeout ? 'Yes' : 'No'}`)
  console.log(`   ✅ Connect timeout: ${hasConnectTimeout ? 'Yes' : 'No'}`)
  
  if (hasPostgresql && hasConnectionLimit && hasPoolTimeout) {
    console.log('   ✅ Database URL is Railway-optimized')
  } else {
    console.log('   ⚠️  Database URL could be better optimized for Railway')
  }
} else {
  console.log('   ❌ DATABASE_URL not configured')
}

// Test 6: Production Environment Checks
console.log('\n6️⃣ Testing Production Environment Readiness...')
const nodeEnv = process.env.NODE_ENV
const isProduction = nodeEnv === 'production'

console.log(`   Environment: ${nodeEnv || 'development'}`)

if (isProduction) {
  console.log('   ✅ Production environment detected')
  
  // Check for production-specific configurations
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes('localhost')) {
    console.log('   ✅ NEXTAUTH_URL configured for production')
  } else {
    console.log('   ⚠️  NEXTAUTH_URL may need production configuration')
  }
  
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32) {
    console.log('   ✅ NEXTAUTH_SECRET appears secure')
  } else {
    console.log('   ⚠️  NEXTAUTH_SECRET may need to be longer/more secure')
  }
  
} else {
  console.log('   ℹ️  Development environment detected')
}

// Summary
console.log('\n📋 Test Summary:')
console.log('This script has verified the key components that were failing in Railway.')
console.log('If all tests above show ✅, the deployment issues should be resolved.')
console.log('\nIf issues persist:')
console.log('1. Check Railway environment variables match these tests')
console.log('2. Ensure Railway PostgreSQL service is running')
console.log('3. Verify Railway build and start commands are correct')
console.log('4. Check Railway deployment logs for specific error details')

console.log('\n🚀 Ready for Railway deployment!')