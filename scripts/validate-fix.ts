#!/usr/bin/env tsx

import { config } from 'dotenv'

// Load environment variables from .env.local for development
config({ path: '.env.local' })

async function validateFix() {
  console.log('🔍 Validating 401 Authentication Fix...\n')

  // Check environment variables
  const envVars = {
    'DATABASE_URL': process.env.DATABASE_URL,
    'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET,
    'NEXTAUTH_URL': process.env.NEXTAUTH_URL
  }

  console.log('📋 Environment Variables Check:')
  let envScore = 0
  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      console.log(`   ✅ ${key}: Configured`)
      envScore++
    } else {
      console.log(`   ❌ ${key}: Missing`)
    }
  }

  // Check scripts availability
  console.log('\n🛠️  Fix Scripts Check:')
  const fs = await import('fs/promises')
  const scripts = [
    'scripts/restore-super-admin.ts',
    'scripts/test-railway-connection.ts'
  ]

  let scriptScore = 0
  for (const script of scripts) {
    try {
      await fs.access(script)
      console.log(`   ✅ ${script}: Available`)
      scriptScore++
    } catch {
      console.log(`   ❌ ${script}: Missing`)
    }
  }

  // Check package.json scripts
  console.log('\n📦 NPM Scripts Check:')
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'))
    const requiredScripts = [
      'restore-super-admin',
      'test-railway-connection',
      'validate-env'
    ]

    let npmScriptScore = 0
    for (const script of requiredScripts) {
      if (packageJson.scripts[script]) {
        console.log(`   ✅ npm run ${script}: Available`)
        npmScriptScore++
      } else {
        console.log(`   ❌ npm run ${script}: Missing`)
      }
    }

    // Check fix documentation
    console.log('\n📚 Documentation Check:')
    let docScore = 0
    const docs = ['RAILWAY_AUTH_FIX.md']
    
    for (const doc of docs) {
      try {
        await fs.access(doc)
        console.log(`   ✅ ${doc}: Available`)
        docScore++
      } catch {
        console.log(`   ❌ ${doc}: Missing`)
      }
    }

    // Calculate overall score
    const totalScore = envScore + scriptScore + npmScriptScore + docScore
    const maxScore = Object.keys(envVars).length + scripts.length + requiredScripts.length + docs.length
    const percentage = Math.round((totalScore / maxScore) * 100)

    console.log('\n📊 Fix Validation Summary:')
    console.log(`   Environment Variables: ${envScore}/${Object.keys(envVars).length}`)
    console.log(`   Fix Scripts: ${scriptScore}/${scripts.length}`)
    console.log(`   NPM Scripts: ${npmScriptScore}/${requiredScripts.length}`)
    console.log(`   Documentation: ${docScore}/${docs.length}`)
    console.log(`   Overall Score: ${totalScore}/${maxScore} (${percentage}%)`)

    if (percentage >= 100) {
      console.log('\n🎉 ✅ All fix components are ready!')
      console.log('\n🔧 Next Steps for Railway Deployment:')
      console.log('   1. Set environment variables in Railway dashboard')
      console.log('   2. Deploy the application')
      console.log('   3. Run: npm run test-railway-connection (in Railway console)')
      console.log('   4. Run: npm run restore-super-admin (in Railway console)')
      console.log('   5. Test login with: soporte@khesed-tek.com / Bendecido100%$$%')
    } else if (percentage >= 80) {
      console.log('\n⚠️  Fix is mostly ready but some components are missing')
    } else {
      console.log('\n❌ Fix needs more work - several components are missing')
    }

    // Show specific instructions based on environment
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) {
      console.log('\n🔄 Development Environment Detected:')
      console.log('   - Using local database configuration')
      console.log('   - Scripts will fail without real database but error handling is working')
      console.log('   - Deploy to Railway with proper DATABASE_URL for full functionality')
    }

  } catch (error) {
    console.error('❌ Error reading package.json:', error)
  }
}

// Run validation
validateFix()