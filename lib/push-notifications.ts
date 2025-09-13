
// Push Notifications Service
// Kḥesed-tek Church Management Systems

import { prisma } from '@/lib/prisma'

// Types for push notifications
export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  url?: string
  actionUrl?: string
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  requireInteraction?: boolean
  silent?: boolean
  vibrate?: number[]
  data?: Record<string, any>
}

// VAPID keys configuration (you should generate these and store in environment variables)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@khesed-tek.com'

export class PushNotificationService {
  
  /**
   * Get VAPID public key for client-side subscription
   */
  static getPublicKey(): string {
    return VAPID_PUBLIC_KEY
  }

  /**
   * Save push subscription to database
   */
  static async saveSubscription(
    userId: string, 
    churchId: string,
    subscription: PushSubscription,
    deviceInfo?: {
      userAgent?: string
      platform?: string
      language?: string
    }
  ): Promise<void> {
    try {
      // Check if subscription already exists
      const existingSubscription = await prisma.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: subscription.endpoint
        }
      })

      if (existingSubscription) {
        // Update existing subscription
        await prisma.pushSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            isActive: true,
            userAgent: deviceInfo?.userAgent,
            platform: deviceInfo?.platform,
            language: deviceInfo?.language,
            updatedAt: new Date()
          }
        })
      } else {
        // Create new subscription
        await prisma.pushSubscription.create({
          data: {
            userId,
            churchId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            isActive: true,
            userAgent: deviceInfo?.userAgent,
            platform: deviceInfo?.platform,
            language: deviceInfo?.language
          }
        })
      }

      console.log('✅ Push subscription saved for user:', userId)
    } catch (error) {
      console.error('❌ Error saving push subscription:', error)
      throw error
    }
  }

  /**
   * Remove push subscription from database
   */
  static async removeSubscription(userId: string, endpoint: string): Promise<void> {
    try {
      await prisma.pushSubscription.updateMany({
        where: {
          userId,
          endpoint
        },
        data: {
          isActive: false
        }
      })

      console.log('✅ Push subscription removed for user:', userId)
    } catch (error) {
      console.error('❌ Error removing push subscription:', error)
      throw error
    }
  }

  /**
   * Send push notification to specific user
   */
  static async sendToUser(
    userId: string,
    payload: PushNotificationPayload
  ): Promise<{ success: number; failed: number }> {
    try {
      // Get user's active subscriptions
      const subscriptions = await prisma.pushSubscription.findMany({
        where: {
          userId,
          isActive: true
        }
      })

      if (subscriptions.length === 0) {
        console.log('No active push subscriptions found for user:', userId)
        return { success: 0, failed: 0 }
      }

      // Send to all user's subscriptions
      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendPushNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        }, payload))
      )

      const success = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      // Clean up invalid subscriptions
      const failedSubscriptions = results
        .map((result, index) => ({ result, subscription: subscriptions[index] }))
        .filter(({ result }) => result.status === 'rejected')

      for (const { subscription } of failedSubscriptions) {
        await this.removeSubscription(userId, subscription.endpoint)
      }

      return { success, failed }
    } catch (error) {
      console.error('❌ Error sending push notification to user:', error)
      return { success: 0, failed: 1 }
    }
  }

  /**
   * Send push notification to multiple users
   */
  static async sendToUsers(
    userIds: string[],
    payload: PushNotificationPayload
  ): Promise<{ success: number; failed: number; totalUsers: number }> {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, payload))
    )

    const totalSuccess = results
      .filter((r): r is PromiseFulfilledResult<{ success: number; failed: number }> => r.status === 'fulfilled')
      .reduce((sum, r) => sum + (r.value?.success || 0), 0)

    const totalFailed = results
      .filter((r): r is PromiseFulfilledResult<{ success: number; failed: number }> => r.status === 'fulfilled')
      .reduce((sum, r) => sum + (r.value?.failed || 0), 0) +
      results.filter(r => r.status === 'rejected').length

    return {
      success: totalSuccess,
      failed: totalFailed,
      totalUsers: userIds.length
    }
  }

  /**
   * Send push notification to all users in a church
   */
  static async sendToChurch(
    churchId: string,
    payload: PushNotificationPayload,
    targetRoles?: string[]
  ): Promise<{ success: number; failed: number; totalUsers: number }> {
    try {
      // Get users from the church
      const whereClause: any = {
        churchId,
        isActive: true
      }

      if (targetRoles && targetRoles.length > 0) {
        whereClause.role = {
          in: targetRoles
        }
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        select: { id: true }
      })

      const userIds = users.map(u => u.id)
      return await this.sendToUsers(userIds, payload)
    } catch (error) {
      console.error('❌ Error sending push notification to church:', error)
      return { success: 0, failed: 1, totalUsers: 0 }
    }
  }

  /**
   * Send push notification to users with specific role
   */
  static async sendToRole(
    churchId: string,
    role: string,
    payload: PushNotificationPayload
  ): Promise<{ success: number; failed: number; totalUsers: number }> {
    return await this.sendToChurch(churchId, payload, [role])
  }

  /**
   * Send actual push notification using Web Push API
   */
  private static async sendPushNotification(
    subscription: PushSubscription,
    payload: PushNotificationPayload
  ): Promise<void> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      throw new Error('VAPID keys not configured')
    }

    // In a real implementation, you would use a library like 'web-push'
    // For now, we'll simulate the push notification
    console.log('📨 Sending push notification:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      title: payload.title,
      body: payload.body
    })

    // TODO: Implement actual web push using 'web-push' library
    // const webpush = require('web-push')
    // webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
    // await webpush.sendNotification(subscription, JSON.stringify(payload))

    // For demonstration, we'll use a mock implementation
    await this.mockWebPush(subscription, payload)
  }

  /**
   * Mock web push implementation for demonstration
   */
  private static async mockWebPush(
    subscription: PushSubscription,
    payload: PushNotificationPayload
  ): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Push notification delivery failed')
    }

    console.log('✅ Push notification sent successfully')
  }

  /**
   * Get push notification statistics
   */
  static async getStats(churchId: string): Promise<{
    totalSubscriptions: number
    activeSubscriptions: number
    subscriptionsByPlatform: Record<string, number>
    recentActivity: number
  }> {
    try {
      const [
        totalSubscriptions,
        activeSubscriptions,
        platformStats,
        recentActivity
      ] = await Promise.all([
        prisma.pushSubscription.count({
          where: { churchId }
        }),
        prisma.pushSubscription.count({
          where: { churchId, isActive: true }
        }),
        prisma.pushSubscription.groupBy({
          by: ['platform'],
          where: { churchId, isActive: true },
          _count: true
        }),
        prisma.pushSubscription.count({
          where: {
            churchId,
            isActive: true,
            updatedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          }
        })
      ])

      const subscriptionsByPlatform = platformStats.reduce(
        (acc, stat) => {
          acc[stat.platform || 'unknown'] = stat._count
          return acc
        },
        {} as Record<string, number>
      )

      return {
        totalSubscriptions,
        activeSubscriptions,
        subscriptionsByPlatform,
        recentActivity
      }
    } catch (error) {
      console.error('❌ Error getting push notification stats:', error)
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        subscriptionsByPlatform: {},
        recentActivity: 0
      }
    }
  }
}

