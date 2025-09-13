
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { PushNotificationClient, PushSubscriptionData } from '@/lib/push-client'
import { toast } from 'react-hot-toast'

export interface PushNotificationState {
  isSupported: boolean
  permission: NotificationPermission
  isSubscribed: boolean
  isLoading: boolean
  subscription: PushSubscriptionData | null
}

export interface PushNotificationActions {
  requestPermission: () => Promise<boolean>
  subscribe: () => Promise<boolean>
  unsubscribe: () => Promise<boolean>
  showTestNotification: () => Promise<void>
  checkSubscription: () => Promise<void>
}

export function usePushNotifications(): PushNotificationState & PushNotificationActions {
  const { data: session } = useSession()
  
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: true,
    subscription: null
  })

  // Initialize push notification capabilities
  useEffect(() => {
    const initialize = async () => {
      try {
        const isSupported = PushNotificationClient.isSupported()
        const permission = PushNotificationClient.getPermission()
        
        setState(prev => ({
          ...prev,
          isSupported,
          permission,
          isLoading: true
        }))

        if (isSupported && permission === 'granted') {
          await checkSubscription()
        } else {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Error initializing push notifications:', error)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initialize()
  }, [])

  // Check current subscription status
  const checkSubscription = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const subscription = await PushNotificationClient.getSubscription()
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
        isLoading: false
      }))
    } catch (error) {
      console.error('Error checking subscription:', error)
      setState(prev => ({ 
        ...prev, 
        isSubscribed: false,
        subscription: null,
        isLoading: false 
      }))
    }
  }, [])

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      const permission = await PushNotificationClient.requestPermission()
      
      setState(prev => ({
        ...prev,
        permission,
        isLoading: false
      }))

      if (permission === 'granted') {
        toast.success('¡Permisos de notificación concedidos!')
        return true
      } else if (permission === 'denied') {
        toast.error('Permisos de notificación denegados. Puedes habilitarlos en la configuración del navegador.')
        return false
      } else {
        toast.error('Permisos de notificación no concedidos.')
        return false
      }
    } catch (error) {
      console.error('Error requesting permission:', error)
      toast.error('Error al solicitar permisos de notificación')
      setState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [])

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.id) {
      toast.error('Debes iniciar sesión para activar las notificaciones')
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }))

      // Get VAPID public key from server
      const keyResponse = await fetch('/api/push-notifications/vapid-key')
      if (!keyResponse.ok) {
        throw new Error('Failed to get VAPID key')
      }
      
      const { publicKey } = await keyResponse.json()
      
      // Subscribe with push service
      const subscription = await PushNotificationClient.subscribe(publicKey)
      
      // Save subscription to server
      const saveResponse = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          deviceInfo: PushNotificationClient.getDeviceInfo()
        })
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save subscription to server')
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false
      }))

      toast.success('¡Notificaciones push activadas exitosamente!')
      return true
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('Error al activar las notificaciones push')
      setState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [session?.user?.id])

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))

      // Unsubscribe from push service
      const unsubscribed = await PushNotificationClient.unsubscribe()
      
      if (unsubscribed && state.subscription) {
        // Remove subscription from server
        await fetch('/api/push-notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: state.subscription.endpoint
          })
        })
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false
      }))

      toast.success('Notificaciones push desactivadas')
      return true
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      toast.error('Error al desactivar las notificaciones push')
      setState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }, [state.subscription])

  // Show test notification
  const showTestNotification = useCallback(async (): Promise<void> => {
    try {
      await PushNotificationClient.showTestNotification()
      toast.success('¡Notificación de prueba enviada!')
    } catch (error) {
      console.error('Error showing test notification:', error)
      toast.error('Error al mostrar notificación de prueba')
    }
  }, [])

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showTestNotification,
    checkSubscription
  }
}

// Hook for getting push notification stats (admin use)
export function usePushNotificationStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<{
    totalSubscriptions: number
    activeSubscriptions: number
    subscriptionsByPlatform: Record<string, number>
    recentActivity: number
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN_IGLESIA'].includes(session.user.role)) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/push-notifications/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching push notification stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session])

  return { stats, loading }
}
