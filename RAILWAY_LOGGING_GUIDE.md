# Railway Enhanced Logging Guide

## 🚂 Overview

This guide outlines the enhanced logging system specifically designed for Railway deployment monitoring, debugging, and performance analysis.

## 🎯 Key Features

### 1. Structured Logging
- **Railway-optimized log format** with clear service identification
- **JSON context** for better log parsing and analysis
- **Consistent prefixes** for easy filtering in Railway logs

### 2. Service-Specific Logging
- `🚂 [RAILWAY]` - Railway deployment and infrastructure logs
- `🔍 [INFO]` - General information logs
- `✅ [SUCCESS]` - Success operations
- `⚠️ [WARN]` - Warning conditions
- `❌ [ERROR]` - Error conditions
- `🐛 [DEBUG]` - Debug information (development only)

### 3. Enhanced Components

#### Database Logging
- Connection status monitoring
- Query performance tracking
- Error categorization (Prisma-specific)
- Connection pool health checks

#### Authentication Logging
- Login attempt tracking
- Failed authentication reasons
- JWT token operations
- Session management

#### Environment Validation
- Configuration completeness checks
- Railway-specific variable detection
- Production readiness validation

## 🛠️ Implementation

### New Files Added

1. **`lib/logger.ts`** - Main logging utility with Railway optimization
2. **`lib/railway-logger.ts`** - Railway-specific monitoring and metrics
3. Enhanced **`scripts/validate-env.js`** - Environment validation with structured logging
4. Enhanced **`scripts/railway-deploy.sh`** - Deployment script with better logging

### Updated Files

1. **`lib/db.ts`** - Database operations with enhanced logging
2. **`lib/auth.ts`** - Authentication flows with detailed logging
3. **`next.config.js`** - Build-time logging and Railway headers
4. **`prisma/schema.prisma`** - Fixed output path warning

## 📊 Log Categories

### Production Logs
```bash
# Successful authentication
✅ [SUCCESS] Auth login-success for user@example.com {"service":"auth","userId":"123","role":"admin"}

# Database operations
🔍 [INFO] Database query (150ms) {"service":"database","operation":"query","duration":150}

# Railway deployment
🚂 [RAILWAY] Deployment completed successfully {"environment":"production","startupTime":"2500ms"}
```

### Error Logs
```bash
# Authentication failures
❌ [ERROR] Auth login-failed for user@example.com {"service":"auth","reason":"invalid-password"}

# Database connection issues
❌ [ERROR] Database connection failed {"service":"database","databaseUrl":"configured"}

# Environment configuration
❌ [ERROR] Missing required environment variable: NEXTAUTH_SECRET {"variable":"NEXTAUTH_SECRET"}
```

### Debug Logs (Development Only)
```bash
# JWT operations
🐛 [DEBUG] JWT callback - creating token for user {"service":"auth","email":"user@example.com"}

# Database queries
🐛 [DEBUG] Database query on users (45ms) {"service":"database","operation":"query","table":"users"}
```

## 🚀 Railway Deployment Integration

### Environment Detection
The system automatically detects Railway environment:
- `RAILWAY_ENVIRONMENT` - Production/staging environment
- `RAILWAY_PROJECT_NAME` - Project identification
- `RAILWAY_GIT_COMMIT_SHA` - Build version tracking

### Deployment Monitoring
```bash
# Deployment start
🚂 [RAILWAY] Starting Railway deployment preparation...
✅ [SUCCESS] Prisma client generated successfully
✅ [SUCCESS] Environment validation passed
🚂 [RAILWAY] Deployment completed successfully
```

### Build Information Logging
```bash
🚂 [RAILWAY-BUILD] Webpack configuration loaded {"buildId":"abc123","environment":"production"}
```

## 🔧 Configuration

### Enable Metrics Logging
For production monitoring, metrics are automatically logged every 5 minutes:

```typescript
import { railwayMonitor } from './lib/railway-logger'

// Start periodic metrics logging
railwayMonitor.startMetricsLogging(300000) // 5 minutes
```

### Custom Logging
```typescript
import { logger } from './lib/logger'

// Service-specific logging
logger.railwayInfo('my-service', 'Operation completed', { userId: '123' })
logger.railwayError('my-service', 'Operation failed', error, { context: 'additional-info' })

// Database operations
logger.dbOperation('insert', 'users', 150, { recordCount: 1 })

// Authentication
logger.authOperation('login-attempt', 'user@example.com', true)
```

## 📈 Performance Monitoring

### System Metrics
- **Memory usage** - Heap used/total and percentage
- **Uptime** - Process uptime in seconds
- **Build version** - Git commit SHA for version tracking

### Database Performance
- **Query duration** tracking
- **Connection health** monitoring
- **Performance categorization** (fast/medium/slow)

### HTTP Request Metrics
- **Response times** with performance categorization
- **Status code** tracking
- **User agent** and IP logging
- **Referrer** tracking

## 🚨 Error Handling

### Global Error Handling
Automatic handling of:
- Uncaught exceptions
- Unhandled promise rejections
- Process signals (SIGTERM, SIGINT)

### Prisma Error Categorization
- `PrismaClientInitializationError` - Connection/setup issues
- `PrismaClientKnownRequestError` - Query/constraint errors
- General database errors with context

## 📋 Best Practices

### Log Levels
- **INFO** - Normal operations, important events
- **SUCCESS** - Completed operations, achievements
- **WARN** - Non-critical issues, configuration problems
- **ERROR** - Failures requiring attention
- **DEBUG** - Development debugging (disabled in production)

### Context Information
Always include relevant context:
```typescript
logger.error('Operation failed', error, {
  userId: user.id,
  operation: 'user-update',
  timestamp: new Date().toISOString()
})
```

### Railway-Specific Considerations
- Use structured JSON for better Railway log parsing
- Include environment information in critical logs
- Leverage Railway environment variables for context
- Keep log messages concise but informative

## 🔍 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check Railway dashboard for configured variables
   - Verify `.env.example` matches required variables
   - Use environment validation script

2. **Database Connection Failures**
   - Check DATABASE_URL configuration
   - Verify Prisma binary targets for Railway
   - Monitor connection pool limits

3. **Authentication Errors**
   - Verify NEXTAUTH_SECRET is properly set
   - Check NEXTAUTH_URL matches Railway domain
   - Monitor authentication failure patterns

### Log Analysis
Use Railway log filtering:
```bash
# Filter by service
[SERVICE-NAME]

# Filter by log level
[ERROR]
[WARN]
[SUCCESS]

# Filter by operation
login-attempt
database-query
deployment
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Next.js Logging](https://nextjs.org/docs/advanced-features/debugging)
- [Prisma Logging](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/logging)

---

For detailed deployment instructions, see `RAILWAY_DEPLOYMENT.md`.
For general setup, see `DEPLOYMENT.md`.