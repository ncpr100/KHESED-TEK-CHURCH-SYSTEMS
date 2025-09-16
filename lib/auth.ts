
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db, checkDatabaseHealth } from "./db"
import * as bcrypt from "bcryptjs"

// Validate required environment variables
function validateEnvironment() {
  const requiredVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  }

  const missing = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`
    console.error('[NextAuth Configuration Error]', error)
    console.error('Please check the .env.example file and DEPLOYMENT.md for setup instructions')
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error)
    } else {
      console.warn('[NextAuth Warning] Using default values for development. Set proper values for production.')
    }
  }
}

// Validate environment on import
validateEnvironment()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-change-in-production' : undefined),
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const authAttemptId = Math.random().toString(36).substring(7)
        console.log(`[NextAuth:${authAttemptId}] Authorization attempt for:`, credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log(`[NextAuth:${authAttemptId}] Missing credentials`)
          return null
        }

        try {
          // Check database health before attempting authentication
          console.log(`[NextAuth:${authAttemptId}] Checking database health...`)
          const healthCheck = await checkDatabaseHealth()
          
          if (!healthCheck.healthy) {
            console.error(`[NextAuth:${authAttemptId}] Database health check failed:`, healthCheck.message)
            console.error(`[NextAuth:${authAttemptId}] Error code: ${healthCheck.code || 'Unknown'}`)
            
            // Enhanced error handling for Railway database issues
            if (healthCheck.code === 'P2024') {
              console.error(`[NextAuth:${authAttemptId}] Connection pool timeout detected - Railway database may be overloaded`)
            }
            
            // In production, we might want to return a specific error or retry
            if (process.env.NODE_ENV === 'production') {
              console.error(`[NextAuth:${authAttemptId}] Production mode: Database unavailable, rejecting authentication`)
              return null
            }
          } else {
            console.log(`[NextAuth:${authAttemptId}] Database health check passed`)
          }
          
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              church: true
            }
          })

          if (!user) {
            console.log(`[NextAuth:${authAttemptId}] User not found:`, credentials.email)
            return null
          }

          if (!user.password) {
            console.log(`[NextAuth:${authAttemptId}] User has no password set:`, credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log(`[NextAuth:${authAttemptId}] Invalid password for:`, credentials.email)
            return null
          }

          console.log(`[NextAuth:${authAttemptId}] Successful authentication for:`, credentials.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            churchId: user.churchId,
            church: user.church
          }
        } catch (error: any) {
          // Enhanced error logging with specific handling for different error types
          const errorInfo = {
            attemptId: authAttemptId,
            email: credentials.email,
            timestamp: new Date().toISOString(),
            errorName: error.name,
            errorMessage: error.message,
            errorCode: error.code || error.errorCode,
          }

          if (error.name === 'PrismaClientInitializationError') {
            console.error(`[NextAuth:${authAttemptId}] Prisma client initialization failed:`, {
              ...errorInfo,
              clientVersion: error.clientVersion,
              errorCode: error.errorCode
            })
            
            // Log specific Railway connection issues
            if (error.message?.includes('connection pool') || error.errorCode === 'P2024') {
              console.error(`[NextAuth:${authAttemptId}] Connection pool issue detected - this may indicate Railway database limits`)
            }
            
          } else if (error.name === 'PrismaClientKnownRequestError') {
            console.error(`[NextAuth:${authAttemptId}] Prisma request error:`, {
              ...errorInfo,
              meta: error.meta
            })
            
          } else if (error.code === 'P2024') {
            console.error(`[NextAuth:${authAttemptId}] Connection pool timeout (P2024):`, {
              ...errorInfo,
              recommendation: 'Consider increasing connection pool size or reducing concurrent requests'
            })
            
          } else {
            console.error(`[NextAuth:${authAttemptId}] Database error during authentication:`, {
              ...errorInfo,
              stack: process.env.NODE_ENV === 'development' ? error.stack : 'Stack trace hidden in production'
            })
          }
          
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          console.log('[NextAuth] JWT callback - creating token for user:', user.email)
          return {
            ...token,
            id: user.id,
            role: user.role,
            churchId: user.churchId,
            church: user.church,
          }
        }
        return token
      } catch (error) {
        console.error('[NextAuth] JWT callback error:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        console.log('[NextAuth] Session callback for user:', session.user?.email)
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            role: token.role,
            churchId: token.churchId,
            church: token.church,
          }
        }
      } catch (error) {
        console.error('[NextAuth] Session callback error:', error)
        return session
      }
    },
  }
}
