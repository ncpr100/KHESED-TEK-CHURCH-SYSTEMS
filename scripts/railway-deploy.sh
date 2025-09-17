#!/bin/bash

# Railway Deployment Script
# This script ensures proper Prisma client generation and database connectivity for Railway deployment

echo "🚀 Starting Railway deployment preparation..."

# Set error handling
set -e

# Function to check if database is accessible
check_database_connection() {
  echo "🔍 Testing database connectivity..."
  
  # Create a temporary Node.js script to test database connection
  cat > /tmp/db-test.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['error']
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test with a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test passed');
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    await prisma.$disconnect();
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
EOF

  if node /tmp/db-test.js; then
    echo "✅ Database connectivity verified"
    rm -f /tmp/db-test.js
    return 0
  else
    echo "⚠️  Database connectivity issues detected - continuing with deployment"
    rm -f /tmp/db-test.js
    return 1
  fi
}

# Ensure Prisma client is generated with correct binary targets for Railway
echo "📦 Generating Prisma client for Railway (linux-musl-openssl-3.0.x)..."
npx prisma generate

if [ $? -ne 0 ]; then
  echo "❌ Prisma client generation failed"
  exit 1
fi

echo "✅ Prisma client generated successfully"

# Validate environment configuration
echo "🔍 Validating environment configuration..."
node scripts/validate-env.js

# Allow warnings but fail on errors
VALIDATION_EXIT_CODE=$?
if [ $VALIDATION_EXIT_CODE -ne 0 ]; then
  echo "❌ Environment validation failed with critical errors"
  exit 1
fi

echo "✅ Environment validation completed"

# Test database connection if DATABASE_URL is available (non-blocking)
if [ -n "$DATABASE_URL" ]; then
  echo "🔍 Testing database connectivity (non-blocking)..."
  if check_database_connection; then
    echo "✅ Database connection test passed"
  else
    echo "⚠️  Database connectivity issues - will retry during runtime"
  fi
else
  echo "⚠️  DATABASE_URL not set - skipping connection test"
fi

# Display deployment information
echo "📊 Railway Deployment Information:"
echo "   Node.js version: $(node --version)"
echo "   NPM version: $(npm --version)"
echo "   Platform: $(uname -m)"
echo "   Environment: ${NODE_ENV:-production}"
echo "   Railway Environment: ${RAILWAY_ENVIRONMENT:-unknown}"
echo "   Build ID: ${RAILWAY_GIT_COMMIT_SHA:-unknown}"

# Railway-specific optimizations
echo "🚂 Setting Railway optimizations..."
export NODE_OPTIONS="--max-old-space-size=4096"
export DISABLE_ESLINT_PLUGIN=true

# Start the application with error handling
echo "🌟 Starting Railway application..."
exec npm start