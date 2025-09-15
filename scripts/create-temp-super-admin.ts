#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function createTempSuperAdmin() {
  console.log('🔧 Creating temporary SUPER_ADMIN credentials...\n')

  try {
    // Generate temporary credentials
    const tempEmail = `temp-admin-${nanoid(8)}@khesedtek.com`
    const tempPassword = `TempAdmin${nanoid(8)}!`
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Check if any super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (existingSuperAdmin) {
      console.log('⚠️  Existing SUPER_ADMIN found:')
      console.log(`   Email: ${existingSuperAdmin.email}`)
      console.log(`   Name: ${existingSuperAdmin.name}`)
      console.log(`   Active: ${existingSuperAdmin.isActive ? 'Yes' : 'No'}`)
      console.log(`   Created: ${existingSuperAdmin.createdAt}`)
      
      if (existingSuperAdmin.isActive) {
        console.log('\n✅ Active SUPER_ADMIN already exists. Use existing credentials:')
        console.log(`   Email: ${existingSuperAdmin.email}`)
        console.log('   Password: Check with system administrator or use seed credentials')
        return
      }
    }

    // Create temporary super admin
    const tempSuperAdmin = await prisma.user.create({
      data: {
        name: 'Temporary Super Admin',
        email: tempEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        churchId: null, // SUPER_ADMIN doesn't belong to a specific church
        isActive: true
      }
    })

    console.log('✅ Temporary SUPER_ADMIN created successfully!\n')
    console.log('🔑 LOGIN CREDENTIALS:')
    console.log('================================')
    console.log(`Email:    ${tempEmail}`)
    console.log(`Password: ${tempPassword}`)
    console.log('================================\n')
    
    console.log('🌐 ACCESS INSTRUCTIONS:')
    console.log('1. Start the development server: npm run dev')
    console.log('2. Navigate to: http://localhost:3000')
    console.log('3. Use the credentials above to login')
    console.log('4. You will be redirected to: /platform/dashboard')
    console.log('5. Access support settings at: /platform/support-settings\n')
    
    console.log('⚠️  SECURITY NOTES:')
    console.log('- These are TEMPORARY credentials for development/testing')
    console.log('- Delete this admin account after completing your tasks')
    console.log('- Never use temporary credentials in production')
    console.log('- The password contains special characters, copy it carefully\n')

    // Set auto-deletion reminder
    console.log('🕐 AUTO-DELETION REMINDER:')
    console.log(`   Admin ID: ${tempSuperAdmin.id}`)
    console.log('   Use this command to delete when finished:')
    console.log(`   npx tsx scripts/delete-temp-admin.ts ${tempSuperAdmin.id}\n`)

    // Create deletion script
    await createDeletionScript(tempSuperAdmin.id, tempEmail)

  } catch (error) {
    console.error('❌ Error creating temporary SUPER_ADMIN:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

async function createDeletionScript(adminId: string, adminEmail: string) {
  const deletionScript = `#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTempAdmin() {
  const adminId = process.argv[2]
  
  if (!adminId) {
    console.log('❌ Please provide the admin ID to delete')
    console.log('Usage: npx tsx scripts/delete-temp-admin.ts <admin-id>')
    process.exit(1)
  }

  try {
    const admin = await prisma.user.findUnique({
      where: { id: adminId }
    })

    if (!admin) {
      console.log('❌ Admin not found with ID:', adminId)
      return
    }

    if (admin.role !== 'SUPER_ADMIN') {
      console.log('❌ User is not a SUPER_ADMIN:', admin.email)
      return
    }

    // Confirm deletion
    if (!admin.email.includes('temp-admin-')) {
      console.log('❌ This doesn't appear to be a temporary admin account')
      console.log('   Email:', admin.email)
      console.log('   Only delete accounts with "temp-admin-" in the email')
      return
    }

    await prisma.user.delete({
      where: { id: adminId }
    })

    console.log('✅ Temporary SUPER_ADMIN deleted successfully')
    console.log('   Email:', admin.email)
    console.log('   ID:', adminId)

  } catch (error) {
    console.error('❌ Error deleting temporary admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTempAdmin()
`

  const fs = await import('fs/promises')
  await fs.writeFile('scripts/delete-temp-admin.ts', deletionScript)
  console.log('📝 Created deletion script: scripts/delete-temp-admin.ts')
}

// Run the function
createTempSuperAdmin()