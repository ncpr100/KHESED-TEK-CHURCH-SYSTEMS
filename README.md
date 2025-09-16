# KHESED-TEK Church Management System

A comprehensive church management system built with Next.js, designed to help churches manage their congregations, events, communications, and operations efficiently.

## 🚀 Quick Deployment Fix

**If you're experiencing deployment errors like "Please define a 'secret' in production"**, follow these steps:

### 1. Set Required Environment Variables

Your deployment platform needs these essential variables:

```bash
NEXTAUTH_SECRET="your-secure-32-character-secret"
NEXTAUTH_URL="https://your-actual-domain.com"
DATABASE_URL="postgresql://username:password@host:5432/database"
```

### 2. Generate Secure Values

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Example output: K8x2vP9mN4qR7sT1wE5yU8iO3pA6dF9gH2jK5lM8nB1vC4xZ7wQ0eR3tY6uI9oP2
```

### 3. Platform-Specific Setup

- **Railway**: Go to Variables tab, add the environment variables, redeploy
- **Vercel**: Settings → Environment Variables, add for all environments
- **Netlify**: Site settings → Environment variables, redeploy

**📖 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

## 🚂 Railway Deployment & Logging

This system includes enhanced logging specifically designed for Railway deployments:

### Railway-Optimized Features
- **Structured logging** with Railway-friendly JSON context
- **Service-specific prefixes** for easy log filtering (🚂 RAILWAY, 🔍 INFO, ✅ SUCCESS, ❌ ERROR)
- **Automatic Railway environment detection** and configuration validation
- **Performance monitoring** with memory usage, uptime, and query tracking
- **Enhanced error handling** with detailed Prisma error categorization
- **Build information logging** with git commit tracking

### Quick Railway Setup
```bash
# Railway deployment with enhanced logging
npm run railway:build
npm run railway:start

# Test logging features
node scripts/demo-logger.js
```

**📊 For comprehensive Railway logging documentation, see [RAILWAY_LOGGING_GUIDE.md](./RAILWAY_LOGGING_GUIDE.md)**

## Features

- **Member Management**: Complete congregation database with profiles, contact information, and membership tracking
- **Event Management**: Schedule and manage church events, services, and activities
- **Communication Tools**: Send notifications via email, SMS, and in-app messages
- **Donation Management**: Track and manage financial contributions
- **Volunteer Coordination**: Organize and schedule volunteer activities
- **Reporting & Analytics**: Generate insights about church operations and growth
- **Website Builder**: Create and manage church websites
- **Social Media Integration**: Manage social media presence and engagement

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: Railway, Vercel, Netlify compatible

## Development Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ncpr100/KHESED-TEK-CHURCH-SYSTEMS.git
   cd KHESED-TEK-CHURCH-SYSTEMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```bash
   NEXTAUTH_SECRET="your-dev-secret-32-chars-long"
   NEXTAUTH_URL="http://localhost:3000"
   DATABASE_URL="postgresql://user:password@localhost:5432/khesed_db"
   ```

4. **Database setup**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Use the default admin credentials from the seed data

## Environment Validation

The application includes built-in environment validation:

```bash
# Check your configuration
npm run validate-env

# The build process automatically validates environment variables
npm run build
```

If configuration is missing, you'll see helpful error messages with setup instructions.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions including:

- Railway deployment
- Vercel deployment  
- Netlify deployment
- Docker deployment
- Environment variable setup
- Common troubleshooting

## Support

- **Documentation**: Check [DEPLOYMENT.md](./DEPLOYMENT.md) for setup help
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Environment Problems**: The app will show configuration errors with fix instructions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Need immediate deployment help?** Check the error message in your deployment logs and follow the environment setup guide in [DEPLOYMENT.md](./DEPLOYMENT.md).
