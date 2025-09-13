
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * CRITICAL SECURITY: Server-side role validation utility
 * This function MUST be called in all server components that require SUPER_ADMIN access
 * It prevents client-side token manipulation and ensures database role consistency
 */
export async function validateSuperAdminAccess() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    console.warn('🔒 SECURITY: No session found during SUPER_ADMIN validation')
    redirect('/auth/signin?error=no_session')
  }

  try {
    // Re-validate against database to prevent token manipulation
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        role: true, 
        isActive: true,
        email: true,
        name: true
      }
    })

    // Security checks
    if (!dbUser) {
      console.error(`🔒 CRITICAL SECURITY: User ${session.user.id} not found in database during validation`)
      redirect('/auth/signin?error=user_not_found')
    }

    if (!dbUser.isActive) {
      console.warn(`🔒 SECURITY: Inactive user ${dbUser.email} attempted SUPER_ADMIN access`)
      redirect('/auth/signin?error=account_inactive')
    }

    if (dbUser.role !== 'SUPER_ADMIN') {
      console.warn(`🔒 SECURITY: Unauthorized access attempt by user ${dbUser.email} with role ${dbUser.role}`)
      redirect('/home?error=access_denied')
    }

    // Additional security: Verify session token role matches database
    if (session.user.role !== dbUser.role) {
      console.error(`🔒 CRITICAL SECURITY: Role mismatch! Session: ${session.user.role}, Database: ${dbUser.role} for ${dbUser.email}`)
      redirect('/auth/signin?error=role_mismatch&message=Security validation failed')
    }

    return {
      user: dbUser,
      session: session
    }

  } catch (error) {
    console.error('🔒 SECURITY: Database validation error during SUPER_ADMIN check:', error)
    redirect('/auth/signin?error=validation_error')
  }
}

/**
 * CRITICAL SECURITY: Validates user role for any specific role requirement
 * Used for role-based access control validation
 */
export async function validateUserRole(requiredRole: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  try {
    const dbUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        role: true, 
        isActive: true,
        email: true 
      }
    })

    if (!dbUser || !dbUser.isActive || dbUser.role !== requiredRole) {
      console.warn(`🔒 SECURITY: Access denied for user ${session.user.email}. Required: ${requiredRole}, Has: ${dbUser?.role}`)
      redirect('/home?error=insufficient_permissions')
    }

    return dbUser
  } catch (error) {
    console.error('🔒 SECURITY: Role validation error:', error)
    redirect('/auth/signin?error=validation_error')
  }
}
