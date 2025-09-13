const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'nelson.castro@khesedtek.com' }
    })
    
    console.log('User found:', user ? 'YES' : 'NO')
    if (user) {
      console.log('User details:')
      console.log('- ID:', user.id)
      console.log('- Name:', user.name)
      console.log('- Email:', user.email)
      console.log('- Role:', user.role)
      console.log('- isActive:', user.isActive)
      console.log('- Password hash exists:', user.password ? 'YES' : 'NO')
      console.log('- Password length:', user.password ? user.password.length : 'N/A')
      
      // Test password
      const testPassword = 'SuperAdmin2024!'
      const isValid = await bcrypt.compare(testPassword, user.password)
      console.log('- Password "SuperAdmin2024!" valid:', isValid ? 'YES' : 'NO')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
