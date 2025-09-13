
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { usePushNotifications, usePushNotificationStats } from '@/hooks/use-push-notifications'
import { 
  Bell, 
  BellOff, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Settings,
  TestTube,
  BarChart3
} from 'lucide-react'

export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    showTestNotification
  } = usePushNotifications()

  const { stats } = usePushNotificationStats()
  const [testLoading, setTestLoading] = useState(false)

  const handleTestNotification = async () => {
    setTestLoading(true)
    try {
      await showTestNotification()
    } finally {
      setTestLoading(false)
    }
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: 'Permitido',
          variant: 'default' as const
        }
      case 'denied':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: 'Denegado',
          variant: 'destructive' as const
        }
      case 'default':
        return {
          icon: <Info className="h-4 w-4 text-yellow-500" />,
          text: 'Sin configurar',
          variant: 'secondary' as const
        }
      default:
        return {
          icon: <Info className="h-4 w-4" />,
          text: 'Desconocido',
          variant: 'secondary' as const
        }
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
          <CardDescription>
            Recibe notificaciones instantáneas en tu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tu navegador no soporta notificaciones push. Actualiza a una versión más reciente para usar esta función.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const permissionStatus = getPermissionStatus()

  return (
    <div className="space-y-6">
      {/* Main Push Notification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones Push
          </CardTitle>
          <CardDescription>
            Recibe notificaciones instantáneas incluso cuando la aplicación esté cerrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Estado de permisos:</span>
                <Badge variant={permissionStatus.variant} className="gap-1">
                  {permissionStatus.icon}
                  {permissionStatus.text}
                </Badge>
              </div>
              {subscription && (
                <p className="text-xs text-muted-foreground">
                  Dispositivo conectado y activo
                </p>
              )}
            </div>
            
            {/* Device Type Indicator */}
            <div className="flex items-center gap-2 text-muted-foreground">
              {typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? (
                <Smartphone className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
              <span className="text-xs">
                {typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent) ? 'Móvil' : 'Escritorio'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Controls Section */}
          <div className="space-y-4">
            {permission === 'default' && (
              <Button 
                onClick={requestPermission} 
                disabled={isLoading}
                className="w-full gap-2"
              >
                <Bell className="h-4 w-4" />
                Solicitar Permisos de Notificación
              </Button>
            )}

            {permission === 'granted' && !isSubscribed && (
              <div className="space-y-3">
                <Button 
                  onClick={subscribe} 
                  disabled={isLoading}
                  className="w-full gap-2"
                >
                  {isLoading ? 'Activando...' : 'Activar Notificaciones Push'}
                  <Bell className="h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Las notificaciones te permitirán estar al día con eventos importantes de la iglesia
                </p>
              </div>
            )}

            {permission === 'granted' && isSubscribed && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={unsubscribe} 
                    disabled={isLoading}
                    className="flex-1 gap-2"
                  >
                    <BellOff className="h-4 w-4" />
                    Desactivar
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleTestNotification} 
                    disabled={testLoading}
                    className="gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    {testLoading ? 'Enviando...' : 'Probar'}
                  </Button>
                </div>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ¡Excelente! Estás recibiendo notificaciones push de la iglesia.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {permission === 'denied' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Las notificaciones están bloqueadas. Para activarlas:
                  <br />
                  1. Haz clic en el ícono del candado en la barra de direcciones
                  <br />
                  2. Cambia los permisos de notificaciones a "Permitir"
                  <br />
                  3. Recarga la página
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Push Notification Preferences */}
      {isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferencias de Push
            </CardTitle>
            <CardDescription>
              Personaliza qué notificaciones push quieres recibir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-events">Eventos de la Iglesia</Label>
                  <p className="text-xs text-muted-foreground">
                    Nuevos eventos, cambios de horario y recordatorios
                  </p>
                </div>
                <Switch id="push-events" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-donations">Donaciones y Finanzas</Label>
                  <p className="text-xs text-muted-foreground">
                    Confirmaciones de donaciones y alertas financieras
                  </p>
                </div>
                <Switch id="push-donations" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-announcements">Anuncios Importantes</Label>
                  <p className="text-xs text-muted-foreground">
                    Comunicaciones urgentes del liderazgo
                  </p>
                </div>
                <Switch id="push-announcements" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-birthdays">Cumpleaños y Aniversarios</Label>
                  <p className="text-xs text-muted-foreground">
                    Celebraciones de miembros de la comunidad
                  </p>
                </div>
                <Switch id="push-birthdays" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-silent">Modo Silencioso (6PM - 8AM)</Label>
                  <p className="text-xs text-muted-foreground">
                    Reduce las notificaciones durante horas de descanso
                  </p>
                </div>
                <Switch id="push-silent" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics for Admins */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas Push (Admin)
            </CardTitle>
            <CardDescription>
              Métricas de uso de notificaciones push en la iglesia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.activeSubscriptions}</div>
                <div className="text-xs text-muted-foreground">Activas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.recentActivity}</div>
                <div className="text-xs text-muted-foreground">Esta semana</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.keys(stats.subscriptionsByPlatform).length}
                </div>
                <div className="text-xs text-muted-foreground">Plataformas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Browser Compatibility Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Navegador:</span>
                <span className="font-mono text-xs">
                  {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ').slice(-1)[0] : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plataforma:</span>
                <span>{typeof navigator !== 'undefined' ? navigator.platform : 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idioma:</span>
                <span>{typeof navigator !== 'undefined' ? navigator.language : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Online:</span>
                <Badge variant={typeof navigator !== 'undefined' && navigator.onLine ? "default" : "secondary"}>
                  {typeof navigator !== 'undefined' && navigator.onLine ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
