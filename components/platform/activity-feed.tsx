
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react'

interface ActivityItem {
  id: string
  title: string
  message: string
  type: string
  church?: string
  createdAt: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

const typeConfig = {
  info: {
    icon: Info,
    className: 'text-blue-600 bg-blue-100',
    badge: 'bg-blue-100 text-blue-800'
  },
  success: {
    icon: CheckCircle,
    className: 'text-green-600 bg-green-100',
    badge: 'bg-green-100 text-green-800'
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-yellow-600 bg-yellow-100',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  error: {
    icon: AlertCircle,
    className: 'text-red-600 bg-red-100',
    badge: 'bg-red-100 text-red-800'
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const config = typeConfig[activity.type as keyof typeof typeConfig] || typeConfig.info
              const Icon = config.icon

              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                  <div className={`rounded-full p-2 ${config.className}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.message}</p>
                    {activity.church && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {activity.church}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