// Helper functions for notification formatting
export const NotificationTemplates = {
  welcome: (memberName: string): PushNotificationPayload => ({
    title: '¡Bienvenido a nuestra familia!',
    body: `¡Hola ${memberName}! Nos alegra tenerte con nosotros.`,
    icon: '/icons/welcome.png',
    tag: 'welcome',
    url: '/dashboard',
    actions: [
      { action: 'view', title: 'Ver Dashboard', icon: '/icons/home.png' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  }),

  donation: (amount: number, currency: string = 'USD'): PushNotificationPayload => ({
    title: '¡Gracias por tu donación!',
    body: `Tu donación de ${amount} ${currency} ha sido recibida. Dios te bendiga.`,
    icon: '/icons/donation.png',
    tag: 'donation',
    url: '/donations',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Ver Donaciones', icon: '/icons/heart.png' }
    ]
  }),

  event: (eventName: string, eventDate: Date): PushNotificationPayload => ({
    title: 'Nuevo Evento',
    body: `${eventName} - ${eventDate.toLocaleDateString()}`,
    icon: '/icons/event.png',
    tag: 'event',
    url: '/events',
    actions: [
      { action: 'view', title: 'Ver Evento', icon: '/icons/calendar.png' },
      { action: 'dismiss', title: 'Más tarde' }
    ]
  }),

  birthday: (memberName: string): PushNotificationPayload => ({
    title: '🎉 ¡Feliz Cumpleaños!',
    body: `Hoy es el cumpleaños de ${memberName}. ¡Únete a las felicitaciones!`,
    icon: '/icons/birthday.png',
    tag: 'birthday',
    url: '/members',
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'view', title: 'Felicitar', icon: '/icons/gift.png' }
    ]
  }),

  reminder: (title: string, message: string, url?: string): PushNotificationPayload => ({
    title: `Recordatorio: ${title}`,
    body: message,
    icon: '/icons/reminder.png',
    tag: 'reminder',
    url: url || '/dashboard',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Ver Detalles' },
      { action: 'dismiss', title: 'Recordar Después' }
    ]
  })
}
