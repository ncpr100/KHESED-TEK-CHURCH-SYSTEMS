
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  BarChart3,
  Settings,
  ArrowLeft,
  Shield,
  Book,
  MessageCircle,
  Globe,
  FileText,
  Key
} from 'lucide-react'

const navigation = [
  { name: 'Panel de Control', href: '/platform/dashboard', icon: LayoutDashboard },
  { name: 'Iglesias', href: '/platform/churches', icon: Building2 },
  { name: 'Usuarios', href: '/platform/users', icon: Users },
  { name: 'Facturas', href: '/platform/invoices', icon: FileText },
  { name: 'Credenciales', href: '/platform/tenant-credentials', icon: Key },
  { name: 'Servicios Web', href: '/platform/website-services', icon: Globe },
  { name: 'Analytics', href: '/platform/analytics', icon: BarChart3 },
  { name: 'Mi Perfil', href: '/platform/profile', icon: User },
  { name: 'Configuración', href: '/platform/settings', icon: Settings },
  { name: 'Config. Soporte', href: '/platform/support-settings', icon: MessageCircle },
  { name: 'Documentación', href: '/platform/help', icon: Book },
]

export function PlatformSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold">Kḥesed-tek</h1>
            <p className="text-xs text-gray-400">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Back to Platform Dashboard */}
      <div className="p-4 border-t border-gray-700">
        <Link
          href="/platform/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Panel Principal
        </Link>
      </div>
    </div>
  )
}
