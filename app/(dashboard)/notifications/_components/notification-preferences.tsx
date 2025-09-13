
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { 
  Bell,
  BellOff,
  Mail,
  Smartphone,
  Clock,
  Calendar,
  Settings,
  Check,
  AlertTriangle,
  Info,
  Save,
  RefreshCw,
  Moon,
  Sun
} from 'lucide-react'
import { PushNotificationSettings } from '../../settings/notifications/_components/push-notification-settings'

interface NotificationPreferences {
  id?: string
  userId: string
  
  // Email Notifications
  emailEnabled: boolean
  emailEvents: boolean
  emailDonations: boolean
  emailCommunications: boolean
  emailSystemUpdates: boolean
  
  // In-App Notifications
  inAppEnabled: boolean
  inAppEvents: boolean
  inAppDonations: boolean
  inAppCommunications: boolean
  inAppSystemUpdates: boolean
  
  // Push Notifications (future)
  pushEnabled: boolean
  pushEvents: boolean
  pushDonations: boolean
  pushCommunications: boolean
  pushSystemUpdates: boolean
  
  // Timing Settings
  quietHoursEnabled: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  weekendNotifications: boolean
  
  // Frequency Settings
  digestEnabled: boolean
  digestFrequency: 'DAILY' | 'WEEKLY'
  
  // Metadata
  createdAt?: string
  updatedAt?: string
}

const NOTIFICATION_CATEGORIES = [
  {
    key: 'events',
    label: 'Eventos',
    description: 'Nuevos eventos, cambios de horario, recordatorios',
    icon: Calendar,
    color: 'text-blue-500'
  },
  {
    key: 'donations',
    label: 'Donaciones',
    description: 'Confirmaciones, recibos, campañas de donación',
    icon: Bell,
    color: 'text-green-500'
  },
  {
    key: 'communications',
    label: 'Comunicaciones',
    description: 'Anuncios, mensajes del pastor, noticias de la iglesia',
    icon: Mail,
    color: 'text-purple-500'
  },
  {
    key: 'systemUpdates',
    label: 'Sistema',
    description: 'Actualizaciones del sistema, mantenimiento, seguridad',
    icon: Settings,
    color: 'text-orange-500'
  }
]

