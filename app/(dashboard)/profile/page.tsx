
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  ChevronRight,
  Activity,
  Mail,
  Phone,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const USER_SETTINGS_SECTIONS = [
  {
    title: 'Configuración de Notificaciones',
    description: 'Controla cómo y cuándo recibir notificaciones de la iglesia',
    href: '/settings/notifications',
    icon: Bell,
    color: 'text-blue-500',
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'],
    badge: 'Nuevo'
  },
  {
    title: 'Configuración de Tema',
    description: 'Personaliza la apariencia y el tema de la plataforma',
    href: '/settings/theme',
    icon: Palette,
    color: 'text-purple-500',
    roles: ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER', 'MIEMBRO'],
    badge: null
  },
]

export default function ProfilePage() {
  const { data: session } = useSession() || {}

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  const filteredSections = USER_SETTINGS_SECTIONS.filter(section =>
    session?.user?.role && section.roles.includes(session.user.role)
  )

  const updatePasswordData = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validatePasswordForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = 'La contraseña actual es requerida'
    }

    if (!passwordData.newPassword.trim()) {
      errors.newPassword = 'La nueva contraseña es requerida'
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres'
    }

    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirma la nueva contraseña'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'La nueva contraseña debe ser diferente a la actual'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) return
    
    setPasswordLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar la contraseña')
      }

      toast.success('¡Contraseña cambiada exitosamente!')
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar la contraseña')
      if (error.message?.includes('contraseña actual')) {
        setPasswordErrors({ currentPassword: 'Contraseña actual incorrecta' })
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
          <p className="text-muted-foreground">
            Gestiona tu perfil personal y preferencias
          </p>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      {/* User Profile Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-medium">{session?.user?.name || 'Usuario'}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>
              {session?.user?.role && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {session.user.role}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Activo</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña Actual *</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => updatePasswordData('currentPassword', e.target.value)}
                    placeholder="••••••••"
                    className={passwordErrors.currentPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => updatePasswordData('newPassword', e.target.value)}
                    placeholder="••••••••"
                    className={passwordErrors.newPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
                )}
                <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => updatePasswordData('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={passwordErrors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={passwordLoading}
                className="w-full md:w-auto"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cambiando...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Personal Settings */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold mb-2">Configuraciones Personales</h2>
        
        {filteredSections.map((section) => {
          const IconComponent = section.icon
          
          return (
            <Card key={section.href} className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <Link href={section.href} className="block p-6 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-muted/50 group-hover:bg-muted`}>
                        <IconComponent className={`h-6 w-6 ${section.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium group-hover:text-primary transition-colors">
                            {section.title}
                          </h3>
                          {section.badge && (
                            <Badge variant="default" className="text-xs">
                              {section.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Configuraciones frecuentes para un acceso rápido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/settings/notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Gestionar Notificaciones
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="justify-start">
              <Link href="/settings/theme" className="gap-2">
                <Palette className="h-4 w-4" />
                Cambiar Tema
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>¿Necesitas Ayuda?</CardTitle>
          <CardDescription>
            Recursos para configurar tu experiencia personal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Configuración de Notificaciones</h4>
              <p className="text-muted-foreground">
                Controla qué notificaciones recibes, cuándo y por qué método (email, in-app). 
                Configura horas silenciosas y preferencias por categoría.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Personalización de Tema</h4>
              <p className="text-muted-foreground">
                Personaliza colores, fuentes y la apariencia general de la plataforma 
                según tus preferencias personales.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
