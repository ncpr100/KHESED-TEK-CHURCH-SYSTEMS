
'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Wifi, 
  WifiOff, 
  Loader2, 
  AlertTriangle, 
  Bell, 
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'

interface RealTimeStatusIndicatorProps {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  unreadCount?: number
  className?: string
}

export function RealTimeStatusIndicator({ 
  isConnected, 
  isConnecting, 
  error,
  unreadCount = 0,
  className 
}: RealTimeStatusIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null)
  const [connectionDuration, setConnectionDuration] = useState<string>('')

  // Track connection time
  useEffect(() => {
    if (isConnected && !lastConnectedAt) {
      setLastConnectedAt(new Date())
    } else if (!isConnected) {
      setLastConnectedAt(null)
      setConnectionDuration('')
    }
  }, [isConnected, lastConnectedAt])

  // Update connection duration
  useEffect(() => {
    if (!lastConnectedAt || !isConnected) return

    const updateDuration = () => {
      const now = new Date()
      const diff = now.getTime() - lastConnectedAt.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (hours > 0) {
        setConnectionDuration(`${hours}h ${minutes % 60}m`)
      } else if (minutes > 0) {
        setConnectionDuration(`${minutes}m ${seconds % 60}s`)
      } else {
        setConnectionDuration(`${seconds}s`)
      }
    }

    updateDuration()
    const interval = setInterval(updateDuration, 1000)
    return () => clearInterval(interval)
  }, [lastConnectedAt, isConnected])

  const getStatusIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-3 w-3 animate-spin" />
    }
    
    if (error) {
      return <AlertTriangle className="h-3 w-3" />
    }
    
    if (isConnected) {
      return <Wifi className="h-3 w-3" />
    }
    
    return <WifiOff className="h-3 w-3" />
  }

  const getStatusColor = () => {
    if (isConnecting) return 'secondary'
    if (error) return 'destructive'
    if (isConnected) return 'default'
    return 'secondary'
  }

  const getStatusText = () => {
    if (isConnecting) return 'Conectando...'
    if (error) return 'Error de conexión'
    if (isConnected) return 'Tiempo real activo'
    return 'Sin conexión'
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Popover open={showDetails} onOpenChange={setShowDetails}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-background/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all"
          >
            {getStatusIcon()}
            
            <Badge 
              variant={getStatusColor()}
              className="text-xs px-1 py-0"
            >
              RT
            </Badge>
            
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-80 p-0" 
          align="end" 
          side="top"
          sideOffset={8}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Estado de Tiempo Real</h4>
                    <p className="text-xs text-muted-foreground">{getStatusText()}</p>
                  </div>
                </div>

                {/* Connection Details */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Estado:</span>
                    <div className="flex items-center gap-1">
                      {isConnected ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-green-600 font-medium">Conectado</span>
                        </>
                      ) : isConnecting ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                          <span className="text-blue-600">Conectando</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-600">Desconectado</span>
                        </>
                      )}
                    </div>
                  </div>

                  {connectionDuration && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tiempo conectado:</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{connectionDuration}</span>
                      </div>
                    </div>
                  )}

                  {unreadCount > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Notificaciones:</span>
                      <div className="flex items-center gap-1">
                        <Bell className="h-3 w-3 text-red-500" />
                        <span className="text-red-600 font-medium">
                          {unreadCount} sin leer
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-2 bg-destructive/10 rounded-md">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                        <span className="text-xs text-destructive font-medium">Error</span>
                      </div>
                      <p className="text-xs text-destructive/80 mt-1">{error}</p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="pt-2 border-t">
                  <h5 className="text-xs font-medium mb-2">Funciones Activas:</h5>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Notificaciones instantáneas</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Estado de presencia</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>Actualizaciones en vivo</span>
                    </div>
                  </div>
                </div>

                {/* Help text */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {isConnected 
                      ? 'Recibirás notificaciones al instante sin necesidad de actualizar la página.'
                      : 'Las notificaciones se entregarán cuando se restablezca la conexión.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default RealTimeStatusIndicator
