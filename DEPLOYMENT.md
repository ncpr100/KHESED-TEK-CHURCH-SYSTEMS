# KHESED-TEK Church Systems - Deployment Guide

This guide will help you deploy the KHESED-TEK Church Systems application and resolve common configuration issues.

## Quick Fix for Current Deployment Issues

If you're seeing the errors shown in the GitHub issue screenshots, follow these steps:

### 1. Required Environment Variables

The application requires these environment variables to be set in your deployment environment:

```bash
# Essential Configuration (REQUIRED)
NEXTAUTH_SECRET="your-secure-32-character-secret"
NEXTAUTH_URL="https://your-actual-domain.com"
DATABASE_URL="postgresql://username:password@host:5432/database"
```

### 2. Generate Secure Values

#### NextAuth Secret
Generate a secure 32-character secret for `NEXTAUTH_SECRET`:

```bash
# Using OpenSSL (recommended)
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Online generator (for quick testing only)
# Visit: https://generate-secret.vercel.app/32
```

#### Example Values
```bash
NEXTAUTH_SECRET="K8x2vP9mN4qR7sT1wE5yU8iO3pA6dF9gH2jK5lM8nB1vC4xZ7wQ0eR3tY6uI9oP2"
NEXTAUTH_URL="https://khesed-tek-church-sy-up.railway.app"
DATABASE_URL="postgresql://postgres:password@db.railway.internal:5432/railway"
```

## Platform-Specific Instructions

### Railway
1. Go to your Railway project dashboard
2. Click on "Variables" tab
3. Add the required environment variables:
   - `NEXTAUTH_SECRET` = (your generated secret)
   - `NEXTAUTH_URL` = `https://your-app-name.railway.app`
   - `DATABASE_URL` = (your Railway PostgreSQL connection string)
4. Redeploy the application

### Vercel
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the required variables for Production, Preview, and Development
4. Redeploy from the Deployments tab

### Netlify
1. Go to Site settings → Environment variables
2. Add the required environment variables
3. Redeploy the site

### Docker/Self-hosted
Create a `.env` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env

# Edit with your values
nano .env
```

## Database Setup

### PostgreSQL
The application uses PostgreSQL. Ensure your database is accessible and the connection string is correct.

#### Railway PostgreSQL
```bash
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"
```

#### Local PostgreSQL
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/khesed_tek_db"
```

## Post-Deployment Verification

After setting environment variables and redeploying:

1. **Check Application Status**: Visit your domain to see if it loads
2. **Test Authentication**: Try accessing `/auth/signin`
3. **Check Logs**: Look for any remaining configuration errors
4. **Database Connection**: Verify the app can connect to your database

## Common Issues and Solutions

### Issue: "Please define a 'secret' in production"
**Solution**: Set the `NEXTAUTH_SECRET` environment variable

### Issue: "There is a problem with the server configuration"
**Solution**: Verify all required environment variables are set correctly

### Issue: Database connection errors
**Solution**: Check your `DATABASE_URL` and ensure the database is accessible

### Issue: OAuth/Authentication redirects fail
**Solution**: Ensure `NEXTAUTH_URL` matches your actual domain exactly

## Environment Variables Reference

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | JWT encryption secret | `K8x2vP9mN4qR7sT1wE5yU8i...` |
| `NEXTAUTH_URL` | Application base URL | `https://yourapp.railway.app` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |

### Optional Variables
| Variable | Description | Required For |
|----------|-------------|---------------|
| `SMTP_HOST` | Email server | Email notifications |
| `TWILIO_ACCOUNT_SID` | SMS service | SMS features |
| `STRIPE_SECRET_KEY` | Payment processing | Online donations |
| `GOOGLE_CLIENT_ID` | Google integration | Calendar sync |

## Security Checklist

- ✅ Generate a unique `NEXTAUTH_SECRET` (never reuse)
- ✅ Use HTTPS for production `NEXTAUTH_URL`
- ✅ Secure your database with strong credentials
- ✅ Don't commit secrets to version control
- ✅ Use environment-specific configurations

## Getting Help

If you continue to experience issues:

1. Check the application logs in your deployment platform
2. Verify all environment variables are set correctly
3. Ensure your database is running and accessible
4. Review this deployment guide step by step

The application includes built-in validation that will show helpful error messages if configuration is incorrect.

## Development Setup

For local development:

```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.