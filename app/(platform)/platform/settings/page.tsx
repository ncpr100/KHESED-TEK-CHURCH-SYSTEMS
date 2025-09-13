
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Shield,
  Bell,
  Mail,
  Database,
  Key,
  Globe,
  Users,
  CreditCard,
  Activity
} from 'lucide-react'
import { SubscriptionManagement } from '@/components/platform/subscription/subscription-management'

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState({
    platform: {
      name: 'Kḥesed-tek Church Management Systems',
      description: 'Plataforma completa de gestión para iglesias',
      supportEmail: 'soporte@khesedtek.com',
      maintenanceMode: false,
      allowRegistrations: true,
      maxChurchesPerAdmin: 5
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      maintenanceAlerts: true,
      securityAlerts: true
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8
    },
    billing: {
      currency: 'USD',
      taxRate: 0.0,
      freeTrialDays: 14,
      gracePeriodDays: 7
    }
  })
  const [platformSettingsId, setPlatformSettingsId] = useState<string | null>(null)

  const [systemActionLoading, setSystemActionLoading] = useState(false)

  useEffect(() => {
    loadPlatformSettings()
  }, [])

  const loadPlatformSettings = async () => {
    try {
      const response = await fetch('/api/platform/settings')
      if (response.ok) {
        const data = await response.json()
        setPlatformSettingsId(data.id)
        setSettings(prev => ({
          ...prev,
          platform: {
            ...prev.platform,
            name: data.platformName || prev.platform.name,
            supportEmail: data.supportEmail || prev.platform.supportEmail,
            maintenanceMode: data.maintenanceMode ?? prev.platform.maintenanceMode,
            allowRegistrations: data.allowRegistrations ?? prev.platform.allowRegistrations
          },
          billing: {
            ...prev.billing,
            currency: data.currency || prev.billing.currency,
            taxRate: data.taxRate ?? prev.billing.taxRate,
            freeTrialDays: data.freeTrialDays ?? prev.billing.freeTrialDays,
            gracePeriodDays: data.gracePeriodDays ?? prev.billing.gracePeriodDays
          }
        }))
      }
    } catch (error) {
      console.error('Error loading platform settings:', error)
      toast.error('Error al cargar configuración de plataforma')
    }
  }

  const handleDatabaseBackup = async () => {
    setSystemActionLoading(true)
    try {
      const response = await fetch('/api/platform/system/backup', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Backup de base de datos completado exitosamente')
        console.log('Database backup completed:', data.backup)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear backup de base de datos')
      }
    } catch (error) {
      console.error('Error creating database backup:', error)
      toast.error('Error de conexión al crear backup')
    } finally {
      setSystemActionLoading(false)
    }
  }

  const handleClearCache = async () => {
    setSystemActionLoading(true)
    try {
      const response = await fetch('/api/platform/system/cache', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Cache del sistema limpiado exitosamente')
        console.log('Cache cleared:', data.operations)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al limpiar cache del sistema')
      }
    } catch (error) {
      console.error('Error clearing cache:', error)
      toast.error('Error de conexión al limpiar cache')
    } finally {
      setSystemActionLoading(false)
    }
  }

  const handleRegenerateKeys = async () => {
    if (!confirm('¿Estás seguro de regenerar las claves del sistema? Esto requerirá que todos los usuarios inicien sesión nuevamente.')) {
      return
    }

    setSystemActionLoading(true)
    try {
      const response = await fetch('/api/platform/system/keys', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Claves del sistema regeneradas exitosamente')
        console.log('Keys regenerated:', data.operations)
        
        // Show warning about application restart
        setTimeout(() => {
          toast('⚠️ Las nuevas claves requieren reinicio de la aplicación', {
            duration: 5000
          })
        }, 2000)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al regenerar claves del sistema')
      }
    } catch (error) {
      console.error('Error regenerating keys:', error)
      toast.error('Error de conexión al regenerar claves')
    } finally {
      setSystemActionLoading(false)
    }
  }

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const handleSaveSettings = async (section: string) => {
    try {
      const response = await fetch('/api/platform/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: platformSettingsId,
          platformName: settings.platform.name,
          supportEmail: settings.platform.supportEmail,
          maintenanceMode: settings.platform.maintenanceMode,
          allowRegistrations: settings.platform.allowRegistrations,
          currency: settings.billing.currency,
          taxRate: settings.billing.taxRate,
          freeTrialDays: settings.billing.freeTrialDays,
          gracePeriodDays: settings.billing.gracePeriodDays
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPlatformSettingsId(data.id)
        toast.success(`Configuración de ${section} guardada exitosamente`)
        
        // If currency was changed, show notification about refreshing subscription display
        if (section === 'billing') {
          toast.success('💱 Precios de suscripción actualizados con nueva moneda', {
            duration: 4000
          })
        }
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error de conexión al guardar la configuración')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Plataforma</h1>
          <p className="text-gray-600">Administrar configuración global del sistema</p>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Super Admin Only
        </Badge>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="platform" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Plataforma
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Suscripciones
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Facturación
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platformName">Nombre de la Plataforma</Label>
                  <Input
                    id="platformName"
                    value={settings.platform.name}
                    onChange={(e) => handleSettingChange('platform', 'name', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="supportEmail">Email de Soporte</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.platform.supportEmail}
                    onChange={(e) => handleSettingChange('platform', 'supportEmail', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="platformDescription">Descripción</Label>
                <Textarea
                  id="platformDescription"
                  value={settings.platform.description}
                  onChange={(e) => handleSettingChange('platform', 'description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Mantenimiento</Label>
                    <p className="text-sm text-gray-600">
                      Desactivar acceso a la plataforma temporalmente
                    </p>
                  </div>
                  <Switch
                    checked={settings.platform.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('platform', 'maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Permitir Registros</Label>
                    <p className="text-sm text-gray-600">
                      Habilitar registro de nuevas iglesias
                    </p>
                  </div>
                  <Switch
                    checked={settings.platform.allowRegistrations}
                    onCheckedChange={(checked) => handleSettingChange('platform', 'allowRegistrations', checked)}
                  />
                </div>

                <div>
                  <Label htmlFor="maxChurches">Máximo Iglesias por Admin</Label>
                  <Input
                    id="maxChurches"
                    type="number"
                    value={settings.platform.maxChurchesPerAdmin}
                    onChange={(e) => handleSettingChange('platform', 'maxChurchesPerAdmin', parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('platform')}>
                Guardar Configuración General
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          {/* Subscription Management Instructions */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                💼 <span>Gestión de Suscripciones SUPER_ADMIN</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-green-700 space-y-2">
                <p><strong>🔧 Control Total de Precios y Características:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Editar precios mensuales/anuales de todos los planes</li>
                  <li>Modificar límites de iglesias, miembros y usuarios administradores</li>
                  <li>Agregar/eliminar características y complementos de suscripción</li>
                  <li><strong>Cambios se reflejan automáticamente en página de registro</strong></li>
                </ul>
                <div className="mt-3 p-2 bg-green-100 rounded border-l-4 border-green-400">
                  <strong>🚀 Sincronización en Tiempo Real:</strong> Cualquier actualización aquí aparece instantáneamente en el formulario de registro de nuevos tenants.
                </div>
              </div>
            </CardContent>
          </Card>

          <SubscriptionManagement />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-gray-600">
                      Enviar notificaciones importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas del Sistema</Label>
                    <p className="text-sm text-gray-600">
                      Notificar sobre eventos del sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.systemAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'systemAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Mantenimiento</Label>
                    <p className="text-sm text-gray-600">
                      Notificar sobre ventanas de mantenimiento
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.maintenanceAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'maintenanceAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Seguridad</Label>
                    <p className="text-sm text-gray-600">
                      Notificar sobre eventos de seguridad críticos
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.securityAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'securityAlerts', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('notifications')}>
                Guardar Configuración de Notificaciones
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Requerir Autenticación de Dos Factores</Label>
                  <p className="text-sm text-gray-600">
                    Forzar 2FA para todos los administradores
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireTwoFactor}
                  onCheckedChange={(checked) => handleSettingChange('security', 'requireTwoFactor', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Timeout de Sesión (min)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="maxLoginAttempts">Máx. Intentos de Login</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="passwordMinLength">Long. Mínima Contraseña</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('security')}>
                Guardar Configuración de Seguridad
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* USD Billing Model Info Card */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                🇺🇸 <span>Modelo de Facturación USD</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-blue-700 space-y-2">
                <p><strong>📋 Proceso de Facturación Manual:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Todos los precios se muestran en <strong>USD (Dólares Americanos)</strong></li>
                  <li>Facturas son generadas y enviadas manualmente por el administrador</li>
                  <li>Los tenants reciben acceso tras confirmación de pago</li>
                  <li>Períodos de prueba de 14 días siguen activos para evaluación</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Configuración de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <select
                    id="currency"
                    value={settings.billing.currency}
                    onChange={(e) => handleSettingChange('billing', 'currency', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="USD">🇺🇸 USD - Dólar Americano (Recomendado)</option>
                    <option value="EUR">🇪🇺 EUR - Euro</option>
                    <option value="COP">🇨🇴 COP - Peso Colombiano</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={settings.billing.taxRate}
                    onChange={(e) => handleSettingChange('billing', 'taxRate', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freeTrialDays">Días de Prueba Gratuita</Label>
                  <Input
                    id="freeTrialDays"
                    type="number"
                    value={settings.billing.freeTrialDays}
                    onChange={(e) => handleSettingChange('billing', 'freeTrialDays', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="gracePeriodDays">Período de Gracia (días)</Label>
                  <Input
                    id="gracePeriodDays"
                    type="number"
                    value={settings.billing.gracePeriodDays}
                    onChange={(e) => handleSettingChange('billing', 'gracePeriodDays', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={() => handleSaveSettings('billing')}>
                Guardar Configuración de Facturación
              </Button>
            </CardContent>
          </Card>

          {/* Manual Invoicing Workflow Card */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                📄 <span>Flujo de Facturación Manual</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-orange-700 space-y-2">
                <p><strong>🔄 Proceso Paso a Paso:</strong></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-2">
                    <p><strong>1. Registro del Tenant:</strong></p>
                    <ul className="list-disc list-inside text-xs ml-4">
                      <li>Tenant se registra y selecciona plan</li>
                      <li>Recibe acceso de prueba por 14 días</li>
                      <li>Notificación automática al SUPER_ADMIN</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p><strong>2. Facturación & Pago:</strong></p>
                    <ul className="list-disc list-inside text-xs ml-4">
                      <li>SUPER_ADMIN calcula y envía factura USD</li>
                      <li>Tenant realiza pago según factura</li>
                      <li>SUPER_ADMIN confirma pago y activa acceso</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Base de Datos</p>
                  <p className="text-xs text-gray-600">Conectada</p>
                </div>

                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Email Service</p>
                  <p className="text-xs text-gray-600">Operativo</p>
                </div>

                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm font-medium">API External</p>
                  <p className="text-xs text-gray-600">Activo</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Acciones del Sistema</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDatabaseBackup}
                    disabled={systemActionLoading}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Backup BD
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearCache}
                    disabled={systemActionLoading}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Limpiar Cache
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRegenerateKeys}
                    disabled={systemActionLoading}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Regenerar Keys
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
