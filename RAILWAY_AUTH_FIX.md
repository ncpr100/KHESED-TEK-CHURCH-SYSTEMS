# Railway Authentication Fix Guide

## Problem Summary
After migrating to Railway, the application experiences:
- 401 authentication errors
- Database connection pool timeouts
- Missing super admin user credentials

## Root Cause
The migration to Railway caused:
1. **Missing Environment Variables**: Required auth variables not properly configured
2. **Database Connection Issues**: Prisma client not optimized for Railway
3. **Missing User Data**: Super admin user not migrated properly

## Solution Steps

### 1. Fix Environment Variables
Set these in Railway dashboard or via Railway CLI:

```bash
# Required for NextAuth
NEXTAUTH_SECRET=your-secure-secret-here
NEXTAUTH_URL=https://your-app.railway.app

# Database (Railway should auto-provide this)
DATABASE_URL=postgresql://username:password@host:port/database?connection_limit=20&pool_timeout=60&connect_timeout=30
```

### 2. Test Database Connection
Run the connection test script:

```bash
npm run test-railway-connection
```

### 3. Restore Super Admin User
The original credentials `soporte@khesed-tek.com` with password `Bendecido100%$$%` can be restored:

```bash
npm run restore-super-admin
```

### 4. Verify Authentication
After running the scripts:
1. Navigate to your app URL
2. Go to `/auth/signin`
3. Login with: `soporte@khesed-tek.com` / `Bendecido100%$$%`
4. Should redirect to dashboard successfully

## Prevention Measures

### 1. Database Optimization
The following optimizations are now applied automatically:
- Connection pooling: `connection_limit=20`
- Pool timeout: `pool_timeout=60`
- Connect timeout: `connect_timeout=30`

### 2. Enhanced Error Handling
- Better error logging for connection issues
- Graceful degradation in production
- Specific Railway error detection

### 3. Health Checks
- Database health check before authentication
- Connection pool monitoring
- Automatic retry logic

## Monitoring

### Check Application Health
```bash
# Test all critical components
npm run test-railway-connection
npm run validate-env
```

### Monitor Logs
Watch for these error patterns in Railway logs:
- `PrismaClientInitializationError`
- `Connection pool timeout (P2024)`
- `[NextAuth] Database unavailable`

## Emergency Recovery

If authentication still fails after following this guide:

1. **Create Temporary Admin**:
   ```bash
   npx tsx scripts/create-temp-super-admin.ts
   ```

2. **Check Railway Database Status**:
   - Go to Railway dashboard
   - Check database metrics
   - Verify connection limits

3. **Manual Database Verification**:
   ```bash
   railway connect
   \dt  -- List tables
   SELECT email, role, "isActive" FROM users WHERE role = 'SUPER_ADMIN';
   ```

## Support

If issues persist:
1. Check Railway service logs
2. Verify database plan limits
3. Consider upgrading Railway plan if on free tier
4. Review connection pool settings for your traffic