

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CheckInsClient } from './_components/check-ins-client'

export default async function CheckInsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <CheckInsClient userRole={session.user.role} churchId={session.user.churchId || ''} />
  )
}

