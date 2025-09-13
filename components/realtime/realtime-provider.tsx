
'use client'

import { createContext, useContext, useEffect, ReactNode, useState } from 'react'
import { useSession } from 'next-auth/react'
import useRealTime, { RealTimeNotification, UserPresence } from '@/hooks/use-realtime'
import { RealTimeToast } from './realtime-toast'
import { RealTimeStatusIndicator } from './realtime-status'

interface RealTimeContextType {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  notifications: RealTimeNotification[]
  presenceUsers: UserPresence[]
  acknowledgeNotification: (notificationId: string) => Promise<boolean>
  changeStatus: (status: 'online' | 'away' | 'busy') => Promise<boolean>
  onNotification: (callback: (notification: RealTimeNotification) => void) => () => void
  onPresenceUpdate: (callback: (users: UserPresence[]) => void) => () => void
}

const RealTimeContext = createContext<RealTimeContextType | null>(null)

interface RealTimeProviderProps {
  children: ReactNode
  enableToasts?: boolean
  enablePresence?: boolean
  showStatusIndicator?: boolean
}

export function RealTimeProvider({ 
  children, 
  enableToasts = true,
  enablePresence = true,
  showStatusIndicator = true
}: RealTimeProviderProps) {
  const { data: session, status } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  
  const {
    isConnected,
    isConnecting,
    error,
    notifications,
    presenceUsers,
    acknowledgeNotification,
    changeStatus,
    onNotification,
    onPresenceUpdate
  } = useRealTime({
    enableToasts,
    enablePresence,
    autoConnect: true,
    maxNotifications: 100
  })

  // Track unread notifications
  useEffect(() => {
    const handleNewNotification = (notification: RealTimeNotification) => {
      if (notification.type === 'notification') {
        setUnreadCount(prev => prev + 1)
      }
    }

    const unsubscribe = onNotification(handleNewNotification)
    return () => {
      unsubscribe()
    }
  }, [onNotification])

  // Reset unread count when user acknowledges notifications
  const handleAcknowledgeNotification = async (notificationId: string) => {
    const success = await acknowledgeNotification(notificationId)
    if (success) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    return success
  }

  // Only provide context when user is authenticated
  if (status === 'loading') {
    return <>{children}</>
  }

  if (status !== 'authenticated') {
    return <>{children}</>
  }

  const contextValue: RealTimeContextType = {
    isConnected,
    isConnecting,
    error,
    notifications,
    presenceUsers,
    acknowledgeNotification: handleAcknowledgeNotification,
    changeStatus,
    onNotification,
    onPresenceUpdate
  }

  return (
    <RealTimeContext.Provider value={contextValue}>
      {children}
      
      {/* Real-time status indicator */}
      {showStatusIndicator && (
        <RealTimeStatusIndicator 
          isConnected={isConnected}
          isConnecting={isConnecting}
          error={error}
          unreadCount={unreadCount}
        />
      )}
      
      {/* Real-time toast notifications */}
      {enableToasts && (
        <RealTimeToast notifications={notifications} />
      )}
    </RealTimeContext.Provider>
  )
}

export function useRealTimeContext(): RealTimeContextType {
  const context = useContext(RealTimeContext)
  
  if (!context) {
    throw new Error('useRealTimeContext must be used within RealTimeProvider')
  }
  
  return context
}

// Helper hook to check if user is online
export function useIsUserOnline(userId: string): boolean {
  const { presenceUsers } = useRealTimeContext()
  return presenceUsers.some(user => user.userId === userId && user.status !== 'offline')
}

// Helper hook to get user presence
export function useUserPresence(userId: string): UserPresence | null {
  const { presenceUsers } = useRealTimeContext()
  return presenceUsers.find(user => user.userId === userId) || null
}

export default RealTimeProvider
