#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

async function testRailwayConnection() {
  console.log('🚂 Testing Railway Database Connection...\n')

  // Check environment variables first
  const dbUrl = process.env.DATABASE_URL
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL

  console.log('📋 Environment Check:')
  console.log(`   DATABASE_URL: ${dbUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NEXTAUTH_SECRET: ${nextAuthSecret ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NEXTAUTH_URL: ${nextAuthUrl ? '✅ Set' : '❌ Missing'}`)
  console.log()

  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.error('   This is required for Railway database connection')
    return
  }

  // Enhance DATABASE_URL for Railway if needed
  const enhancedUrl = dbUrl.includes('connection_limit') 
    ? dbUrl 
    : `${dbUrl}${dbUrl.includes('?') ? '&' : '?'}connection_limit=20&pool_timeout=60&connect_timeout=30`

  console.log('🔧 Connection Configuration:')
  console.log(`   Original URL length: ${dbUrl.length} characters`)
  console.log(`   Enhanced URL: ${enhancedUrl.includes('connection_limit') ? '✅ Optimized for Railway' : '⚠️  Using default settings'}`)
  console.log()

  let prisma: PrismaClient | null = null

  try {
    // Create Prisma client with Railway optimization
    prisma = new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: enhancedUrl
        }
      }
    })

    console.log('🔌 Attempting database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection established successfully')

    // Test basic query
    console.log('🔍 Testing basic query...')
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Basic query executed successfully')

    // Check connection pool info if available
    console.log('🏊 Checking connection pool status...')
    try {
      const poolInfo = await prisma.$queryRaw<any[]>`
        SELECT 
          numbackends as active_connections,
          setting as max_connections
        FROM pg_stat_database 
        CROSS JOIN pg_settings 
        WHERE datname = current_database() 
          AND name = 'max_connections'
        LIMIT 1
      `
      
      if (poolInfo.length > 0) {
        console.log(`   Active connections: ${poolInfo[0].active_connections}`)
        console.log(`   Max connections: ${poolInfo[0].max_connections}`)
      }
    } catch (poolError) {
      console.log('   ⚠️  Could not retrieve pool info (this is normal on some setups)')
    }

    // Test user table access
    console.log('👥 Testing User table access...')
    const userCount = await prisma.user.count()
    console.log(`✅ User table accessible. Found ${userCount} users`)

    // Check for super admin users
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { email: true, isActive: true, createdAt: true }
    })

    console.log(`🔑 Super Admin Status:`)
    if (superAdmins.length === 0) {
      console.log('   ❌ No SUPER_ADMIN users found')
      console.log('   → Run: npx tsx scripts/restore-super-admin.ts')
    } else {
      console.log(`   ✅ Found ${superAdmins.length} SUPER_ADMIN user(s):`)
      superAdmins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email} (${admin.isActive ? 'Active' : 'Inactive'})`)
      })
    }

    // Test specific user mentioned in the issue
    console.log('🔍 Checking for issue-specific user...')
    const issueUser = await prisma.user.findUnique({
      where: { email: 'soporte@khesed-tek.com' },
      select: { email: true, role: true, isActive: true, password: true }
    })

    if (issueUser) {
      console.log('✅ Found soporte@khesed-tek.com user:')
      console.log(`   Role: ${issueUser.role}`)
      console.log(`   Active: ${issueUser.isActive}`)
      console.log(`   Has Password: ${issueUser.password ? 'Yes' : 'No'}`)
      
      if (!issueUser.password) {
        console.log('   ❌ User has no password set - this will cause 401 errors')
        console.log('   → Run: npx tsx scripts/restore-super-admin.ts')
      }
    } else {
      console.log('❌ soporte@khesed-tek.com user not found')
      console.log('   → This explains the 401 error')
      console.log('   → Run: npx tsx scripts/restore-super-admin.ts')
    }

    console.log('\n🎉 Railway database connection test completed successfully!')

  } catch (error: any) {
    console.error('\n❌ Database connection test failed:')
    console.error(`   Error: ${error.message}`)
    console.error(`   Code: ${error.code || 'Unknown'}`)
    
    if (error.code === 'P2024') {
      console.error('\n💡 Connection Pool Timeout (P2024) Solutions:')
      console.error('   1. Increase connection_limit in DATABASE_URL')
      console.error('   2. Reduce concurrent database queries')
      console.error('   3. Check Railway database plan limits')
      console.error('   4. Consider upgrading Railway plan if on free tier')
    } else if (error.name === 'PrismaClientInitializationError') {
      console.error('\n💡 Prisma Client Initialization Solutions:')
      console.error('   1. Verify DATABASE_URL is correct')
      console.error('   2. Check Railway database is running')
      console.error('   3. Verify database credentials')
      console.error('   4. Run: railway login && railway status')
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n💡 Network Connection Solutions:')
      console.error('   1. Check Railway database URL')
      console.error('   2. Verify VPN/firewall settings')
      console.error('   3. Test connection from Railway dashboard')
    }

  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}

// Run the function
testRailwayConnection()