
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'react-hot-toast'
import { 
  Mail,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Settings,
  Users,
  Calendar,
  Eye,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react'

interface EmailStatus {
  queueLength: number
  status: string
  emailConfig: {
    development: boolean
    fromEmail: string
  }
}

interface DigestPreview {
  period: 'DAILY' | 'WEEKLY'
  dateRange: {
    start: string
    end: string
  }
  church: string
  user: {
    name?: string
    email: string
  }
  notifications: Array<{
    id: string
    title: string
    message: string
    type: string
    category?: string
    priority: string
    createdAt: string
  }>
  preview: boolean
}

export function EmailManagement() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null)
  const [digestPreview, setDigestPreview] = useState<DigestPreview | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'DAILY' | 'WEEKLY'>('DAILY')
  const [sendingDigest, setSendingDigest] = useState(false)
  const [sendingTest, setSendingTest] = useState(false)

  useEffect(() => {
    if (session?.user?.role && ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      fetchEmailStatus()
      fetchDigestPreview()
    }
  }, [session])

  const fetchEmailStatus = async () => {
    try {
      const response = await fetch('/api/email/send-notification')
      if (response.ok) {
        const status = await response.json()
        setEmailStatus(status)
      }
    } catch (error) {
      console.error('Error fetching email status:', error)
    }
  }

  const fetchDigestPreview = async () => {
    try {
      const response = await fetch(`/api/email/send-digest?period=${selectedPeriod}`)
      if (response.ok) {
        const preview = await response.json()
        setDigestPreview(preview)
      }
    } catch (error) {
      console.error('Error fetching digest preview:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendDigestEmails = async () => {
    setSendingDigest(true)
    try {
      const response = await fetch('/api/email/send-digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPeriod
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Enviados ${result.totalSent} emails digest ${selectedPeriod.toLowerCase()}`)
        fetchEmailStatus() // Refresh queue status
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar digest')
      }
    } catch (error) {
      console.error('Error sending digest:', error)
      toast.error('Error al enviar emails digest')
    } finally {
      setSendingDigest(false)
    }
  }

  const sendTestEmail = async () => {
    if (!digestPreview) return

    setSendingTest(true)
    try {
      const response = await fetch('/api/email/send-digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period: selectedPeriod,
          userId: session?.user?.id, // Send only to current user
          dateOverride: new Date().toISOString()
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Email de prueba enviado (${result.totalSent} emails)`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar email de prueba')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Error al enviar email de prueba')
    } finally {
      setSendingTest(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await Promise.all([
      fetchEmailStatus(),
      fetchDigestPreview()
    ])
    setLoading(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Cargando gestión de emails...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground">
              Solo los administradores pueden gestionar el envío de emails.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Emails</h2>
          <p className="text-muted-foreground">
            Administra el envío de notificaciones por correo electrónico
          </p>
        </div>
        <Button
          onClick={refreshData}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Email Service Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estado del Servicio de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estado del Servicio</Label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm capitalize">{emailStatus.status}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cola de Envío</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{emailStatus.queueLength} emails pendientes</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Configuración</Label>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={emailStatus.emailConfig.development ? "secondary" : "default"}>
                      {emailStatus.emailConfig.development ? 'Desarrollo' : 'Producción'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Desde: {emailStatus.emailConfig.fromEmail}
                  </span>
                </div>
              </div>
            </div>
          )}

          {emailStatus?.emailConfig.development && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El sistema está en modo desarrollo. Los emails se registran en consola en lugar de enviarse.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Digest Email Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Gestión de Emails Digest
          </CardTitle>
          <CardDescription>
            Envía resúmenes de notificaciones a usuarios suscritos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Period Selection */}
          <div className="flex items-center gap-4">
            <Label htmlFor="period">Período del Digest:</Label>
            <Select
              value={selectedPeriod}
              onValueChange={(value: 'DAILY' | 'WEEKLY') => {
                setSelectedPeriod(value)
                // Refresh preview when period changes
                setTimeout(fetchDigestPreview, 100)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Diario</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Digest Preview */}
          {digestPreview && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Vista Previa del Digest</h4>
                <Badge variant={digestPreview.preview ? "default" : "secondary"}>
                  {digestPreview.preview ? `${digestPreview.notifications.length} notificaciones` : 'Sin contenido'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Período:</Label>
                  <p className="text-muted-foreground">
                    {new Date(digestPreview.dateRange.start).toLocaleDateString('es-ES')} - {' '}
                    {new Date(digestPreview.dateRange.end).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Iglesia:</Label>
                  <p className="text-muted-foreground">{digestPreview.church}</p>
                </div>
              </div>

              {digestPreview.notifications.length > 0 && (
                <div className="mt-4">
                  <Label className="font-medium">Notificaciones Incluidas:</Label>
                  <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {digestPreview.notifications.slice(0, 5).map((notification, index) => (
                      <div key={index} className="text-xs p-2 bg-background rounded border">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          <span className="font-medium">{notification.title}</span>
                          <span className="text-muted-foreground ml-auto">
                            {new Date(notification.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {digestPreview.notifications.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        ... y {digestPreview.notifications.length - 5} notificaciones más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={sendTestEmail}
              disabled={sendingTest || !digestPreview?.preview}
              variant="outline"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {sendingTest ? 'Enviando...' : 'Enviar Prueba'}
            </Button>
            
            <Button
              onClick={sendDigestEmails}
              disabled={sendingDigest || !digestPreview?.preview}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {sendingDigest ? 'Enviando...' : `Enviar Digest ${selectedPeriod === 'DAILY' ? 'Diario' : 'Semanal'}`}
            </Button>
          </div>

          {!digestPreview?.preview && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay notificaciones en el período seleccionado para crear un digest.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Email Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Información de Plantillas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Plantilla de Notificación Individual</h4>
              <p className="text-sm text-muted-foreground">
                Se usa para enviar notificaciones individuales por email. Incluye el contenido completo 
                de la notificación, botones de acción, y respeta las preferencias del usuario.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">Responsive</Badge>
                <Badge variant="outline">Branded</Badge>
                <Badge variant="outline">Action Buttons</Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Plantilla de Digest</h4>
              <p className="text-sm text-muted-foreground">
                Agrupa múltiples notificaciones en un solo email de resumen. Incluye estadísticas, 
                notificaciones urgentes destacadas, y enlaces de acceso rápido.
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">Agrupado</Badge>
                <Badge variant="outline">Estadísticas</Badge>
                <Badge variant="outline">Priorización</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
