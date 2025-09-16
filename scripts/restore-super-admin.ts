#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function restoreSuperAdmin() {
  console.log('🔧 Restoring SUPER_ADMIN user for Railway migration...\n')

  try {
    // The specific credentials mentioned in the issue
    const email = 'soporte@khesed-tek.com'
    const password = 'Bendecido100%$$%'
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log(`🔍 Checking for existing user: ${email}`)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('✅ User found, updating password and ensuring SUPER_ADMIN role...')
      
      // Update existing user with correct password and role
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
          name: existingUser.name || 'Super Admin',
          churchId: null // SUPER_ADMIN doesn't belong to a specific church
        }
      })

      console.log('✅ Existing user updated successfully!')
      console.log(`   ID: ${updatedUser.id}`)
      console.log(`   Name: ${updatedUser.name}`)
      console.log(`   Email: ${updatedUser.email}`)
      console.log(`   Role: ${updatedUser.role}`)
      console.log(`   Active: ${updatedUser.isActive}`)
      
    } else {
      console.log('➕ User not found, creating new SUPER_ADMIN...')
      
      // Create new super admin user
      const newUser = await prisma.user.create({
        data: {
          name: 'Super Admin',
          email,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          churchId: null, // SUPER_ADMIN doesn't belong to a specific church
          isActive: true
        }
      })

      console.log('✅ New SUPER_ADMIN created successfully!')
      console.log(`   ID: ${newUser.id}`)
      console.log(`   Name: ${newUser.name}`)
      console.log(`   Email: ${newUser.email}`)
      console.log(`   Role: ${newUser.role}`)
      console.log(`   Active: ${newUser.isActive}`)
    }

    console.log('\n🔑 LOGIN CREDENTIALS:')
    console.log('================================')
    console.log(`Email:    ${email}`)
    console.log(`Password: ${password}`)
    console.log('================================\n')
    
    console.log('🌐 ACCESS INSTRUCTIONS:')
    console.log('1. Navigate to your application URL')
    console.log('2. Go to the login page (/auth/signin)')
    console.log('3. Use the credentials above to login')
    console.log('4. You should be redirected to the dashboard\n')
    
    console.log('✅ Super admin restoration completed successfully!')

  } catch (error: any) {
    console.error('❌ Error restoring SUPER_ADMIN:', error)
    
    // Provide specific error guidance
    if (error.code === 'P2002') {
      console.error('   → Duplicate email error. User may already exist with different case.')
    } else if (error.code === 'P2024') {
      console.error('   → Database connection timeout. Check DATABASE_URL configuration.')
    } else if (error.name === 'PrismaClientInitializationError') {
      console.error('   → Database connection failed. Verify Railway database is running.')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
restoreSuperAdmin()