
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'react-hot-toast'
import { 
  Bell, 
  BellOff, 
  Plus, 
  Search, 
  Settings, 
  Trash2, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Filter,
  Send,
  Mail,
  Zap
} from 'lucide-react'
import { NotificationList } from './notification-list'
import { CreateNotificationDialog } from './create-notification-dialog'
import { NotificationStats } from './notification-stats'
import { NotificationPreferences } from './notification-preferences'
import { EmailManagement } from './email-management'
import { RealTimeManagement } from './realtime-management'
import { SentNotificationsList } from './sent-notifications-list'

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
  category?: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isRead: boolean
  isGlobal: boolean
  targetRole?: string
  targetUser?: string
  actionUrl?: string
  actionLabel?: string
  expiresAt?: string
  createdAt: string
  church?: { name: string }
  creator?: { name?: string }
}

const NOTIFICATION_TYPES = [
  { value: 'INFO', label: 'Información', icon: Info, color: 'text-blue-500' },
  { value: 'SUCCESS', label: 'Éxito', icon: CheckCircle, color: 'text-green-500' },
  { value: 'WARNING', label: 'Advertencia', icon: AlertTriangle, color: 'text-yellow-500' },
  { value: 'ERROR', label: 'Error', icon: XCircle, color: 'text-red-500' },
]

const CATEGORIES = [
  { value: 'EVENT', label: 'Eventos' },
  { value: 'DONATION', label: 'Donaciones' },
  { value: 'COMMUNICATION', label: 'Comunicaciones' },
  { value: 'SYSTEM', label: 'Sistema' },
  { value: 'CUSTOM', label: 'Personalizado' },
]

const PRIORITIES = [
  { value: 'LOW', label: 'Baja', color: 'text-gray-500' },
  { value: 'NORMAL', label: 'Normal', color: 'text-blue-500' },
  { value: 'HIGH', label: 'Alta', color: 'text-orange-500' },
  { value: 'URGENT', label: 'Urgente', color: 'text-red-500' },
]

export function NotificationsClient() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all') // all, read, unread
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const itemsPerPage = 20

  useEffect(() => {
    fetchNotifications()
  }, [session, typeFilter, categoryFilter, priorityFilter, statusFilter, currentPage])

  const fetchNotifications = async (append = false) => {
    try {
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: (currentPage * itemsPerPage).toString(),
      })

      if (statusFilter === 'unread') {
        params.append('unreadOnly', 'true')
      }

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        if (append) {
          setNotifications(prev => [...prev, ...data.notifications])
        } else {
          setNotifications(data.notifications)
        }
        
        setTotalCount(data.totalCount)
        setUnreadCount(data.unreadCount)
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, isRead: true }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - notificationIds.length))
        toast.success('Notificaciones marcadas como leídas')
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
      toast.error('Error al marcar notificaciones como leídas')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
        setUnreadCount(0)
        toast.success('Todas las notificaciones marcadas como leídas')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Error al marcar todas las notificaciones como leídas')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        setTotalCount(prev => prev - 1)
        toast.success('Notificación eliminada')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error al eliminar notificación')
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    if (typeFilter !== 'all' && notification.type !== typeFilter) {
      return false
    }
    
    if (categoryFilter !== 'all' && notification.category !== categoryFilter) {
      return false
    }
    
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
      return false
    }

    return true
  })

  const loadMore = () => {
    setCurrentPage(prev => prev + 1)
    fetchNotifications(true)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setTypeFilter('all')
    setCategoryFilter('all')
    setPriorityFilter('all')
    setStatusFilter('all')
    setCurrentPage(0)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const canCreateNotifications = session?.user?.role && 
    ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(session.user.role)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centro de Notificaciones</h1>
          <p className="text-muted-foreground">
            Gestiona las notificaciones del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Marcar todas como leídas ({unreadCount})
            </Button>
          )}
          {canCreateNotifications && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Notificación
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <NotificationStats 
        totalCount={totalCount}
        unreadCount={unreadCount}
        notifications={notifications}
      />

      {/* Main Content */}
      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className={`grid w-full ${
          session?.user?.role && ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role) 
            ? 'grid-cols-5' 
            : 'grid-cols-3'
        }`}>
          <TabsTrigger value="inbox" className="gap-2 cursor-pointer">
            <Bell className="h-4 w-4" />
            Bandeja de Entrada
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2 cursor-pointer">
            <Send className="h-4 w-4" />
            Enviadas
          </TabsTrigger>
          {session?.user?.role && ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role) && (
            <>
              <TabsTrigger value="email" className="gap-2 cursor-pointer">
                <Mail className="h-4 w-4" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="realtime" className="gap-2 cursor-pointer">
                <Zap className="h-4 w-4" />
                Tiempo Real
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="settings" className="gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar notificaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="unread">No leídas</SelectItem>
                      <SelectItem value="read">Leídas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {NOTIFICATION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {PRIORITIES.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(searchTerm || typeFilter !== 'all' || categoryFilter !== 'all' || 
                priorityFilter !== 'all' || statusFilter !== 'all') && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredNotifications.length} de {totalCount} notificaciones
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Limpiar Filtros
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications List */}
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loading={false}
          />
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones Enviadas</CardTitle>
              <CardDescription>
                Historial de notificaciones que has creado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SentNotificationsList 
                searchTerm={searchTerm}
                typeFilter={typeFilter}
                categoryFilter={categoryFilter}
                priorityFilter={priorityFilter}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {session?.user?.role && ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role) && (
          <>
            <TabsContent value="email" className="space-y-6">
              <EmailManagement />
            </TabsContent>
            
            <TabsContent value="realtime" className="space-y-6">
              <RealTimeManagement />
            </TabsContent>
          </>
        )}

        <TabsContent value="settings" className="space-y-6">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>

      {/* Create Notification Dialog */}
      {showCreateDialog && (
        <CreateNotificationDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onNotificationCreated={() => {
            fetchNotifications()
            setShowCreateDialog(false)
          }}
        />
      )}
    </div>
  )
}
