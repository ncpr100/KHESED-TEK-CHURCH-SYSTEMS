
import { User, Church, Member, Sermon, UserRole } from "@prisma/client"

export type ExtendedUser = User & {
  church?: Church | null
}

export type ExtendedMember = Member & {
  church?: Church
  user?: User | null
}

export type ExtendedSermon = Sermon & {
  church?: Church
}

export interface DashboardStats {
  totalMembers: number
  totalSermons: number
  upcomingEvents: number
  newMembersThisMonth: number
}

export interface SermonGenerationRequest {
  topic: string
  scripture?: string
  audience?: string
  duration?: string
  language: 'es' | 'en'
}

export interface SermonGenerationResponse {
  outline: string
  introduction: string
  mainPoints: string[]
  conclusion: string
  bibleVerses: string[]
}

// NextAuth type extensions
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      churchId: string | null
      church?: Church | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
    churchId: string | null
    church?: Church | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    churchId: string | null
    church?: Church | null
  }
}

export { UserRole }
