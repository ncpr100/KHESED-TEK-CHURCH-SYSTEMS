

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { QualificationSettingsClient } from './_components/qualification-settings-client'

export default async function QualificationSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return (
    <QualificationSettingsClient userRole={session.user.role} churchId={session.user.churchId || ''} />
  )
}
