# 🔧 Deployment Troubleshooting Guide

This document addresses the specific deployment errors shown in your screenshots and provides step-by-step solutions.

## 🚨 Error: `[next-auth][error][NO_SECRET]`

### Screenshot Error Analysis
```
[next-auth][error][NO_SECRET]
https://next-auth.js.org/errors#no_secret Please define a 'secret' in production. t [MissingSecretError]: Please define a 'secret' in production.
```

### Root Cause
The `NEXTAUTH_SECRET` environment variable is missing or not properly set in your deployment environment.

### Solution Steps

#### 1. Generate a Secure Secret
```bash
# On your local machine or any Unix system
openssl rand -base64 32
```

This will output something like: `Xk7sP2vL9mN4qR8tU3wV6yB1cE5fH7jK9lM0nO2pQ4sT6uW8xZ`

#### 2. Set Environment Variables in Your Deployment Platform

**For Vercel:**
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables:
   ```
   NEXTAUTH_SECRET=Xk7sP2vL9mN4qR8tU3wV6yB1cE5fH7jK9lM0nO2pQ4sT6uW8xZ
   NEXTAUTH_URL=https://your-project.vercel.app
   DATABASE_URL=your-postgresql-connection-string
   ```

**For Netlify:**
1. Go to Site settings → Environment variables
2. Add the same variables as above

**For Railway:**
1. Go to your project → Variables
2. Add the environment variables

#### 3. Redeploy
After setting the environment variables, trigger a new deployment.

## 🔧 Error: Server Configuration Problems

### Screenshot Error Analysis
```
Error: There is a problem with the server configuration. Check the server logs for more information.
digest: '4070400096'
```

### Common Causes & Solutions

#### 1. Database Connection Issues
**Check your DATABASE_URL:**
```bash
# Correct format for PostgreSQL
DATABASE_URL=postgresql://username:password@host:port/database_name

# Example with Supabase
DATABASE_URL=postgresql://postgres:yourpassword@db.supabase.co:5432/postgres

# Example with Neon
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb
```

#### 2. Missing Prisma Client
Run these commands in your deployment environment or add them to your build process:
```bash
npx prisma generate
npx prisma migrate deploy
```

#### 3. Environment Variable Validation
Create a simple test API to verify your environment variables are loaded:

Create `/pages/api/test-env.js` (temporary):
```javascript
export default function handler(req, res) {
  const hasSecret = !!process.env.NEXTAUTH_SECRET;
  const hasDbUrl = !!process.env.DATABASE_URL;
  
  res.status(200).json({
    hasNextAuthSecret: hasSecret,
    hasDatabaseUrl: hasDbUrl,
    nodeEnv: process.env.NODE_ENV
  });
}
```

## 📋 Complete Environment Setup Checklist

### Essential Variables (Required)
- [ ] `NEXTAUTH_SECRET` - Generated with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your production domain (https://yourdomain.com)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NODE_ENV=production`

### Email Provider (Required - Choose One)
- [ ] **Mailgun** (Recommended):
  - `ENABLE_MAILGUN=true`
  - `MAILGUN_API_KEY=key-xxxxxxx`
  - `MAILGUN_DOMAIN=mg.yourdomain.com`
  - `MAILGUN_FROM_EMAIL=noreply@yourdomain.com`
- [ ] **Gmail** (Alternative):
  - `ENABLE_GMAIL=true`
  - `GMAIL_CLIENT_ID=your-client-id`
  - `GMAIL_CLIENT_SECRET=your-client-secret`
  - `GMAIL_REFRESH_TOKEN=your-refresh-token`

### Optional but Recommended
- [ ] `CRON_SECRET` - For scheduled tasks
- [ ] Twilio SMS configuration
- [ ] VAPID keys for push notifications

## 🔍 Debugging Steps

### 1. Check Build Logs
Look for these specific errors in your deployment logs:
- `Module not found` → Run `npm install`
- `Prisma client not found` → Run `npx prisma generate`
- `Database connection failed` → Check DATABASE_URL
- `Missing environment variable` → Set the required variables

### 2. Test Database Connection
Add this temporary API endpoint to test database connectivity:

Create `/pages/api/test-db.js`:
```javascript
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();
    await prisma.$disconnect();
    res.status(200).json({ status: 'Database connected successfully' });
  } catch (error) {
    res.status(500).json({ 
      status: 'Database connection failed', 
      error: error.message 
    });
  }
}
```

### 3. Verify Environment Variables
Check that your variables are properly set by logging them (temporarily):

```javascript
console.log('Environment check:', {
  hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
  hasDbUrl: !!process.env.DATABASE_URL,
  nextAuthUrl: process.env.NEXTAUTH_URL
});
```

## 🚀 Platform-Specific Instructions

### Vercel Deployment
1. **Environment Variables**: Project Settings → Environment Variables
2. **Build Command**: `npm run build` (default)
3. **Output Directory**: `.next` (default)
4. **Install Command**: `npm install` (default)

### Netlify Deployment
1. **Environment Variables**: Site settings → Environment variables
2. **Build Command**: `npm run build`
3. **Publish Directory**: `.next`
4. **Install Command**: `npm install`

### Railway Deployment
1. **Environment Variables**: Project → Variables tab
2. Railway auto-detects Next.js projects
3. Ensure PostgreSQL database is connected

## 🔄 Migration Commands

If you're setting up a new database, run these commands after deployment:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Optional: Seed database with initial data
npm run db:seed
```

## 🆘 Still Having Issues?

### Common Error Messages & Solutions

| Error Message | Solution |
|---------------|----------|
| `Module not found: Can't resolve '@prisma/client'` | Run `npx prisma generate` |
| `Environment variable not found: DATABASE_URL` | Set DATABASE_URL in your deployment platform |
| `Invalid NEXTAUTH_SECRET` | Generate new secret with `openssl rand -base64 32` |
| `Database connection failed` | Check DATABASE_URL format and database accessibility |
| `Build failed` | Check for TypeScript/ESLint errors, ensure all dependencies are installed |

### Getting Help
1. **Check deployment logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test database connection** separately
4. **Try a minimal deployment** with just the essential variables

### Contact Support
If issues persist:
- Email: soporte@khesedtek.com
- Include: deployment platform, error messages, and environment setup details

## 🎯 Quick Fix Summary

For the errors in your screenshots:

1. **Set NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   # Copy output to NEXTAUTH_SECRET environment variable
   ```

2. **Set NEXTAUTH_URL**:
   ```
   NEXTAUTH_URL=https://your-production-domain.com
   ```

3. **Set DATABASE_URL**:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```

4. **Redeploy** your application

5. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

This should resolve the deployment errors shown in your screenshots.