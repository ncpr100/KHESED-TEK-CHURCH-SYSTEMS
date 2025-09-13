

'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Settings,
  ChevronRight,
  Activity,
  Mail,
  Phone,
  MapPin,
  Crown,
  Lock,
  Globe,
  Database,
  BarChart3,
  Users,
  Save,
  Eye,
  EyeOff,
  Calendar,
  Building2,
  Key
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const SUPER_ADMIN_SETTINGS = [
  {
    title: 'Configuración de Sistema',
    description: 'Configuraciones avanzadas de la plataforma y sistema',
    href: '/platform/settings',
    icon: Settings,
    color: 'text-red-500',
    category: 'Sistema',
    badge: 'Admin'
  },
  {
    title: 'Gestión de Usuarios Globales',
    description: 'Administrar todos los usuarios de la plataforma',
    href: '/platform/users',
    icon: Users,
    color: 'text-blue-500',
    category: 'Usuarios',
    badge: null
  },
  {
    title: 'Analytics Avanzados',
    description: 'Métricas y análisis detallados de toda la plataforma',
    href: '/platform/analytics',
    icon: BarChart3,
    color: 'text-green-500',
    category: 'Analytics',
    badge: 'Pro'
  },
  {
    title: 'Gestión de Iglesias',
    description: 'Supervisar y administrar todas las iglesias',
    href: '/platform/churches',
    icon: Building2,
    color: 'text-purple-500',
    category: 'Iglesias',
    badge: null
  },
  {
    title: 'Configuración de Tema Global',
    description: 'Personalizar tema y apariencia para toda la plataforma',
    href: '/settings/theme',
    icon: Palette,
    color: 'text-pink-500',
    category: 'Personalización',
    badge: null
  },
  {
    title: 'Notificaciones del Sistema',
    description: 'Configurar alertas y notificaciones administrativas',
    href: '/settings/notifications',
    icon: Bell,
    color: 'text-orange-500',
    category: 'Notificaciones',
    badge: 'Nuevo'
  },
]

interface ProfileData {
  name: string
  email: string
  phone?: string
  bio?: string
  location?: string
  avatar?: string
}

export default function SuperAdminProfilePage() {
  const { data: session, update } = useSession() || {}
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    avatar: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: '',
        bio: 'Super Administrator de la Plataforma Kḥesed-tek',
        location: '',
        avatar: ''
      })
    }
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Save profile data to platform settings
      const response = await fetch('/api/platform/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        toast.success('Perfil actualizado exitosamente')
        setIsEditing(false)
        
        // Update the session if needed
        if (update) {
          await update({ name: profileData.name })
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar el perfil')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Error de conexión al guardar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Todos los campos de contraseña son requeridos')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las nuevas contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('La nueva contraseña debe ser diferente a la actual')
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Contraseña actualizada exitosamente')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswords({ current: false, new: false, confirm: false })
      } else {
        toast.error(result.error || 'Error al cambiar la contraseña')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Error de conexión al cambiar la contraseña')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const userInitials = profileData.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'SA'

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Perfil Super Administrador
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión completa de tu perfil y configuraciones avanzadas de la plataforma
          </p>
        </div>
        <Badge variant="default" className="bg-red-600 hover:bg-red-700">
          <Shield className="h-3 w-3 mr-1" />
          SUPER_ADMIN
        </Badge>
      </div>

      {/* Profile Overview */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </span>
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-blue-200">
                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      placeholder="Ingresa tu nombre completo"
                    />
                  ) : (
                    <p className="text-lg font-medium">{profileData.name || 'Nelson Castro'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="tu@email.com"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-gray-600">{profileData.email}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={profileData.phone || ''}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-gray-600">{profileData.phone || 'No especificado'}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={profileData.location || ''}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      placeholder="Ciudad, País"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-gray-600">{profileData.location || 'No especificado'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía / Descripción</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Describe tu rol y experiencia..."
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600">{profileData.bio || 'Super Administrator de la Plataforma Kḥesed-tek'}</p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">En línea</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Último acceso: Ahora</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings - Password Change */}
      <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Key className="h-5 w-5" />
            Configuración de Seguridad
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña Actual *</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  placeholder="Ingresa tu contraseña actual"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Mínimo 8 caracteres"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Repite la nueva contraseña"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-orange-200">
            <div className="text-sm text-orange-700">
              <p className="font-medium">Requisitos de contraseña:</p>
              <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                <li>Mínimo 8 caracteres</li>
                <li>Diferente de la contraseña actual</li>
                <li>Recomendado: Incluir mayúsculas, números y símbolos</li>
              </ul>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isChangingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cambiando...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Management */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Globe className="h-5 w-5" />
            Gestión de Información de Contacto
          </CardTitle>
          <CardDescription>
            Administra la información de contacto que aparece en el centro de ayuda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-700">
              <p className="font-medium">Configuración Disponible:</p>
              <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                <li>WhatsApp y números de contacto</li>
                <li>Emails de soporte técnico</li>
                <li>Horarios de atención</li>
                <li>Información empresarial y ubicación</li>
                <li>Sitio web corporativo</li>
              </ul>
            </div>
            <Button
              onClick={() => window.open('/platform/support-settings', '_blank')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Editar Información de Contacto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admin Settings Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Configuraciones Administrativas</h2>
          <Badge variant="outline" className="text-red-600 border-red-200">
            <Lock className="h-3 w-3 mr-1" />
            Acceso Restringido
          </Badge>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {SUPER_ADMIN_SETTINGS.map((setting) => {
            const IconComponent = setting.icon
            
            return (
              <Card key={setting.href} className="hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-0">
                  <a href={setting.href} className="block p-6 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors`}>
                          <IconComponent className={`h-6 w-6 ${setting.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                              {setting.title}
                            </h3>
                            {setting.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {setting.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            {setting.category}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </a>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* System Status */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            Estado del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">24</div>
              <div className="text-sm text-green-700">Iglesias Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-blue-700">Usuarios Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-purple-700">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">4.8/5</div>
              <div className="text-sm text-orange-700">Satisfacción</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Herramientas administrativas frecuentes para gestión rápida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="/platform/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Analytics
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/platform/users">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/platform/churches">
                <Building2 className="h-4 w-4 mr-2" />
                Ver Iglesias
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/platform/settings">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

