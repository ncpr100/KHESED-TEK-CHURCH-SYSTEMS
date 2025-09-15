#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables are properly set
 */

require('dotenv').config({ path: '.env.local' });

const requiredVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL', 
  'DATABASE_URL'
];

const recommendedVars = [
  'MAILGUN_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'FROM_EMAIL'
];

console.log('🔍 Validating Environment Variables...\n');

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('✅ Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Missing`);
    hasErrors = true;
  } else if (value.includes('your-') || value.includes('localhost') && varName === 'NEXTAUTH_URL') {
    console.log(`⚠️  ${varName}: Using placeholder value`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

// Check recommended variables
console.log('\n📧 Recommended Variables (Email/SMS):');
recommendedVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Not set`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

// Specific validations
console.log('\n🔍 Specific Validations:');

// NEXTAUTH_SECRET length check
const secret = process.env.NEXTAUTH_SECRET;
if (secret && secret.length < 32) {
  console.log('❌ NEXTAUTH_SECRET should be at least 32 characters long');
  hasErrors = true;
} else if (secret) {
  console.log('✅ NEXTAUTH_SECRET length is adequate');
}

// DATABASE_URL format check
const dbUrl = process.env.DATABASE_URL;
if (dbUrl && !dbUrl.startsWith('postgresql://')) {
  console.log('❌ DATABASE_URL should start with postgresql://');
  hasErrors = true;
} else if (dbUrl) {
  console.log('✅ DATABASE_URL format looks correct');
}

// NEXTAUTH_URL format check
const authUrl = process.env.NEXTAUTH_URL;
if (authUrl && !authUrl.startsWith('http')) {
  console.log('❌ NEXTAUTH_URL should start with http:// or https://');
  hasErrors = true;
} else if (authUrl) {
  console.log('✅ NEXTAUTH_URL format looks correct');
}

// Summary
console.log('\n📋 Summary:');
if (hasErrors) {
  console.log('❌ Validation failed - please fix the errors above');
  console.log('💡 Tip: Copy .env.example to .env.local and fill in your values');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Validation passed with warnings - some optional features may not work');
  console.log('💡 Consider setting up email and SMS providers for full functionality');
} else {
  console.log('✅ All validations passed - environment is ready for deployment!');
}

console.log('\n🚀 Next steps:');
console.log('1. Run: npm run db:setup (to set up database)');
console.log('2. Run: npm run dev (for development)');
console.log('3. Run: npm run build (to test production build)');