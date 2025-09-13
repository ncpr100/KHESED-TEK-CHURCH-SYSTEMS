
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/home',
  '/members',
  '/volunteers',
  '/donations',
  '/events',
  '/sermons',
  '/communications',
  '/reports',
  '/analytics',
  '/social-media',
  '/marketing-campaigns',
  '/business-intelligence',
  '/website-builder',
  '/settings',
  '/advanced-events',
  '/follow-ups',
  '/check-ins',
  '/platform'
];

// Rutas de API que requieren autenticación
const PROTECTED_API_ROUTES = [
  '/api/members',
  '/api/volunteers',
  '/api/donations',
  '/api/events',
  '/api/sermons',
  '/api/communications',
  '/api/reports',
  '/api/analytics',
  '/api/social-media',
  '/api/marketing-campaigns',
  '/api/business-intelligence',
  '/api/website-builder',
  '/api/permissions',
  '/api/roles-advanced',
  '/api/user-roles',
  '/api/user-permissions',
  '/api/platform'
];

// Mapeo de rutas a permisos requeridos
const ROUTE_PERMISSIONS = {
  '/members': { resource: 'members', action: 'read' },
  '/volunteers': { resource: 'volunteers', action: 'read' },
  '/donations': { resource: 'donations', action: 'read' },
  '/events': { resource: 'events', action: 'read' },
  '/sermons': { resource: 'sermons', action: 'read' },
  '/communications': { resource: 'communications', action: 'read' },
  '/reports': { resource: 'reports', action: 'read' },
  '/analytics': { resource: 'analytics', action: 'read' },
  '/social-media': { resource: 'social_media', action: 'read' },
  '/marketing-campaigns': { resource: 'marketing', action: 'read' },
  '/business-intelligence': { resource: 'analytics', action: 'read' },
  '/website-builder': { resource: 'website_builder', action: 'read' },
  '/settings': { resource: 'settings', action: 'read' },
  '/advanced-events': { resource: 'events', action: 'read' },
  '/follow-ups': { resource: 'communications', action: 'read' },
  '/check-ins': { resource: 'events', action: 'read' }
} as const;

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add compression headers
  if (request.headers.get('accept-encoding')?.includes('gzip')) {
    response.headers.set('content-encoding', 'gzip');
  }

  // Add cache headers for static assets
  if (request.nextUrl.pathname.startsWith('/api/files/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Add cache headers for API responses that don't change frequently
  if (request.nextUrl.pathname.startsWith('/api/social-media-metrics')) {
    response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  }

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Advanced Authorization for Phase 2
  const pathname = request.nextUrl.pathname;

  // Skip auth for public routes
  if (pathname.startsWith('/auth/') || 
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/auth/') ||
      pathname === '/' ||
      pathname === '/favicon.ico') {
    return response;
  }

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedApiRoute = PROTECTED_API_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isProtectedApiRoute) {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { error: 'No autorizado' },
          { status: 401 }
        );
      }
      
      // Redirect to signin for protected pages
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Platform routes are restricted to SUPER_ADMIN only
    if (pathname.startsWith('/platform')) {
      if (token.role !== 'SUPER_ADMIN') {
        if (isProtectedApiRoute) {
          return NextResponse.json(
            { error: 'Acceso denegado. Solo el SUPER_ADMIN puede acceder a la plataforma.' },
            { status: 403 }
          );
        }
        // Redirect non-SUPER_ADMIN users to their appropriate dashboard
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }

    // SUPER_ADMIN has access to everything (including church-level routes)
    if (token.role === 'SUPER_ADMIN') {
      return response;
    }

    // Check basic role permissions for specific routes
    const requiredPermission = ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS];
    
    if (requiredPermission) {
      const userRole = token.role as string;
      
      // Basic role check - this will be enhanced with the new permission system
      const hasAccess = checkBasicRoleAccess(userRole, requiredPermission.resource);
      
      if (!hasAccess) {
        if (isProtectedApiRoute) {
          return NextResponse.json(
            { error: 'Sin permisos para acceder a este recurso' },
            { status: 403 }
          );
        }
        
        // Redirect to unauthorized page or home
        return NextResponse.redirect(new URL('/home', request.url));
      }
    }
  }

  return response;
}

// Basic role access check (simplified for middleware)
function checkBasicRoleAccess(role: string, resource: string): boolean {
  const rolePermissions = {
    'ADMIN_IGLESIA': ['*'], // All resources
    'PASTOR': ['members', 'volunteers', 'donations', 'events', 'sermons', 'communications', 'reports', 'analytics'],
    'LIDER': ['members', 'volunteers', 'events', 'sermons', 'communications'],
    'MIEMBRO': ['events', 'sermons']
  } as const;

  const permissions = rolePermissions[role as keyof typeof rolePermissions] || [];
  return permissions.includes('*' as never) || permissions.includes(resource as never);
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
