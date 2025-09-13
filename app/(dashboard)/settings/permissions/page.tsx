
import { Metadata } from 'next'
import { PermissionsClient } from './_components/permissions-client'

export const metadata: Metadata = {
  title: 'Gestión de Permisos | Kḥesed-tek',
  description: 'Configuración avanzada de roles y permisos del sistema',
}

export default function PermissionsPage() {
  return <PermissionsClient />
}
