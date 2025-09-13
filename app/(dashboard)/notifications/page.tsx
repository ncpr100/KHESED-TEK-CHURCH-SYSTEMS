
import { Metadata } from 'next'
import { NotificationsClient } from './_components/notifications-client'

export const metadata: Metadata = {
  title: 'Notificaciones | Kḥesed-tek',
  description: 'Gestión del sistema de notificaciones automatizadas',
}

export default function NotificationsPage() {
  return <NotificationsClient />
}
