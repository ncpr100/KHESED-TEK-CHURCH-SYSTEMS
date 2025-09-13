
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SmartEventsClient } from './_components/smart-events-client'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (!['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)) {
    redirect('/home')
  }

  return (
    <SmartEventsClient 
      userRole={session.user.role} 
      churchId={session.user.churchId || ''} 
    />
  )
}
