
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell,
  BellOff,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  TrendingUp,
  Clock
} from 'lucide-react'

interface Notification {
  id: string
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
  category?: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isRead: boolean
  createdAt: string
}

interface NotificationStatsProps {
  totalCount: number
  unreadCount: number
  notifications: Notification[]
}

export function NotificationStats({ totalCount, unreadCount, notifications }: NotificationStatsProps) {
  // Calculate stats from notifications
  const typeStats = notifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const priorityStats = notifications.reduce((acc, notification) => {
    acc[notification.priority] = (acc[notification.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const categoryStats = notifications.reduce((acc, notification) => {
    if (notification.category) {
      acc[notification.category] = (acc[notification.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Recent notifications (last 24 hours)
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const recentCount = notifications.filter(n => 
    new Date(n.createdAt) > yesterday
  ).length

  const typeIcons = {
    INFO: Info,
    SUCCESS: CheckCircle,
    WARNING: AlertTriangle,
    ERROR: XCircle,
  }

  const typeColors = {
    INFO: 'text-blue-500',
    SUCCESS: 'text-green-500',
    WARNING: 'text-yellow-500',
    ERROR: 'text-red-500',
  }

  const priorityColors = {
    LOW: 'text-gray-500',
    NORMAL: 'text-blue-500',
    HIGH: 'text-orange-500',
    URGENT: 'text-red-500',
  }

  const categoryLabels: Record<string, string> = {
    EVENT: 'Eventos',
    DONATION: 'Donaciones',
    COMMUNICATION: 'Comunicaciones',
    SYSTEM: 'Sistema',
    CUSTOM: 'Personalizado',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCount}</div>
          <p className="text-xs text-muted-foreground">
            Notificaciones totales
          </p>
        </CardContent>
      </Card>

      {/* Unread Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">No Leídas</CardTitle>
          <BellOff className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{unreadCount}</div>
          <p className="text-xs text-muted-foreground">
            Requieren atención
          </p>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentCount}</div>
          <p className="text-xs text-muted-foreground">
            Últimas 24 horas
          </p>
        </CardContent>
      </Card>

      {/* Urgent Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">
            {priorityStats.URGENT || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Prioridad alta
          </p>
        </CardContent>
      </Card>

      {/* Detailed Stats Card */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm">Distribución de Notificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* By Type */}
          <div>
            <h4 className="text-sm font-medium mb-2">Por Tipo</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(typeStats).map(([type, count]) => {
                const IconComponent = typeIcons[type as keyof typeof typeIcons]
                return (
                  <Badge 
                    key={type} 
                    variant="secondary"
                    className="gap-1"
                  >
                    <IconComponent className={`h-3 w-3 ${typeColors[type as keyof typeof typeColors]}`} />
                    {type}: {count}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* By Priority */}
          <div>
            <h4 className="text-sm font-medium mb-2">Por Prioridad</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(priorityStats).map(([priority, count]) => (
                <Badge 
                  key={priority} 
                  variant="outline"
                  className={`${priorityColors[priority as keyof typeof priorityColors]}`}
                >
                  {priority}: {count}
                </Badge>
              ))}
            </div>
          </div>

          {/* By Category */}
          {Object.keys(categoryStats).length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Por Categoría</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <Badge 
                    key={category} 
                    variant="secondary"
                  >
                    {categoryLabels[category] || category}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
