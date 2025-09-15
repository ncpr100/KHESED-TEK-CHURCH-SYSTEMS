# 🚀 Deployment Guide - Khesed-tek Church Systems

This guide will help you resolve deployment errors and properly configure your environment variables for successful deployment.

## 🚨 Common Deployment Errors & Solutions

### Error: `[next-auth][error][NO_SECRET]`

**Problem**: Missing `NEXTAUTH_SECRET` environment variable.

**Solution**: 
1. Generate a secure secret: `openssl rand -base64 32`
2. Add it to your deployment environment variables
3. Set `NEXTAUTH_URL` to your production domain

### Error: Database Connection Issues

**Problem**: Missing or incorrect `DATABASE_URL`.

**Solution**:
1. Ensure PostgreSQL database is accessible
2. Use correct connection string format
3. Run database migrations: `npx prisma migrate deploy`

## 📋 Required Environment Variables

### ✅ Critical (Must be set for deployment to work)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Generated with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production URL | `https://yoursite.vercel.app` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### 📧 Email Provider (Choose one)

#### Mailgun (Recommended)
```env
DEFAULT_EMAIL_PROVIDER=mailgun
ENABLE_MAILGUN=true
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.com
MAILGUN_FROM_EMAIL=noreply@your-domain.com
FROM_EMAIL=noreply@your-domain.com
FROM_NAME=Your Church Name
```

#### Gmail (Alternative)
```env
DEFAULT_EMAIL_PROVIDER=gmail
ENABLE_GMAIL=true
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_FROM_EMAIL=your-email@gmail.com
```

### 📱 SMS Provider (Optional but recommended)

#### Twilio
```env
DEFAULT_SMS_PROVIDER=twilio
ENABLE_TWILIO_SMS=true
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🏗️ Platform-Specific Setup

### Vercel Deployment

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add the following variables:**

```env
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-project.vercel.app
DATABASE_URL=your-postgresql-connection-string
```

4. **Add email provider variables (choose Mailgun or Gmail)**
5. **Redeploy your application**

### Netlify Deployment

1. **Go to Site settings → Environment variables**
2. **Add the same variables as listed for Vercel**
3. **Trigger a new deployment**

### Railway/Render/Other Platforms

1. **Find the Environment Variables section in your platform**
2. **Add all required variables from the list above**
3. **Ensure your DATABASE_URL points to an accessible PostgreSQL instance**

## 🔧 Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/ncpr100/KHESED-TEK-CHURCH-SYSTEMS.git
cd KHESED-TEK-CHURCH-SYSTEMS
```

2. **Install dependencies**
```bash
npm install
```

3. **Copy environment template**
```bash
cp .env.example .env.local
```

4. **Edit .env.local with your values**
```bash
# Minimum required for development
NEXTAUTH_SECRET=development-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@localhost:5432/khesed_tek_dev
```

5. **Set up database**
```bash
npx prisma migrate dev
npx prisma generate
```

6. **Start development server**
```bash
npm run dev
```

## 🗄️ Database Setup

### PostgreSQL Setup Options

#### 1. Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database
createdb khesed_tek_dev

# Update .env.local
DATABASE_URL=postgresql://username:password@localhost:5432/khesed_tek_dev
```

#### 2. Cloud Database (Recommended for production)

**Supabase** (Free tier available):
1. Create account at supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Use in `DATABASE_URL`

**Neon** (Free tier available):
1. Create account at neon.tech
2. Create database
3. Copy connection string
4. Use in `DATABASE_URL`

### Run Migrations
```bash
# Apply database schema
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Optional: Seed database
npm run db:seed
```

## 🔐 Security Best Practices

### Generate Secure Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate CRON_SECRET
openssl rand -hex 32

# Generate VAPID keys for push notifications
npx web-push generate-vapid-keys
```

### Environment Variable Security
- ✅ Never commit `.env.local` or `.env` files
- ✅ Use strong, unique secrets for production
- ✅ Rotate secrets periodically
- ✅ Use different secrets for different environments
- ❌ Don't use development secrets in production

## 🧪 Testing Your Deployment

### 1. Build Test
```bash
npm run build
```

### 2. Database Connection Test
```bash
npx prisma db pull
```

### 3. Access Test
1. Visit your deployed URL
2. Try to sign in (should reach login page without errors)
3. Check that database operations work

## 📞 Support

If you encounter issues:

1. **Check the deployment logs** for specific error messages
2. **Verify all required environment variables** are set
3. **Test database connectivity** separately
4. **Review this guide** for any missed steps

### Common Error Solutions

| Error | Solution |
|-------|----------|
| `Cannot find module '@prisma/client'` | Run `npx prisma generate` |
| `Environment variable not found: DATABASE_URL` | Add DATABASE_URL to your environment |
| `Invalid DATABASE_URL` | Check PostgreSQL connection string format |
| `NEXTAUTH_SECRET not set` | Generate and set NEXTAUTH_SECRET |
| `Module not found` errors | Run `npm install` |

## 🔄 Update Process

When updating the application:

1. **Pull latest changes**
2. **Run `npm install`** for new dependencies
3. **Run `npx prisma migrate deploy`** for database updates
4. **Check for new environment variables** in `.env.example`
5. **Redeploy** your application

---

## Quick Start Checklist

- [ ] Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Set `DATABASE_URL` to your PostgreSQL connection string
- [ ] Configure at least one email provider (Mailgun recommended)
- [ ] Run database migrations (`npx prisma migrate deploy`)
- [ ] Deploy and test

**Need help?** Contact support at soporte@khesedtek.com