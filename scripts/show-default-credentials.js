#!/usr/bin/env node

/**
 * Script to show default SUPER_ADMIN credentials for development/testing
 * Based on the seed.ts file configuration
 */

console.log('🔑 KHESED-TEK SUPER_ADMIN DEFAULT CREDENTIALS')
console.log('=============================================\n')

console.log('📋 DEFAULT SUPER_ADMIN ACCOUNT (from seed.ts):')
console.log('Email:    nelson.castro@khesedtek.com')
console.log('Password: SuperAdmin2024!')
console.log('Role:     SUPER_ADMIN')
console.log('Status:   Should be active if database is seeded\n')

console.log('📋 ALTERNATIVE TEST ACCOUNTS (from seed.ts):')
console.log('1. Church Admin:')
console.log('   Email:    admin@iglesiacentral.com')
console.log('   Password: password123')
console.log('   Role:     ADMIN_IGLESIA\n')

console.log('2. Test User:')
console.log('   Email:    john@doe.com')
console.log('   Password: johndoe123')
console.log('   Role:     ADMIN_IGLESIA\n')

console.log('3. Pastor Account:')
console.log('   Email:    pastor@iglesiacentral.com')
console.log('   Password: password123')
console.log('   Role:     PASTOR\n')

console.log('🌐 HOW TO ACCESS:')
console.log('1. Ensure database is set up and seeded')
console.log('2. Start development server: npm run dev')
console.log('3. Navigate to: http://localhost:3000')
console.log('4. Use SUPER_ADMIN credentials above to login')
console.log('5. You will be redirected to: /platform/dashboard')
console.log('6. Access support settings at: /platform/support-settings\n')

console.log('⚠️  IMPORTANT NOTES:')
console.log('- These credentials only work if the database has been seeded')
console.log('- Run "npm run seed" or "npx prisma db seed" to create these accounts')
console.log('- SUPER_ADMIN accounts have access to platform-level features')
console.log('- Regular church accounts cannot access /platform routes\n')

console.log('🔧 DATABASE SETUP:')
console.log('1. Set up PostgreSQL database')
console.log('2. Configure DATABASE_URL in .env.local')
console.log('3. Run: npx prisma migrate dev')
console.log('4. Run: npx prisma db seed')
console.log('5. Start application: npm run dev\n')

console.log('🆘 TROUBLESHOOTING:')
console.log('- If login fails: Check database connection and ensure accounts exist')
console.log('- If redirected away from /platform: Check user role is SUPER_ADMIN')
console.log('- For contact info updates: Ensure user has SUPER_ADMIN permissions')