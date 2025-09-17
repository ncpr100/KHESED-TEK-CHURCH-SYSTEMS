# 🚂 Railway Deployment Setup Guide

This guide provides step-by-step instructions for deploying the KHESED-TEK Church Systems application to Railway.

## 🔧 Railway Environment Variables

Configure these environment variables in your Railway dashboard:

### Required Variables
```bash
# Authentication (CRITICAL)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-app-name.railway.app

# Database (CRITICAL - use Railway PostgreSQL connection string)
DATABASE_URL=postgresql://postgres:<password>@<host>:<port>/<database>?connection_limit=20&pool_timeout=60&connect_timeout=30

# Environment
NODE_ENV=production
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Railway Database URL Format
Use your Railway PostgreSQL add-on connection string and append the optimization parameters:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway?connection_limit=20&pool_timeout=60&connect_timeout=30
```

## 🚀 Deployment Commands

### Build Command
```bash
npm run railway:build
```

### Start Command  
```bash
npm run railway:start
```

## 📋 Pre-Deployment Checklist

- [ ] Railway PostgreSQL service is created and running
- [ ] All required environment variables are set
- [ ] NEXTAUTH_URL points to your Railway domain
- [ ] DATABASE_URL includes connection optimization parameters
- [ ] NEXTAUTH_SECRET is generated securely (not default value)

## 🔍 Validation Tools

### Test Railway Configuration
```bash
npm run validate-railway
```

### Test Database Connection
```bash
npm run railway:test-db
```

### Test Environment Setup
```bash
npm run validate-env
```

## 🐛 Common Issues & Solutions

### 1. Prisma Client Initialization Errors
**Problem**: `PrismaClientInitializationError` during deployment

**Solutions**:
- Ensure DATABASE_URL is correct and accessible
- Check Railway PostgreSQL service is running
- Verify connection optimization parameters are included
- Check Railway service logs for network issues

### 2. Connection Pool Timeouts (P2024)
**Problem**: `P2024` errors during high traffic

**Solutions**:
- Increase `connection_limit` parameter (default: 20)
- Increase `pool_timeout` parameter (default: 60)
- Check Railway database plan limits
- Monitor connection pool usage

### 3. Authentication Errors (401)
**Problem**: Users can't log in, getting 401 errors

**Solutions**:
- Verify NEXTAUTH_URL matches Railway domain exactly
- Ensure NEXTAUTH_SECRET is set and not default value
- Check database connectivity for user lookup
- Run super admin restore: `npm run restore-super-admin`

### 4. CORS Errors in Browser Console
**Problem**: Cross-origin request blocked

**Solutions**:
- Middleware automatically handles Railway domains
- Ensure NEXTAUTH_URL matches the domain being accessed
- Check browser console for specific CORS error details

### 5. Build Failures
**Problem**: Build fails during Railway deployment

**Solutions**:
- Database connection errors during build are expected and handled
- Environment variables must be set before build
- Check Railway build logs for specific error messages
- Ensure Prisma client can be generated

## 📊 Monitoring & Debugging

### Railway Logs
Monitor these log patterns:
```
✅ Railway environment validation passed!
✅ Prisma client generated successfully  
✅ Database connection established successfully
🚀 Ready for Railway deployment
```

### Error Patterns to Watch
```
❌ Missing required environment variable
❌ Prisma client initialization failed
❌ Connection pool timeout (P2024)
❌ Authentication error (401)
```

### Performance Metrics
- Connection pool usage
- Database query response times  
- Authentication success rate
- Error rate trends

## 🔄 Deployment Process

1. **Prepare Environment**
   ```bash
   # Set all required environment variables in Railway dashboard
   ```

2. **Deploy to Railway**
   ```bash
   # Railway will automatically run:
   # npm run railway:build  (build command)
   # npm run railway:start  (start command)
   ```

3. **Post-Deployment Verification**
   ```bash
   # Check logs for successful startup
   # Test authentication at /auth/signin
   # Verify database connectivity
   # Test core application features
   ```

4. **Initialize Super Admin (if needed)**
   ```bash
   # If authentication fails, restore super admin:
   railway run npm run restore-super-admin
   ```

## 🔒 Security Best Practices

- Use Railway-generated secrets for NEXTAUTH_SECRET
- Ensure NEXTAUTH_URL uses HTTPS in production
- Database credentials should be Railway-managed
- Monitor Railway security advisories
- Regularly rotate authentication secrets

## 🆘 Support & Troubleshooting

If you encounter issues:

1. Check Railway deployment logs
2. Run validation scripts locally with Railway environment variables
3. Verify environment variable configuration
4. Test database connectivity separately
5. Check Railway service status and limits

For additional support, refer to:
- Railway documentation
- Next.js deployment guides
- Prisma Railway deployment docs
- KHESED-TEK support channels