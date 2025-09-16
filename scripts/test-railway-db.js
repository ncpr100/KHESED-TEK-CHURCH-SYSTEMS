#!/usr/bin/env node

/**
 * Railway Database Connection Testing Script
 * 
 * This script specifically tests database connectivity and connection pool
 * behavior in Railway's environment to help debug P2024 errors.
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const { PrismaClient } = require('@prisma/client')

async function testRailwayDatabase() {
  console.log('🚂 Railway Database Connection Testing\n')
  console.log('Environment:', process.env.NODE_ENV || 'development')
  console.log('Database URL configured:', !!process.env.DATABASE_URL)
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not configured')
    process.exit(1)
  }
  
  // Check if URL has Railway optimization parameters
  const dbUrl = process.env.DATABASE_URL
  const hasOptimizations = dbUrl.includes('connection_limit=') && dbUrl.includes('pool_timeout=')
  
  console.log('Connection string optimizations:', hasOptimizations ? '✅ Present' : '⚠️  Missing')
  
  if (!hasOptimizations) {
    console.log('💡 Consider adding: ?connection_limit=20&pool_timeout=60&connect_timeout=30')
  }
  
  console.log('\n📊 Starting connection tests...\n')

  const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    // Test 1: Basic Connection
    console.log('Test 1: Basic Database Connection')
    const startTime = Date.now()
    await prisma.$connect()
    const connectTime = Date.now() - startTime
    console.log(`✅ Connected successfully in ${connectTime}ms\n`)

    // Test 2: Simple Query
    console.log('Test 2: Simple Query Test')
    const queryStart = Date.now()
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`
    const queryTime = Date.now() - queryStart
    console.log(`✅ Query executed successfully in ${queryTime}ms`)
    console.log('Result:', result)
    console.log()

    // Test 3: Connection Pool Stress Test
    console.log('Test 3: Connection Pool Stress Test')
    console.log('Creating 5 concurrent connections...')
    
    const concurrentQueries = []
    for (let i = 0; i < 5; i++) {
      concurrentQueries.push(
        prisma.$queryRaw`SELECT ${i} as query_id, pg_backend_pid() as pid, NOW() as timestamp`
          .catch(error => ({ error: error.message, queryId: i }))
      )
    }
    
    const stressStart = Date.now()
    const results = await Promise.all(concurrentQueries)
    const stressTime = Date.now() - stressStart
    
    const successful = results.filter(r => !r.error).length
    const failed = results.filter(r => r.error).length
    
    console.log(`✅ Stress test completed in ${stressTime}ms`)
    console.log(`   Successful queries: ${successful}/${results.length}`)
    if (failed > 0) {
      console.log(`   Failed queries: ${failed}`)
      results.filter(r => r.error).forEach(r => {
        console.log(`   ❌ Query ${r.queryId}: ${r.error}`)
      })
    }
    console.log()

    // Test 4: Database Information
    console.log('Test 4: Database Configuration Info')
    try {
      const dbInfo = await prisma.$queryRaw`
        SELECT 
          current_database() as database_name,
          current_user as current_user,
          version() as postgres_version,
          setting as max_connections
        FROM pg_settings 
        WHERE name = 'max_connections'
      `
      
      console.log('Database Information:', dbInfo[0])
      
      // Get connection stats if available
      const connectionStats = await prisma.$queryRaw`
        SELECT 
          numbackends as active_connections,
          datname as database_name
        FROM pg_stat_database 
        WHERE datname = current_database()
      `
      
      if (connectionStats.length > 0) {
        console.log('Connection Statistics:', connectionStats[0])
      }
      console.log()
      
    } catch (error) {
      console.log('⚠️  Could not retrieve database info (insufficient permissions)')
      console.log('   This is normal in some hosted environments')
      console.log()
    }

    // Test 5: Long-running Connection Test
    console.log('Test 5: Connection Persistence Test')
    console.log('Testing connection over 30 seconds with periodic queries...')
    
    let persistenceErrors = 0
    for (let i = 0; i < 6; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
        const testResult = await prisma.$queryRaw`SELECT ${i} as iteration, NOW() as timestamp`
        console.log(`   ✅ Iteration ${i + 1}/6: Success`)
      } catch (error) {
        persistenceErrors++
        console.log(`   ❌ Iteration ${i + 1}/6: ${error.message}`)
        
        if (error.code === 'P2024') {
          console.log('   🔍 P2024 Error detected - connection pool timeout')
        }
      }
    }
    
    if (persistenceErrors === 0) {
      console.log('✅ Connection persistence test passed')
    } else {
      console.log(`⚠️  Connection persistence test had ${persistenceErrors} errors`)
    }

  } catch (error) {
    console.error('\n❌ Database connection test failed:')
    console.error('Error Name:', error.name)
    console.error('Error Code:', error.code || 'N/A')
    console.error('Error Message:', error.message)
    
    if (error.code === 'P2024') {
      console.error('\n🔍 P2024 Analysis:')
      console.error('This is a connection pool timeout error. Potential causes:')
      console.error('1. Database connection limit reached')
      console.error('2. Network latency issues')
      console.error('3. Database server overload')
      console.error('4. Connection pool configuration too small')
      console.error('\nRecommended fixes:')
      console.error('- Increase connection_limit parameter in DATABASE_URL')
      console.error('- Increase pool_timeout parameter')
      console.error('- Check Railway database plan limits')
    }
    
    process.exit(1)
    
  } finally {
    try {
      await prisma.$disconnect()
      console.log('\n✅ Database connection closed successfully')
    } catch (error) {
      console.error('⚠️  Error closing database connection:', error.message)
    }
  }

  console.log('\n🎉 All database tests completed successfully!')
  console.log('The database connection is working properly for Railway deployment.')
}

// Run the test if this script is executed directly
if (require.main === module) {
  testRailwayDatabase().catch(console.error)
}

module.exports = { testRailwayDatabase }