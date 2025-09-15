
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "./db"
import bcrypt from "bcryptjs"

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
        console.log('[NextAuth] Authorization attempt for:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials')
          return null
        }

        try {
          // Test database connection first
          await db.$connect()
          
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              church: true
            }
          })

          if (!user) {
            console.log('[NextAuth] User not found:', credentials.email)
            return null
          }

          if (!user.password) {
            console.log('[NextAuth] User has no password set:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('[NextAuth] Invalid password for:', credentials.email)
            return null
          }

          console.log('[NextAuth] Successful authentication for:', credentials.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            churchId: user.churchId,
            church: user.church
          }
        } catch (error) {
          // Provide more specific error logging for different types of database errors
          if (error.name === 'PrismaClientInitializationError') {
            console.error('[NextAuth] Prisma client initialization failed:', {
              message: error.message,
              errorCode: error.errorCode,
              clientVersion: error.clientVersion
            })
          } else if (error.name === 'PrismaClientKnownRequestError') {
            console.error('[NextAuth] Prisma request error:', {
              code: error.code,
              message: error.message,
              meta: error.meta
            })
          } else {
            console.error('[NextAuth] Database error during authentication:', {
              name: error.name,
              message: error.message,
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
