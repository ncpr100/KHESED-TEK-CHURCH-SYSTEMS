
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { 
  Send,
  Search, 
  Filter,
  Calendar,
  Users,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface SentNotification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
  category?: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  recipientCount: number
  deliveredCount: number
  readCount: number
  status: 'DRAFT' | 'SENT' | 'DELIVERED' | 'FAILED'
  sentAt?: string
  createdAt: string
}

interface SentNotificationsListProps {
  searchTerm: string
  typeFilter: string
  categoryFilter: string
  priorityFilter: string
}

const NOTIFICATION_TYPES = [
  { value: 'INFO', label: 'Información', icon: Info, color: 'text-blue-500 bg-blue-50' },
  { value: 'SUCCESS', label: 'Éxito', icon: CheckCircle, color: 'text-green-500 bg-green-50' },
  { value: 'WARNING', label: 'Advertencia', icon: AlertTriangle, color: 'text-yellow-500 bg-yellow-50' },
  { value: 'ERROR', label: 'Error', icon: XCircle, color: 'text-red-500 bg-red-50' },
]

const PRIORITIES = [
  { value: 'LOW', label: 'Baja', color: 'text-gray-500 bg-gray-50' },
  { value: 'NORMAL', label: 'Normal', color: 'text-blue-500 bg-blue-50' },
  { value: 'HIGH', label: 'Alta', color: 'text-orange-500 bg-orange-50' },
  { value: 'URGENT', label: 'Urgente', color: 'text-red-500 bg-red-50' },
]

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador', color: 'text-gray-500 bg-gray-50' },
  { value: 'SENT', label: 'Enviado', color: 'text-blue-500 bg-blue-50' },
  { value: 'DELIVERED', label: 'Entregado', color: 'text-green-500 bg-green-50' },
  { value: 'FAILED', label: 'Fallido', color: 'text-red-500 bg-red-50' },
]

export function SentNotificationsList({ 
  searchTerm, 
  typeFilter, 
  categoryFilter, 
  priorityFilter 
}: SentNotificationsListProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const itemsPerPage = 20

  useEffect(() => {
    fetchSentNotifications()
  }, [session, searchTerm, typeFilter, categoryFilter, priorityFilter, currentPage])

  const fetchSentNotifications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: itemsPerPage.toString(),
        offset: (currentPage * itemsPerPage).toString(),
        sentOnly: 'true'
      })

      if (searchTerm) params.append('search', searchTerm)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)

      const response = await fetch(`/api/notifications?${params}`)
      if (response.ok) {
        const data = await response.json()
        
        if (currentPage === 0) {
          setSentNotifications(data.notifications || [])
        } else {
          setSentNotifications(prev => [...prev, ...(data.notifications || [])])
        }
        
        setHasMore(data.hasMore || false)
      }
    } catch (error) {
      console.error('Error fetching sent notifications:', error)
      toast.error('Error al cargar notificaciones enviadas')
    } finally {
      setLoading(false)
    }
  }

  const getTypeConfig = (type: string) => {
    return NOTIFICATION_TYPES.find(t => t.value === type) || NOTIFICATION_TYPES[0]
  }

  const getPriorityConfig = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[1]
  }

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[1]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewNotification = (notificationId: string) => {
    // Open notification details modal
    toast('Vista detallada próximamente disponible')
  }

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta notificación?')) return

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSentNotifications(prev => prev.filter(n => n.id !== notificationId))
        toast.success('Notificación eliminada exitosamente')
      } else {
        toast.error('Error al eliminar notificación')
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error al eliminar notificación')
    }
  }

  if (loading && currentPage === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!loading && sentNotifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No has enviado notificaciones
        </h3>
        <p className="text-gray-500 mb-4">
          Cuando envíes tu primera notificación, aparecerá aquí
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sentNotifications.map((notification) => {
        const typeConfig = getTypeConfig(notification.type)
        const priorityConfig = getPriorityConfig(notification.priority)
        const statusConfig = getStatusConfig(notification.status)

        return (
          <Card key={notification.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-start gap-3">
                    <typeConfig.icon className={`h-5 w-5 mt-0.5 ${typeConfig.color.split(' ')[0]}`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className={priorityConfig.color}>
                          {priorityConfig.label}
                        </Badge>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                        {notification.category && (
                          <Badge variant="secondary">{notification.category}</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {notification.recipientCount} destinatarios
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {notification.deliveredCount} entregadas
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {notification.readCount} leídas
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {notification.sentAt ? formatDate(notification.sentAt) : formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewNotification(notification.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              'Cargar más'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

