

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { VolunteersClient } from './_components/volunteers-client'

export default async function VolunteersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <VolunteersClient userRole={session.user.role} churchId={session.user.churchId || ''} />
  )
}

