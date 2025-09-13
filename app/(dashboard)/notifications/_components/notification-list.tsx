
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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

interface NotificationListProps {
  notifications: Notification[]
  onMarkAsRead: (notificationIds: string[]) => void
  onDelete: (notificationId: string) => void
  hasMore: boolean
  onLoadMore: () => void
  loading: boolean
}

const NOTIFICATION_ICONS = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ERROR: XCircle,
}

const NOTIFICATION_COLORS = {
  INFO: 'text-blue-500',
  SUCCESS: 'text-green-500',
  WARNING: 'text-yellow-500',
  ERROR: 'text-red-500',
}

const PRIORITY_COLORS = {
  LOW: 'text-gray-500',
  NORMAL: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  hasMore,
  onLoadMore,
  loading
}: NotificationListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [expandedIds, setExpandedIds] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notifications.map(n => n.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, notificationId])
    } else {
      setSelectedIds(prev => prev.filter(id => id !== notificationId))
    }
  }

  const handleMarkSelectedAsRead = () => {
    const unreadSelected = selectedIds.filter(id => {
      const notification = notifications.find(n => n.id === id)
      return notification && !notification.isRead
    })
    
    if (unreadSelected.length > 0) {
      onMarkAsRead(unreadSelected)
      setSelectedIds([])
    }
  }

  const toggleExpanded = (notificationId: string) => {
    if (expandedIds.includes(notificationId)) {
      setExpandedIds(prev => prev.filter(id => id !== notificationId))
    } else {
      setExpandedIds(prev => [...prev, notificationId])
    }
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay notificaciones</h3>
          <p className="text-muted-foreground">
            No tienes notificaciones en este momento.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} notificación{selectedIds.length !== 1 ? 'es' : ''} seleccionada{selectedIds.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkSelectedAsRead}
                  className="gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Marcar como leídas
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedIds([])}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with Select All */}
      <div className="flex items-center gap-2 px-2">
        <Checkbox
          checked={selectedIds.length === notifications.length}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm text-muted-foreground">
          Seleccionar todas
        </span>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.map((notification) => {
          const IconComponent = NOTIFICATION_ICONS[notification.type]
          const isExpanded = expandedIds.includes(notification.id)
          const isSelected = selectedIds.includes(notification.id)
          const isExpired = notification.expiresAt && new Date(notification.expiresAt) < new Date()

          return (
            <Card 
              key={notification.id}
              className={`transition-colors ${
                !notification.isRead ? 'bg-muted/30 border-l-4 border-l-primary' : ''
              } ${isExpired ? 'opacity-60' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleSelectNotification(notification.id, checked as boolean)
                    }
                  />
                  
                  <IconComponent 
                    className={`h-5 w-5 mt-1 flex-shrink-0 ${NOTIFICATION_COLORS[notification.type]}`} 
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {notification.type}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${PRIORITY_COLORS[notification.priority]}`}
                          >
                            {notification.priority}
                          </Badge>
                          {notification.category && (
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                          )}
                          {notification.isGlobal && (
                            <Badge className="text-xs">Global</Badge>
                          )}
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              Expirada
                            </Badge>
                          )}
                        </div>
                        
                        <p className={`text-sm text-muted-foreground mb-2 ${
                          isExpanded ? '' : 'line-clamp-2'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {notification.message.length > 100 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(notification.id)}
                            className="h-auto p-0 text-xs text-primary"
                          >
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="gap-2"
                          >
                            <a 
                              href={notification.actionUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {notification.actionLabel || 'Ver'}
                            </a>
                          </Button>
                        )}
                        
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onMarkAsRead([notification.id])}
                            className="gap-2"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(notification.id)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </span>
                        {notification.expiresAt && (
                          <>
                            <span>•</span>
                            <span>
                              Expira: {formatDistanceToNow(new Date(notification.expiresAt), { 
                                addSuffix: true,
                                locale: es 
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {notification.targetRole && (
                        <span>Para: {notification.targetRole}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="gap-2"
          >
            {loading ? 'Cargando...' : 'Cargar más notificaciones'}
          </Button>
        </div>
      )}
    </div>
  )
}
