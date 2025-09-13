

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DonationsClient } from './_components/donations-client'

export default async function DonationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <DonationsClient userRole={session.user.role} churchId={session.user.churchId || ''} />
  )
}

