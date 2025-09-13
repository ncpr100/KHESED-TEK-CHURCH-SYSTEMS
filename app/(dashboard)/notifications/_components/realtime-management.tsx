
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'react-hot-toast'
import { useRealTimeContext } from '@/components/realtime/realtime-provider'
import { 
  Zap,
  Users,
  Send,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Radio,
  User,
  Globe,
  UserCog,
  Eye,
  MessageSquare
} from 'lucide-react'

interface RealTimeStats {
  totalConnections: number
  uniqueUsers: number
  averageConnectionsPerUser: number
}

interface ConnectedUser {
  userId: string
  name: string
  role: string
  status: 'online' | 'away' | 'busy'
  currentPage?: string
  lastSeen: string
}

interface BroadcastFormData {
  target: 'user' | 'church' | 'role' | 'global'
  targetId: string
  title: string
  message: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  category: string
  actionUrl: string
  actionLabel: string
}

export function RealTimeManagement() {
  const { data: session } = useSession()
  const { isConnected, isConnecting } = useRealTimeContext()
  
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<RealTimeStats | null>(null)
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([])
  const [broadcasting, setBroadcasting] = useState(false)
  
  const [formData, setFormData] = useState<BroadcastFormData>({
    target: 'church',
    targetId: '',
    title: '',
    message: '',
    priority: 'NORMAL',
    category: 'no-category',
    actionUrl: '',
    actionLabel: ''
  })

  useEffect(() => {
    if (session?.user?.role && ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      fetchRealTimeStatus()
    }
  }, [session])

  const fetchRealTimeStatus = async () => {
    try {
      const response = await fetch('/api/realtime/broadcast')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setConnectedUsers(data.connectedUsers || [])
      }
    } catch (error) {
      console.error('Error fetching real-time status:', error)
    } finally {
      setLoading(false)
    }
  }

  const broadcastNotification = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Título y mensaje son requeridos')
      return
    }

    if (formData.target !== 'global' && formData.target !== 'church' && !formData.targetId) {
      toast.error('Target ID es requerido para el tipo de objetivo seleccionado')
      return
    }

    setBroadcasting(true)
    try {
      const response = await fetch('/api/realtime/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Notificación enviada en tiempo real a ${result.target}`)
        
        // Reset form
        setFormData({
          target: 'church',
          targetId: '',
          title: '',
          message: '',
          priority: 'NORMAL',
          category: '',
          actionUrl: '',
          actionLabel: ''
        })
        
        // Refresh status
        fetchRealTimeStatus()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar notificación en tiempo real')
      }
    } catch (error) {
      console.error('Error broadcasting notification:', error)
      toast.error('Error al enviar notificación en tiempo real')
    } finally {
      setBroadcasting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen)
    return date.toLocaleString('es-ES')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Cargando gestión de tiempo real...
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
              Solo los administradores pueden gestionar el sistema de tiempo real.
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Gestión de Tiempo Real
          </h2>
          <p className="text-muted-foreground">
            Monitorea conexiones y envía notificaciones instantáneas
          </p>
        </div>
        <Button
          onClick={fetchRealTimeStatus}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estado de Conexiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado del Servidor</Label>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Conectado</span>
                  </>
                ) : isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-600">Conectando</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Desconectado</span>
                  </>
                )}
              </div>
            </div>
            
            {stats && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Conexiones</Label>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl font-bold">{stats.totalConnections}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Usuarios Únicos</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl font-bold">{stats.uniqueUsers}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Promedio por Usuario</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xl font-bold">{stats.averageConnectionsPerUser.toFixed(1)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connected Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuarios Conectados ({connectedUsers.length})
          </CardTitle>
          <CardDescription>
            Usuarios activos en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          {connectedUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay usuarios conectados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedUsers.map((user, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(user.status)}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{user.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                        <span className="capitalize">{user.status}</span>
                      </div>
                      {user.currentPage && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 {user.currentPage}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatLastSeen(user.lastSeen)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Broadcast Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Enviar Notificación en Tiempo Real
          </CardTitle>
          <CardDescription>
            Envía notificaciones instantáneas a usuarios específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Objetivo</Label>
              <Select
                value={formData.target}
                onValueChange={(value: 'user' | 'church' | 'role' | 'global') => 
                  setFormData(prev => ({ ...prev, target: value, targetId: '' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Usuario Específico
                    </div>
                  </SelectItem>
                  <SelectItem value="church">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Toda la Iglesia
                    </div>
                  </SelectItem>
                  <SelectItem value="role">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      Por Rol
                    </div>
                  </SelectItem>
                  {session?.user?.role === 'SUPER_ADMIN' && (
                    <SelectItem value="global">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Global (Todas las Iglesias)
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {(formData.target === 'user' || formData.target === 'role') && (
              <div className="space-y-2">
                <Label htmlFor="targetId">
                  {formData.target === 'user' ? 'ID de Usuario' : 'Rol'}
                </Label>
                {formData.target === 'role' ? (
                  <Select
                    value={formData.targetId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, targetId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MIEMBRO">Miembro</SelectItem>
                      <SelectItem value="VOLUNTARIO">Voluntario</SelectItem>
                      <SelectItem value="LIDER">Líder</SelectItem>
                      <SelectItem value="PASTOR">Pastor</SelectItem>
                      <SelectItem value="ADMIN_IGLESIA">Admin Iglesia</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={formData.targetId}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetId: e.target.value }))}
                    placeholder="ID del usuario"
                  />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-category">Sin categoría</SelectItem>
                  <SelectItem value="events">Eventos</SelectItem>
                  <SelectItem value="donations">Donaciones</SelectItem>
                  <SelectItem value="communications">Comunicaciones</SelectItem>
                  <SelectItem value="systemUpdates">Sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título de la notificación"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje *</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Mensaje de la notificación"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="actionUrl">URL de Acción (opcional)</Label>
              <Input
                value={formData.actionUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                placeholder="https://ejemplo.com/accion"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionLabel">Etiqueta de Acción (opcional)</Label>
              <Input
                value={formData.actionLabel}
                onChange={(e) => setFormData(prev => ({ ...prev, actionLabel: e.target.value }))}
                placeholder="Ver más"
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2">
            <Button
              onClick={broadcastNotification}
              disabled={broadcasting || !formData.title || !formData.message}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {broadcasting ? 'Enviando...' : 'Enviar Notificación'}
            </Button>

            <Button
              variant="outline"
              onClick={() => setFormData({
                target: 'church',
                targetId: '',
                title: '',
                message: '',
                priority: 'NORMAL',
                category: '',
                actionUrl: '',
                actionLabel: ''
              })}
            >
              Limpiar
            </Button>
          </div>

          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              Las notificaciones en tiempo real se entregan instantáneamente a usuarios conectados. 
              Los usuarios desconectados no recibirán estas notificaciones.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
