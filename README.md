# KHESED-TEK-CHURCH-SYSTEMS
CHURCH MANAGEMENT SYSTEM

## 🚀 Quick Deployment Setup

**Having deployment issues?** Check our comprehensive guides:
- 📖 [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete setup instructions
- 🔧 [Deployment Troubleshooting](./DEPLOYMENT_TROUBLESHOOTING.md) - Fix common errors

### Essential Environment Variables

The following environment variables are **required** for deployment:

```bash
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-here

# Your production domain
NEXTAUTH_URL=https://yourdomain.com

# PostgreSQL database connection
DATABASE_URL=postgresql://user:pass@host:port/database
```

### Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up database:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

### Production Deployment

1. Set environment variables in your deployment platform
2. Use `.env.production.example` as a reference
3. Run database migrations: `npx prisma migrate deploy`

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).
