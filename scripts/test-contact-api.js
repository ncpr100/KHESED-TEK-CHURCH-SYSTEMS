#!/usr/bin/env node

/**
 * Script to test the contact information API endpoints
 * This helps verify the fix for the contact info card system
 */

console.log('🧪 TESTING CONTACT INFORMATION API')
console.log('==================================\n')

const BASE_URL = 'http://localhost:3000'

async function testContactApi() {
  console.log('📋 Test 1: GET /api/support-contact (fetch contact info)')
  
  try {
    const getResponse = await fetch(`${BASE_URL}/api/support-contact`)
    const getData = await getResponse.json()
    
    console.log('✅ GET Response Status:', getResponse.status)
    console.log('✅ GET Response Data:', JSON.stringify(getData, null, 2))
    
    if (getResponse.ok) {
      console.log('✅ Contact info fetch: SUCCESS\n')
    } else {
      console.log('❌ Contact info fetch: FAILED\n')
    }
  } catch (error) {
    console.log('❌ GET Request failed:', error.message, '\n')
  }

  console.log('📋 Test 2: PUT /api/support-contact (update contact info - should fail without auth)')
  
  const testUpdateData = {
    whatsappNumber: '+57 300 TEST (123456)',
    whatsappUrl: 'https://wa.me/573001123456',
    email: 'test@khesedtek.com',
    schedule: 'Test Schedule',
    companyName: 'Test Company',
    location: 'Test Location',
    website: 'https://test.khesedtek.com'
  }
  
  try {
    const putResponse = await fetch(`${BASE_URL}/api/support-contact`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUpdateData)
    })
    
    const putData = await putResponse.json()
    
    console.log('✅ PUT Response Status:', putResponse.status)
    console.log('✅ PUT Response Data:', JSON.stringify(putData, null, 2))
    
    if (putResponse.status === 401 || putResponse.status === 403) {
      console.log('✅ Update without auth: CORRECTLY REJECTED (expected)\n')
    } else if (putResponse.ok) {
      console.log('⚠️  Update without auth: UNEXPECTEDLY SUCCEEDED\n')
    } else {
      console.log('❌ Update without auth: UNEXPECTED ERROR\n')
    }
  } catch (error) {
    console.log('❌ PUT Request failed:', error.message, '\n')
  }

  console.log('📋 SUMMARY:')
  console.log('- The GET endpoint should work without authentication')
  console.log('- The PUT endpoint should require SUPER_ADMIN authentication')
  console.log('- When database is not available, the API should gracefully fallback to defaults')
  console.log('- Contact info updates should show proper notifications\n')

  console.log('🔧 TO TEST WITH AUTHENTICATION:')
  console.log('1. Set up database and run seed: npx prisma db seed')
  console.log('2. Login with SUPER_ADMIN credentials: nelson.castro@khesedtek.com')
  console.log('3. Navigate to: /platform/support-settings')
  console.log('4. Make changes and verify notifications appear')
  console.log('5. Check that preview updates in real-time')
}

// Only run if this is the main module
if (require.main === module) {
  testContactApi().catch(console.error)
}

module.exports = { testContactApi }