
'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChurchLogo } from '@/components/ui/church-logo'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  Settings,
  UserPlus,
  UserCheck,
  Phone,
  QrCode,
  Heart,
  DollarSign,
  MessageSquare,
  CalendarClock,
  Share2,
  Megaphone,
  BarChart3,
  TrendingUp,
  Globe,
  Shield,
  Palette,
  Bell,
  Zap,
  HelpCircle,
  Brain,
  Building2,
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Panel de Control',
    href: '/home',
    icon: LayoutDashboard,
    roles: ['ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'],
  },
  {
    title: 'Miembros',
    href: '/members',
    icon: Users,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Voluntarios',
    href: '/volunteers',
    icon: Heart,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Dones Espirituales',
    href: '/spiritual-gifts',
    icon: Brain,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Registro',
    href: '/check-ins',
    icon: UserCheck,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Seguimiento',
    href: '/follow-ups',
    icon: Phone,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Donaciones',
    href: '/donations',
    icon: DollarSign,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Asistente de Sermones',
    href: '/sermons',
    icon: BookOpen,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'],
  },
  {
    title: 'Muro de Oración',
    href: '/prayer-wall',
    icon: Heart,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Peticiones de Oración',
    href: '/prayer-requests',
    icon: MessageSquare,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Eventos',
    href: '/events',
    icon: Calendar,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Comunicaciones',
    href: '/communications',
    icon: MessageSquare,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Notificaciones',
    href: '/notifications',
    icon: Bell,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'],
  },
  {
    title: 'Reglas de Automatización',
    href: '/automation-rules',
    icon: Zap,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'],
  },
  {
    title: 'Redes Sociales',
    href: '/social-media',
    icon: Share2,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Campañas Marketing',
    href: '/marketing-campaigns',
    icon: Megaphone,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Analíticas',
    href: '/analytics',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Perspectivas Pastorales',
    href: '/business-intelligence',
    icon: TrendingUp,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'],
  },
  {
    title: 'Solicitar Sitio Web',
    href: '/website-requests',
    icon: Globe,
    roles: ['ADMIN_IGLESIA', 'PASTOR', 'LIDER'],
  },
  {
    title: 'Plataforma Admin',
    href: '/platform/dashboard',
    icon: Shield,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Perfil Personal',
    href: '/profile',
    icon: Settings,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'],
  },
  {
    title: 'Perfil de la Iglesia',
    href: '/settings/profile',
    icon: Building2,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'],
  },
  {
    title: 'Configuración de Plataforma',
    href: '/settings',
    icon: Settings,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Gestión de Permisos',
    href: '/settings/permissions',
    icon: Shield,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA'],
  },
  {
    title: 'Configuración de Plataforma (Tema)',
    href: '/settings/theme',
    icon: Palette,
    roles: ['SUPER_ADMIN'],
  },
  {
    title: 'Configuración de Notificaciones',
    href: '/settings/notifications',
    icon: Bell,
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'],
  },

  {
    title: 'Ayuda',
    href: '/help',
    icon: HelpCircle,
    roles: ['ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'],
  },
]

export function Sidebar() {
  const { data: session } = useSession() || {}
  const pathname = usePathname()

  const filteredItems = navigationItems.filter(item =>
    item.roles.includes(session?.user?.role as string)
  )

  return (
    <aside className="w-64 border-r bg-muted/40 p-6">
      {/* Church Branding Section */}
      <div className="mb-8 pb-4 border-b border-border">
        <ChurchLogo size="lg" />
      </div>
      
      <nav className="space-y-2">
        {filteredItems?.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground font-medium'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
