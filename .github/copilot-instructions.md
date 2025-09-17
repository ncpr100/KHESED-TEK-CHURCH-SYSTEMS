# KHESED-TEK Church Systems - AI Coding Agent Instructions

## Architecture Overview

This is a **multi-tenant church management system** built with Next.js 14, Prisma ORM, and PostgreSQL. Each church operates as an isolated tenant with comprehensive management capabilities.

### Core Stack
- **Frontend**: Next.js 14 App Router, React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes with Railway-optimized Prisma client
- **Database**: PostgreSQL with 50+ models (see `prisma/schema.prisma`)
- **Auth**: NextAuth.js with role-based access control (SUPER_ADMIN, ADMIN_IGLESIA, PASTOR, LIDER, MIEMBRO)
- **Deployment**: Railway with connection pooling optimization

### Multi-Tenant Architecture
- `Church` model is the tenant root - all other models relate to a specific church
- Role hierarchy: SUPER_ADMIN (platform) → ADMIN_IGLESIA (church) → PASTOR → LIDER → MIEMBRO
- Middleware handles tenant isolation and role-based route protection (`middleware.ts`)

## Critical Development Workflows

### Environment Setup
**Always run validation before starting:**
```bash
npm run validate-env  # Shows missing variables with examples
```

**Required variables** (auto-validated on build):
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your domain or `http://localhost:3000`
- `DATABASE_URL`: PostgreSQL with Railway optimization

### Database Operations
```bash
npx prisma generate        # After schema changes
npx prisma migrate dev     # Create migrations
npm run restore-super-admin # Create default admin user
```

### Railway Deployment
- Uses `railway:build` and `railway:start` scripts
- Auto-optimizes DATABASE_URL with connection pooling parameters
- Built-in health checks and retry logic in `lib/db.ts`

## Project-Specific Patterns

### API Route Structure
```typescript
// Standard pattern in /app/api/[resource]/route.ts
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  
  const { searchParams } = new URL(req.url)
  const churchId = searchParams.get('churchId') // Multi-tenant filtering
  
  // Prisma query with church isolation
  const data = await db.resource.findMany({
    where: { churchId }
  })
  
  return NextResponse.json(data)
}
```

### Component Patterns
- UI components in `components/ui/` (Radix-based)
- Feature components in `components/[feature]/`
- Platform admin components in `components/platform/`
- **Spanish UI text** - all user-facing text is in Spanish

### Role-Based Access
```typescript
// Check permissions in API routes
import { checkUserPermissions } from '@/lib/permissions'

const hasAccess = await checkUserPermissions(session.user.id, 'members', 'read', churchId)
```

### Database Connection Optimization
The `lib/db.ts` uses Railway-specific optimizations:
- Connection pooling with retry logic
- Pool exhaustion recovery
- Health monitoring functions

## Integration Points

### Email/SMS Communications
- **Templates**: `components/email-templates/` and `app/api/communication-templates/`
- **Providers**: Mailgun, SMTP, Twilio SMS, WhatsApp Business
- **Configuration**: Church-specific in `integrations/` components

### Payment Processing
- Stripe integration for donations (`app/api/donations/`, `app/donate/`)
- Recurring donation support
- Campaign-based fundraising

### Automation Engine
- **Location**: `lib/automation-engine.ts`, `app/api/automations/`
- **Features**: Visitor follow-up, communication sequences, event reminders
- **Configuration**: Church-specific automation rules

### Social Media Integration
- Facebook, Instagram, Twitter APIs
- Post scheduling and metrics tracking
- Campaign management in `app/api/marketing-campaigns/`

## Key Files for Understanding

### Core Architecture
- `app/layout.tsx` - App shell with authentication providers
- `middleware.ts` - Route protection and tenant isolation
- `lib/auth.ts` - NextAuth configuration with environment validation
- `lib/db.ts` - Railway-optimized Prisma client
- `prisma/schema.prisma` - Complete data model (start here for understanding relationships)

### Feature Examples
- `app/api/members/route.ts` - Standard CRUD API pattern
- `components/integrations/gmail-config.tsx` - OAuth integration pattern
- `app/platform/help/manual/check-ins/page.tsx` - Complex UI with Spanish text
- `lib/services/visitor-automation.ts` - Automation engine usage

### Deployment & Environment
- `scripts/validate-env.js` - Environment validation with helpful errors
- `scripts/validate-fix.ts` - Deployment verification
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `.env.example` - All configuration options

## Development Commands

```bash
npm run dev                    # Development server
npm run validate-env          # Check environment configuration
npm run validate-fix          # Verify deployment readiness
npm run restore-super-admin   # Create admin user
npm run test-railway-connection # Test Railway database
```

## Debugging Tips

1. **Auth issues**: Check `middleware.ts` logs and verify NEXTAUTH_SECRET
2. **Database issues**: Use `npm run test-railway-connection`
3. **Build failures**: Environment validation runs automatically - check error messages
4. **Role access**: Platform routes require SUPER_ADMIN, others check church-level roles
5. **Spanish text**: All user-facing components use Spanish - maintain consistency

## Common Anti-Patterns to Avoid

- Don't bypass church-level tenant isolation in queries
- Don't hardcode English text in user-facing components
- Don't skip environment validation in new API routes
- Don't create direct database connections - use the optimized `db` export
- Don't ignore role-based access patterns in new routes

This system prioritizes church workflow optimization, multi-language support, and Railway deployment reliability.