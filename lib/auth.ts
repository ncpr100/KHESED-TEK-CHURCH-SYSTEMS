
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "./db"
import { logger } from "./logger"
import bcrypt from "bcryptjs"

// Validate required environment variables
function validateEnvironment() {
  const requiredVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  }

  logger.railwayInfo('auth', 'Validating NextAuth environment configuration')

  const missing = Object.entries(requiredVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  Object.entries(requiredVars).forEach(([key, value]) => {
    logger.envValidation(key, value ? 'valid' : 'missing', value)
  })

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`
    logger.railwayError('auth', 'NextAuth configuration incomplete', new Error(error), {
      missingVars: missing,
      environment: process.env.NODE_ENV
    })
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error(error)
    } else {
      logger.warn('Using default values for development. Set proper values for production.', {
        service: 'auth',
        environment: 'development'
      })
    }
  } else {
    logger.success('All NextAuth environment variables configured correctly')
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
        logger.authOperation('login-attempt', credentials?.email, true, {
          hasEmail: !!credentials?.email,
          hasPassword: !!credentials?.password
        })
        
        if (!credentials?.email || !credentials?.password) {
          logger.authOperation('login-failed', credentials?.email, false, {
            reason: 'missing-credentials'
          })
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
            logger.authOperation('login-failed', credentials.email, false, {
              reason: 'user-not-found'
            })
            return null
          }

          if (!user.password) {
            logger.authOperation('login-failed', credentials.email, false, {
              reason: 'no-password-set'
            })
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            logger.authOperation('login-failed', credentials.email, false, {
              reason: 'invalid-password'
            })
            return null
          }

          logger.authOperation('login-success', credentials.email, true, {
            userId: user.id,
            role: user.role,
            churchId: user.churchId
          })
          
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
          if (error && typeof error === 'object' && 'name' in error) {
            const err = error as any
            if (err.name === 'PrismaClientInitializationError') {
              logger.railwayError('auth', 'Prisma client initialization failed during auth', error, {
                errorCode: err.errorCode,
                clientVersion: err.clientVersion,
                email: credentials.email
              })
            } else if (err.name === 'PrismaClientKnownRequestError') {
              logger.railwayError('auth', 'Prisma request error during auth', error, {
                code: err.code,
                meta: err.meta,
                email: credentials.email
              })
            } else {
              logger.railwayError('auth', 'Database error during authentication', error, {
                email: credentials.email
              })
            }
          } else {
            logger.railwayError('auth', 'Unknown error during authentication', error, {
              email: credentials.email
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
          logger.debug('JWT callback - creating token for user', {
            service: 'auth',
            email: user.email,
            userId: user.id
          })
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
        logger.railwayError('auth', 'JWT callback error', error, {
          hasUser: !!user,
          tokenId: token?.id
        })
        return token
      }
    },
    async session({ session, token }) {
      try {
        logger.debug('Session callback for user', {
          service: 'auth',
          email: session.user?.email,
          tokenId: token?.id
        })
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
        logger.railwayError('auth', 'Session callback error', error, {
          email: session.user?.email
        })
        return session
      }
    },
  }
}
