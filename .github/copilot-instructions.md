# Kḥesed-tek Church Management System

Kḥesed-tek is a comprehensive Next.js 14.2.28-based Church Management System with TypeScript, PostgreSQL database using Prisma ORM, and modern React ecosystem components. The application provides extensive church management features including member management, donations, events, communications, and analytics.

**ALWAYS reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Setup
- **Node.js**: v20.19.5 is pre-installed and working
- **Install dependencies**: `npm install` -- takes 70 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- **Database setup required**: PostgreSQL database must be configured with `DATABASE_URL` environment variable
- **Prisma validation**: `DATABASE_URL="postgresql://user:password@localhost:5432/khesed_tek" npx prisma validate` to test schema

### Build and Development
- **Development server**: `npm run dev` -- starts in 1.5 seconds on http://localhost:3000
- **Production build**: `npm run build` -- takes 90 seconds. NEVER CANCEL. Set timeout to 180+ seconds.
- **Production start**: `npm start` -- starts in 300ms after successful build
- **Type checking**: `npx tsc --noEmit` -- has known TypeScript errors in members and search components
- **Linting**: `npm run lint` -- currently has ESLint configuration issues, use with caution

### Database Operations
- **Prisma schema**: Located at `prisma/schema.prisma` with comprehensive church management models
- **Migrations**: Available in `prisma/migrations/`
- **Seed scripts**: `scripts/seed.ts` and `scripts/seed-spiritual-gifts.ts`
- **Database setup**: Requires PostgreSQL with proper `DATABASE_URL` environment variable

### Key Project Structure
- **App Router**: Uses Next.js 14 App Router pattern in `app/` directory
- **API Routes**: Extensive API in `app/api/` with 95+ endpoint directories
- **Components**: Modular components in `components/` using Radix UI and Tailwind CSS
- **Authentication**: NextAuth.js with middleware for route protection
- **Styling**: Tailwind CSS with custom configuration in `tailwind.config.ts`

## Validation

### Critical Build Requirements
- **NEVER CANCEL** any build or install commands - they may take up to 3 minutes
- **Build succeeds** despite TypeScript errors due to `next.config.js` settings that ignore build errors
- **Development server works** without database connection for UI development
- **Production build requires** prior `npm run build` completion

### Manual Testing Scenarios
After making changes, ALWAYS test:
1. **Login flow**: Navigate to http://localhost:3000 and verify Spanish login interface displays
2. **API endpoints**: Test API routes under `/api/` for church management features
3. **Database connectivity**: Ensure Prisma operations work with proper `DATABASE_URL`
4. **UI responsiveness**: Application uses responsive Tailwind CSS design
5. **Authentication**: Middleware protects routes like `/members`, `/donations`, `/events`

### Environment Setup
- **Required**: `DATABASE_URL` for PostgreSQL connection
- **Optional**: Various service integrations (Twilio, Mailgun, social media APIs)
- **Development**: Application runs without database for UI-only testing
- **Production**: Full database setup required for complete functionality

## Common Tasks

### Development Workflow
1. `npm install` (if node_modules missing)
2. `npm run dev` for development
3. Navigate to http://localhost:3000 for testing
4. `npm run build` before production deployment

### Database Management
```bash
# Validate schema (requires DATABASE_URL)
DATABASE_URL="your_db_url" npx prisma validate

# Generate Prisma client
npx prisma generate

# Run migrations (when database is available)
npx prisma migrate dev

# Seed database (when database is available)
npx prisma db seed
```

### Common File Locations
- **Main app**: `app/page.tsx` (login page)
- **Layout**: `app/layout.tsx`
- **API routes**: `app/api/*/route.ts`
- **Components**: `components/` with extensive UI components
- **Database schema**: `prisma/schema.prisma`
- **Middleware**: `middleware.ts` (authentication and route protection)
- **Styles**: `app/globals.css` and Tailwind configuration

### Troubleshooting
- **ESLint errors**: Configuration issues exist, may need manual fixing
- **TypeScript errors**: Known issues in members and search components, builds still succeed
- **Database errors**: Ensure `DATABASE_URL` is properly set in environment
- **Build cache**: No build cache configured, builds will always be full rebuilds

## Technology Stack
- **Framework**: Next.js 14.2.28 with App Router
- **Language**: TypeScript 5.2.2
- **Database**: PostgreSQL with Prisma 6.7.0
- **UI**: React 18.2.0 with Radix UI components
- **Styling**: Tailwind CSS 3.3.3
- **Authentication**: NextAuth.js 4.24.11
- **Validation**: Zod 3.23.8 and Yup 1.3.0
- **Forms**: React Hook Form 7.53.0

## Performance Notes
- **Initial load**: Application loads with Spanish login interface
- **Bundle size**: Large application with 150+ page routes
- **Development**: Fast development server startup (1.5s)
- **Build time**: Moderate build time (90s) due to application complexity
- **Runtime**: Optimized Next.js production build with code splitting