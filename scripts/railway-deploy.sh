#!/bin/bash

# Railway Deployment Script with Enhanced Logging
# This script ensures proper Prisma client generation for Railway deployment

# Colors and emojis for better visibility in Railway logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}🔍 [RAILWAY-INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ [RAILWAY-SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠️  [RAILWAY-WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}❌ [RAILWAY-ERROR]${NC} $1"
}

log_railway() {
    echo -e "${BLUE}🚂 [RAILWAY]${NC} $1"
}

log_railway "Starting Railway deployment preparation..."
log_info "Environment: ${NODE_ENV:-development}"
log_info "Railway Environment: ${RAILWAY_ENVIRONMENT:-not-set}"

# Check if we're running on Railway
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    log_success "Running on Railway environment: $RAILWAY_ENVIRONMENT"
else
    log_warn "RAILWAY_ENVIRONMENT not detected, assuming local development"
fi

# Ensure Prisma client is generated with correct binary targets
log_info "Generating Prisma client for Railway..."
if npx prisma generate; then
    log_success "Prisma client generated successfully"
else
    log_error "Failed to generate Prisma client"
    exit 1
fi

# Validate environment configuration
log_info "Validating environment configuration..."
if node scripts/validate-env.js; then
    log_success "Environment validation passed"
else
    log_error "Environment validation failed"
    exit 1
fi

# Log Railway-specific information if available
if [ -n "$RAILWAY_PROJECT_NAME" ]; then
    log_railway "Project: $RAILWAY_PROJECT_NAME"
fi

if [ -n "$RAILWAY_ENVIRONMENT_NAME" ]; then
    log_railway "Environment Name: $RAILWAY_ENVIRONMENT_NAME"
fi

if [ -n "$DATABASE_URL" ]; then
    log_info "Database connection configured"
else
    log_warn "DATABASE_URL not found"
fi

if [ -n "$NEXTAUTH_URL" ]; then
    log_info "NextAuth URL configured: $NEXTAUTH_URL"
else
    log_warn "NEXTAUTH_URL not found"
fi

# Start the application
log_railway "Starting application..."
log_success "Railway deployment preparation complete"
exec npm start