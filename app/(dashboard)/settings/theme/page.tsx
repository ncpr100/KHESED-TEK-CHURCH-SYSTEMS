
import { Metadata } from 'next'
import { ThemeSettingsClient } from './_components/theme-settings-client'

export const metadata: Metadata = {
  title: 'Configuración de Tema | Kḥesed-tek',
  description: 'Personaliza la apariencia y colores del sistema',
}

export default function ThemeSettingsPage() {
  return <ThemeSettingsClient />
}
