
import { Metadata } from 'next'
import { NotificationPreferences } from '../../notifications/_components/notification-preferences'

export const metadata: Metadata = {
  title: 'Configuración de Notificaciones | Kḥesed-tek',
  description: 'Configura tus preferencias de notificación',
}

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <NotificationPreferences />
    </div>
  )
}