export function NotificationPreferences() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalPreferences, setOriginalPreferences] = useState<NotificationPreferences | null>(null)

  useEffect(() => {
    fetchPreferences()
  }, [session])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notification-preferences')
      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
        setOriginalPreferences(data)
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
      toast.error('Error al cargar preferencias')
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return
    
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    
    // Check if there are changes
    const hasChanged = JSON.stringify(updated) !== JSON.stringify(originalPreferences)
    setHasChanges(hasChanged)
  }

  const savePreferences = async () => {
    if (!preferences || !hasChanges) return

    setSaving(true)
    try {
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        const updated = await response.json()
        setPreferences(updated)
        setOriginalPreferences(updated)
        setHasChanges(false)
        toast.success('Preferencias guardadas exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar preferencias')
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Error al guardar preferencias')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/notification-preferences', {
        method: 'DELETE',
      })

      if (response.ok) {
        const defaultPrefs = await response.json()
        setPreferences(defaultPrefs)
        setOriginalPreferences(defaultPrefs)
        setHasChanges(false)
        toast.success('Preferencias restablecidas a valores predeterminados')
      }
    } catch (error) {
      console.error('Error resetting preferences:', error)
      toast.error('Error al restablecer preferencias')
    } finally {
      setSaving(false)
    }
  }

  const validateQuietHours = (start?: string, end?: string) => {
    if (!start || !end) return true
    
    const startTime = new Date(`2000-01-01T${start}:00`)
    const endTime = new Date(`2000-01-01T${end}:00`)
    
    return startTime < endTime
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Cargando preferencias...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error al cargar preferencias</h3>
            <p className="text-muted-foreground mb-4">
              No se pudieron cargar tus preferencias de notificación.
            </p>
            <Button onClick={fetchPreferences} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Save Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Preferencias de Notificación</h2>
          <p className="text-muted-foreground">
            Controla cómo y cuándo recibir notificaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Cambios pendientes
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={saving}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Restablecer
          </Button>
          <Button
            onClick={savePreferences}
            disabled={!hasChanges || saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="delivery" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="delivery" className="gap-2 cursor-pointer">
            <Bell className="h-4 w-4" />
            Métodos de Entrega
          </TabsTrigger>
          <TabsTrigger value="push" className="gap-2 cursor-pointer">
            <Smartphone className="h-4 w-4" />
            Push Notifications
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Por Categorías
          </TabsTrigger>
          <TabsTrigger value="timing" className="gap-2 cursor-pointer">
            <Clock className="h-4 w-4" />
            Horarios
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2 cursor-pointer">
            <AlertTriangle className="h-4 w-4" />
            Avanzado
          </TabsTrigger>
        </TabsList>

        {/* Delivery Methods */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Notificaciones por Email
              </CardTitle>
              <CardDescription>
                Recibe notificaciones en tu correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Habilitar Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Activar todas las notificaciones por correo
                  </p>
                </div>
                <Switch
                  checked={preferences.emailEnabled}
                  onCheckedChange={(checked) => updatePreference('emailEnabled', checked)}
                />
              </div>

              {preferences.emailEnabled && (
                <div className="ml-4 space-y-3 border-l-2 border-muted pl-4">
                  {NOTIFICATION_CATEGORIES.map(category => {
                    const key = `email${category.key.charAt(0).toUpperCase() + category.key.slice(1)}` as keyof NotificationPreferences
                    const IconComponent = category.icon
                    
                    return (
                      <div key={category.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${category.color}`} />
                          <div>
                            <Label className="text-sm font-medium">{category.label}</Label>
                            <p className="text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences[key] as boolean}
                          onCheckedChange={(checked) => updatePreference(key, checked)}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-500" />
                Notificaciones en la App
              </CardTitle>
              <CardDescription>
                Recibe notificaciones directamente en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Habilitar In-App</Label>
                  <p className="text-sm text-muted-foreground">
                    Activar todas las notificaciones en la aplicación
                  </p>
                </div>
                <Switch
                  checked={preferences.inAppEnabled}
                  onCheckedChange={(checked) => updatePreference('inAppEnabled', checked)}
                />
              </div>

              {preferences.inAppEnabled && (
                <div className="ml-4 space-y-3 border-l-2 border-muted pl-4">
                  {NOTIFICATION_CATEGORIES.map(category => {
                    const key = `inApp${category.key.charAt(0).toUpperCase() + category.key.slice(1)}` as keyof NotificationPreferences
                    const IconComponent = category.icon
                    
                    return (
                      <div key={category.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-4 w-4 ${category.color}`} />
                          <div>
                            <Label className="text-sm font-medium">{category.label}</Label>
                            <p className="text-xs text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={preferences[key] as boolean}
                          onCheckedChange={(checked) => updatePreference(key, checked)}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Notifications */}
        <TabsContent value="push" className="space-y-6">
          <PushNotificationSettings />
        </TabsContent>

        {/* Category Settings */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {NOTIFICATION_CATEGORIES.map(category => {
              const emailKey = `email${category.key.charAt(0).toUpperCase() + category.key.slice(1)}` as keyof NotificationPreferences
              const inAppKey = `inApp${category.key.charAt(0).toUpperCase() + category.key.slice(1)}` as keyof NotificationPreferences
              const pushKey = `push${category.key.charAt(0).toUpperCase() + category.key.slice(1)}` as keyof NotificationPreferences
              const IconComponent = category.icon

              return (
                <Card key={category.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconComponent className={`h-5 w-5 ${category.color}`} />
                      {category.label}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <Label>Email</Label>
                      </div>
                      <Switch
                        checked={preferences.emailEnabled && (preferences[emailKey] as boolean)}
                        onCheckedChange={(checked) => updatePreference(emailKey, checked)}
                        disabled={!preferences.emailEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-green-500" />
                        <Label>In-App</Label>
                      </div>
                      <Switch
                        checked={preferences.inAppEnabled && (preferences[inAppKey] as boolean)}
                        onCheckedChange={(checked) => updatePreference(inAppKey, checked)}
                        disabled={!preferences.inAppEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-purple-500" />
                        <Label>Push (Futuro)</Label>
                      </div>
                      <Switch
                        checked={preferences.pushEnabled && (preferences[pushKey] as boolean)}
                        onCheckedChange={(checked) => updatePreference(pushKey, checked)}
                        disabled={!preferences.pushEnabled}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Timing Settings */}
        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-indigo-500" />
                Horas Silenciosas
              </CardTitle>
              <CardDescription>
                Define un período durante el cual no recibirás notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Habilitar Horas Silenciosas</Label>
                  <p className="text-sm text-muted-foreground">
                    Las notificaciones se pospondrán durante este período
                  </p>
                </div>
                <Switch
                  checked={preferences.quietHoursEnabled}
                  onCheckedChange={(checked) => updatePreference('quietHoursEnabled', checked)}
                />
              </div>

              {preferences.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 ml-4 border-l-2 border-muted pl-4">
                  <div className="space-y-2">
                    <Label htmlFor="quietStart">Hora de Inicio</Label>
                    <Input
                      id="quietStart"
                      type="time"
                      value={preferences.quietHoursStart || '22:00'}
                      onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quietEnd">Hora de Fin</Label>
                    <Input
                      id="quietEnd"
                      type="time"
                      value={preferences.quietHoursEnd || '08:00'}
                      onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                    />
                  </div>
                  {!validateQuietHours(preferences.quietHoursStart, preferences.quietHoursEnd) && (
                    <div className="col-span-2">
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        La hora de inicio debe ser anterior a la hora de fin
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                Configuración de Fin de Semana
              </CardTitle>
              <CardDescription>
                Controla las notificaciones durante los fines de semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Notificaciones de Fin de Semana</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibir notificaciones durante sábados y domingos
                  </p>
                </div>
                <Switch
                  checked={preferences.weekendNotifications}
                  onCheckedChange={(checked) => updatePreference('weekendNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-500" />
                Resumen Digest
              </CardTitle>
              <CardDescription>
                Recibe un resumen de notificaciones en lugar de notificaciones individuales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Habilitar Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Agrupa múltiples notificaciones en un solo mensaje
                  </p>
                </div>
                <Switch
                  checked={preferences.digestEnabled}
                  onCheckedChange={(checked) => updatePreference('digestEnabled', checked)}
                />
              </div>

              {preferences.digestEnabled && (
                <div className="ml-4 border-l-2 border-muted pl-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Frecuencia del Digest</Label>
                    <Select
                      value={preferences.digestFrequency}
                      onValueChange={(value: 'DAILY' | 'WEEKLY') => updatePreference('digestFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Diario</SelectItem>
                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {preferences.digestFrequency === 'DAILY' 
                        ? 'Recibirás un resumen diario de notificaciones'
                        : 'Recibirás un resumen semanal de notificaciones'
                      }
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-purple-500" />
                Notificaciones Push (Futuro)
              </CardTitle>
              <CardDescription>
                Configuración para futuras notificaciones móviles push
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Habilitar Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Disponible cuando se lance la aplicación móvil
                  </p>
                </div>
                <Switch
                  checked={preferences.pushEnabled}
                  onCheckedChange={(checked) => updatePreference('pushEnabled', checked)}
                  disabled={true}
                />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-500" />
                  <Label className="font-medium">Próximamente</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Las notificaciones push estarán disponibles con el lanzamiento 
                  de nuestra aplicación móvil. Mantén esta configuración preparada.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Resumen de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <Label className="font-medium">Email</Label>
              <p className={preferences.emailEnabled ? 'text-green-600' : 'text-red-600'}>
                {preferences.emailEnabled ? 'Habilitado' : 'Deshabilitado'}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="font-medium">In-App</Label>
              <p className={preferences.inAppEnabled ? 'text-green-600' : 'text-red-600'}>
                {preferences.inAppEnabled ? 'Habilitado' : 'Deshabilitado'}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="font-medium">Horas Silenciosas</Label>
              <p className={preferences.quietHoursEnabled ? 'text-blue-600' : 'text-gray-600'}>
                {preferences.quietHoursEnabled 
                  ? `${preferences.quietHoursStart || '22:00'} - ${preferences.quietHoursEnd || '08:00'}`
                  : 'Deshabilitado'
                }
              </p>
            </div>
            <div className="space-y-1">
              <Label className="font-medium">Digest</Label>
              <p className={preferences.digestEnabled ? 'text-blue-600' : 'text-gray-600'}>
                {preferences.digestEnabled 
                  ? preferences.digestFrequency === 'DAILY' ? 'Diario' : 'Semanal'
                  : 'Deshabilitado'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
