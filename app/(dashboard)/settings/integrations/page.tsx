
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { IntegrationsClient } from './_components/integrations-client'

export const metadata: Metadata = {
  title: 'Integraciones | Kḥesed-tek',
  description: 'Configuración de integraciones de comunicación',
}

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Only admins can access integrations
  if (!['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
    redirect('/dashboard')
  }

  return <IntegrationsClient userRole={session.user.role} />
}
