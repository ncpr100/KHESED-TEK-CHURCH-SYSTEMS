
'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import SpiritualGiftsManagement from './_components/spiritual-gifts-management'

export default function SpiritualGiftsPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Cargando...</div>
  }

  if (!session) {
    redirect('/auth/signin')
  }

  return <SpiritualGiftsManagement />
}
