#!/bin/bash

# Railway Deployment Script
# This script ensures proper Prisma client generation for Railway deployment

echo "🚀 Starting Railway deployment preparation..."

# Ensure Prisma client is generated with correct binary targets
echo "📦 Generating Prisma client for Railway..."
npx prisma generate

# Validate environment configuration
echo "🔍 Validating environment..."
node scripts/validate-env.js

# Start the application
echo "🌟 Starting application..."
exec npm start