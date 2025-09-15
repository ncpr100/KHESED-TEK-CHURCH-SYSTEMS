#!/usr/bin/env node

/**
 * Database Setup Script
 * This script helps set up the database for Khesed-tek Church Systems
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏗️  Setting up Khesed-tek Church Systems Database...\n');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('❌ No .env.local file found. Please copy .env.example to .env.local and configure your environment variables.\n');
  console.log('Run: cp .env.example .env.local\n');
  process.exit(1);
}

// Check if DATABASE_URL is set
const envContent = fs.readFileSync('.env.local', 'utf8');
const hasDatabaseUrl = envContent.includes('DATABASE_URL=') && 
                      !envContent.includes('DATABASE_URL=postgresql://username:password@localhost:5432/khesed_tek_dev');

if (!hasDatabaseUrl) {
  console.log('❌ DATABASE_URL not properly configured in .env.local');
  console.log('Please set a valid PostgreSQL connection string.\n');
  console.log('Example: DATABASE_URL=postgresql://username:password@localhost:5432/your_database\n');
  process.exit(1);
}

try {
  console.log('1️⃣  Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n2️⃣  Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('\n3️⃣  Checking database connection...');
  execSync('npx prisma db pull --force', { stdio: 'pipe' });
  
  console.log('\n✅ Database setup completed successfully!');
  console.log('\n🚀 You can now start the development server with: npm run dev');
  
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting tips:');
  console.log('1. Ensure your PostgreSQL database is running and accessible');
  console.log('2. Check that your DATABASE_URL is correct in .env.local');
  console.log('3. Make sure the database exists and you have proper permissions');
  console.log('\nFor more help, see DEPLOYMENT_TROUBLESHOOTING.md');
  process.exit(1);
}