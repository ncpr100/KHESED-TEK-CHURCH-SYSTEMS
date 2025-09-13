
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Types
export interface RealTimeNotification {
  id: string
  type: 'notification' | 'system' | 'chat' | 'presence'
  data: any
  userId?: string
  churchId?: string
  role?: string
  timestamp: number
}

export interface UserPresence {
  userId: string
  name: string
  status: 'online' | 'away' | 'busy' | 'offline'
  currentPage?: string
  lastSeen: Date
}

export interface ConnectionStats {
  totalConnections: number
  uniqueUsers: number
  averageConnectionsPerUser: number
}

export interface RealTimeState {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  notifications: RealTimeNotification[]
  presenceUsers: UserPresence[]
  stats: ConnectionStats | null
  connectionId: string | null
}

interface UseRealTimeOptions {
  enableToasts?: boolean
  enablePresence?: boolean
  enableStats?: boolean
  autoConnect?: boolean
  maxNotifications?: number
}

export function useRealTime(options: UseRealTimeOptions = {}) {
  const {
    enableToasts = true,
    enablePresence = false,
    enableStats = false,
    autoConnect = true,
    maxNotifications = 50
  } = options

  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  
  const [state, setState] = useState<RealTimeState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    notifications: [],
    presenceUsers: [],
    stats: null,
    connectionId: null
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCount = useRef(0)
  const maxRetries = 5
  
  // Callbacks for external components
  const [onNotificationCallbacks] = useState<Set<(notification: RealTimeNotification) => void>>(new Set())
  const [onPresenceCallbacks] = useState<Set<(presence: UserPresence[]) => void>>(new Set())

  const updateState = useCallback((updates: Partial<RealTimeState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const connect = useCallback(() => {
    if (status !== 'authenticated' || !session?.user?.email) {
      return
    }

    if (eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN) {
      return
    }

    updateState({ isConnecting: true, error: null })

    try {
      const eventSource = new EventSource('/api/realtime/events')
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('📡 Connected to real-time server (SSE)')
        retryCount.current = 0
        updateState({ 
          isConnected: true, 
          isConnecting: false, 
          error: null 
        })
      }

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          // Handle different message types
          switch (message.type) {
            case 'connection':
              updateState({ connectionId: message.data.connectionId })
              break
            case 'heartbeat':
              // Keep connection alive, no action needed
              break
            case 'notification':
            case 'presence':
            case 'system':
            case 'chat':
              handleRealTimeMessage(message)
              break
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      eventSource.onerror = (event) => {
        console.error('📡 SSE connection error:', event)
        
        // Safely handle the error event object
        const errorMessage = event && typeof event === 'object' && 'message' in event 
          ? (event as any).message 
          : 'Conexión perdida con el servidor'
        
        updateState({ 
          isConnected: false, 
          connectionId: null 
        })

        if (eventSource.readyState === EventSource.CLOSED) {
          updateState({ 
            isConnecting: false, 
            error: errorMessage
          })
          scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('Error creating EventSource:', error)
      updateState({ 
        isConnecting: false, 
        error: 'Error al conectar con el servidor' 
      })
      scheduleReconnect()
    }
  }, [session, status])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    updateState({ 
      isConnected: false, 
      isConnecting: false, 
      connectionId: null 
    })
  }, [updateState])

  const scheduleReconnect = useCallback(() => {
    if (retryCount.current >= maxRetries) {
      console.log('📡 Max reconnection attempts reached')
      updateState({ error: 'No se pudo reconectar al servidor después de varios intentos' })
      return
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000) // Exponential backoff, max 30s
    retryCount.current++

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
        console.log(`📡 Attempting to reconnect (attempt ${retryCount.current}/${maxRetries})`)
        connect()
      }
    }, delay)
  }, [connect, maxRetries, updateState])

  // Handle real-time messages
  const handleRealTimeMessage = useCallback((message: RealTimeNotification) => {
    console.log('📱 Real-time message received:', message)
    
    // Update notifications list
    setState(prev => ({
      ...prev,
      notifications: [
        message,
        ...prev.notifications.slice(0, maxNotifications - 1)
      ]
    }))

    // Handle different message types
    switch (message.type) {
      case 'notification':
        handleNotification(message)
        break
      case 'presence':
        handlePresence(message)
        break
      case 'system':
        handleSystemNotification(message)
        break
      case 'chat':
        handleChatNotification(message)
        break
    }

    // Call external callbacks
    onNotificationCallbacks.forEach(callback => {
      try {
        callback(message)
      } catch (error) {
        console.error('Error in notification callback:', error)
      }
    })
  }, [maxNotifications, onNotificationCallbacks])

  // Notification handlers
  const handleNotification = useCallback((notification: RealTimeNotification) => {
    const data = notification.data
    
    if (enableToasts) {
      // Show toast notification based on priority
      const toastOptions = {
        duration: data.priority === 'URGENT' ? 8000 : 4000,
        style: data.priority === 'URGENT' ? { border: '2px solid red' } : {}
      }

      switch (data.priority) {
        case 'URGENT':
          toast.error(`🚨 ${data.title}: ${data.message}`, toastOptions)
          break
        case 'HIGH':
          toast(`⚡ ${data.title}: ${data.message}`, toastOptions)
          break
        default:
          toast.success(`📢 ${data.title}`, toastOptions)
          break
      }
    }

    // Auto-redirect for action notifications
    if (data.actionUrl && data.priority === 'URGENT') {
      // You might want to ask user before redirecting
      console.log('Auto-redirect available:', data.actionUrl)
    }
  }, [enableToasts])

  const handlePresence = useCallback((notification: RealTimeNotification) => {
    if (!enablePresence) return

    const data = notification.data
    
    setState(prev => {
      const updatedUsers = [...prev.presenceUsers]
      const existingIndex = updatedUsers.findIndex(u => u.userId === data.userId)
      
      if (data.status === 'offline') {
        // Remove offline user
        if (existingIndex >= 0) {
          updatedUsers.splice(existingIndex, 1)
        }
      } else {
        // Update or add online user
        const userData: UserPresence = {
          userId: data.userId,
          name: data.name,
          status: data.status,
          currentPage: data.currentPage,
          lastSeen: new Date(data.timestamp)
        }

        if (existingIndex >= 0) {
          updatedUsers[existingIndex] = userData
        } else {
          updatedUsers.push(userData)
        }
      }

      // Call presence callbacks
      onPresenceCallbacks.forEach(callback => {
        try {
          callback(updatedUsers)
        } catch (error) {
          console.error('Error in presence callback:', error)
        }
      })

      return {
        ...prev,
        presenceUsers: updatedUsers
      }
    })
  }, [enablePresence, onPresenceCallbacks])

  const handleSystemNotification = useCallback((notification: RealTimeNotification) => {
    const data = notification.data
    
    if (enableToasts) {
      toast(`🔧 Sistema: ${data.message}`, {
        duration: 6000,
        style: { backgroundColor: '#f3f4f6' }
      })
    }
  }, [enableToasts])

  const handleChatNotification = useCallback((notification: RealTimeNotification) => {
    // Handle chat messages (if you implement chat functionality)
    console.log('Chat notification:', notification)
  }, [])

  // Utility functions - Since EventSource is read-only, these make HTTP requests
  const sendMessage = useCallback(async (type: string, data: any) => {
    try {
      const response = await fetch('/api/realtime/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data })
      })
      return response.ok
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }, [])

  const acknowledgeNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications/acknowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId })
      })
      return response.ok
    } catch (error) {
      console.error('Error acknowledging notification:', error)
      return false
    }
  }, [])

  const changeStatus = useCallback(async (status: 'online' | 'away' | 'busy') => {
    return await sendMessage('status-change', { status })
  }, [sendMessage])

  const updateCurrentPage = useCallback(async (page: string) => {
    return await sendMessage('page-change', { page })
  }, [sendMessage])

  // Callback management
  const onNotification = useCallback((callback: (notification: RealTimeNotification) => void) => {
    onNotificationCallbacks.add(callback)
    return () => onNotificationCallbacks.delete(callback)
  }, [onNotificationCallbacks])

  const onPresenceUpdate = useCallback((callback: (users: UserPresence[]) => void) => {
    onPresenceCallbacks.add(callback)
    return () => onPresenceCallbacks.delete(callback)
  }, [onPresenceCallbacks])

  // Effects
  useEffect(() => {
    if (autoConnect && status === 'authenticated') {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, status, connect, disconnect])

  // Update current page when pathname changes
  useEffect(() => {
    if (state.isConnected && pathname) {
      updateCurrentPage(pathname)
    }
  }, [pathname, state.isConnected, updateCurrentPage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    // Connection state
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    error: state.error,
    connectionId: state.connectionId,
    
    // Data
    notifications: state.notifications,
    presenceUsers: state.presenceUsers,
    stats: state.stats,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    acknowledgeNotification,
    changeStatus,
    updateCurrentPage,
    
    // Callbacks
    onNotification,
    onPresenceUpdate
  }
}

export default useRealTime
