
'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ExternalLink,
  Clock
} from 'lucide-react'
import { RealTimeNotification } from '@/hooks/use-realtime'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface RealTimeToastProps {
  notifications: RealTimeNotification[]
  maxVisible?: number
  autoHideDuration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

interface ToastNotification extends RealTimeNotification {
  isVisible: boolean
  hideTimeout?: NodeJS.Timeout
}

export function RealTimeToast({ 
  notifications, 
  maxVisible = 3,
  autoHideDuration = 5000,
  position = 'top-right'
}: RealTimeToastProps) {
  const [visibleToasts, setVisibleToasts] = useState<ToastNotification[]>([])

  // Process new notifications
  useEffect(() => {
    notifications.forEach(notification => {
      // Only show notification type messages as toasts
      if (notification.type !== 'notification') return

      // Check if already visible
      if (visibleToasts.some(t => t.id === notification.id)) return

      const toastNotification: ToastNotification = {
        ...notification,
        isVisible: true
      }

      setVisibleToasts(prev => {
        // Remove oldest if we exceed max
        const updated = [toastNotification, ...prev]
        return updated.slice(0, maxVisible)
      })

      // Auto-hide after duration (unless urgent)
      if (notification.data.priority !== 'URGENT' && autoHideDuration > 0) {
        const timeout = setTimeout(() => {
          hideToast(notification.id)
        }, autoHideDuration)

        // Store timeout reference
        toastNotification.hideTimeout = timeout
      }
    })
  }, [notifications, maxVisible, autoHideDuration, visibleToasts])

  const hideToast = (id: string) => {
    setVisibleToasts(prev => 
      prev.map(toast => 
        toast.id === id 
          ? { ...toast, isVisible: false }
          : toast
      )
    )

    // Remove from array after animation
    setTimeout(() => {
      setVisibleToasts(prev => prev.filter(toast => toast.id !== id))
    }, 300)
  }

  const clearAllToasts = () => {
    setVisibleToasts(prev => 
      prev.map(toast => ({ ...toast, isVisible: false }))
    )

    setTimeout(() => {
      setVisibleToasts([])
    }, 300)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'top-right':
        return 'top-4 right-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'URGENT') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    }

    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive'
      case 'HIGH':
        return 'default'
      case 'NORMAL':
        return 'secondary'
      case 'LOW':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (visibleToasts.length === 0) return null

  return (
    <div className={`fixed ${getPositionClasses()} z-[100] space-y-2 max-w-sm w-full pointer-events-none`}>
      {/* Clear all button */}
      {visibleToasts.length > 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-end pointer-events-auto"
        >
          <Button
            size="sm"
            variant="outline"
            onClick={clearAllToasts}
            className="text-xs bg-background/80 backdrop-blur-sm"
          >
            Limpiar todo
          </Button>
        </motion.div>
      )}

      {/* Toast notifications */}
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ 
              opacity: toast.isVisible ? 1 : 0, 
              x: toast.isVisible ? 0 : 300,
              scale: toast.isVisible ? 1 : 0.8
            }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="pointer-events-auto"
            style={{ zIndex: 100 - index }}
          >
            <Card className={`
              shadow-lg border-l-4 bg-background/95 backdrop-blur-sm
              ${toast.data.priority === 'URGENT' ? 'border-l-red-500 shadow-red-500/20' : 
                toast.data.priority === 'HIGH' ? 'border-l-yellow-500 shadow-yellow-500/20' : 
                'border-l-blue-500 shadow-blue-500/20'}
            `}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(toast.data.type, toast.data.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {toast.data.title}
                      </h4>
                      <Badge 
                        variant={getPriorityColor(toast.data.priority)}
                        className="text-xs px-1.5 py-0.5 flex-shrink-0"
                      >
                        {toast.data.priority === 'URGENT' ? 'URGENTE' :
                         toast.data.priority === 'HIGH' ? 'ALTA' :
                         toast.data.priority === 'LOW' ? 'BAJA' : 'NORMAL'}
                      </Badge>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {toast.data.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(toast.timestamp), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                        {toast.data.senderName && (
                          <>
                            <span>•</span>
                            <span>{toast.data.senderName}</span>
                          </>
                        )}
                      </div>

                      {/* Action button */}
                      {toast.data.actionUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-xs px-2"
                          onClick={() => {
                            window.open(toast.data.actionUrl, '_blank')
                            hideToast(toast.id)
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {toast.data.actionLabel || 'Ver'}
                        </Button>
                      )}
                    </div>

                    {/* Category tag */}
                    {toast.data.category && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {toast.data.category === 'events' ? 'Eventos' :
                           toast.data.category === 'donations' ? 'Donaciones' :
                           toast.data.category === 'communications' ? 'Comunicaciones' :
                           toast.data.category === 'systemUpdates' ? 'Sistema' :
                           toast.data.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Close button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 flex-shrink-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => hideToast(toast.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default RealTimeToast
