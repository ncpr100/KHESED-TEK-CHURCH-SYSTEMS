
// Client-side Push Notification utilities
// Kḥesed-tek Church Management Systems

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export class PushNotificationClient {
  private static swRegistration: ServiceWorkerRegistration | null = null
  
  /**
   * Check if push notifications are supported
   */
  static isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    )
  }

  /**
   * Get current notification permission status
   */
  static getPermission(): NotificationPermission {
    return Notification.permission
  }

  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser')
    }

    // If already granted, return immediately
    if (Notification.permission === 'granted') {
      return 'granted'
    }

    // If previously denied, show instructions
    if (Notification.permission === 'denied') {
      throw new Error('Push notifications are blocked. Please enable them in your browser settings.')
    }

    // Request permission
    const permission = await Notification.requestPermission()
    console.log('📨 Notification permission:', permission)
    
    return permission
  }

  /**
   * Register service worker
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Service Workers are not supported in this browser')
    }

    if (this.swRegistration) {
      return this.swRegistration
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('✅ Service Worker registered:', registration.scope)
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready
      
      this.swRegistration = registration
      return registration
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      throw error
    }
  }

  /**
   * Subscribe to push notifications
   */
  static async subscribe(vapidPublicKey: string): Promise<PushSubscriptionData> {
    // Ensure permission is granted
    const permission = await this.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Push notification permission not granted')
    }

    // Register service worker if not already registered
    const registration = await this.registerServiceWorker()

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      console.log('📱 Using existing push subscription')
      return this.convertSubscription(existingSubscription)
    }

    try {
      // Create new subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      console.log('✅ Push subscription created')
      return this.convertSubscription(subscription)
    } catch (error) {
      console.error('❌ Push subscription failed:', error)
      throw error
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  static async unsubscribe(): Promise<boolean> {
    if (!this.swRegistration) {
      return true // Already unsubscribed
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        const result = await subscription.unsubscribe()
        console.log('✅ Push subscription removed')
        return result
      }
      return true
    } catch (error) {
      console.error('❌ Push unsubscribe failed:', error)
      return false
    }
  }

  /**
   * Get current subscription
   */
  static async getSubscription(): Promise<PushSubscriptionData | null> {
    if (!this.swRegistration) {
      try {
        await this.registerServiceWorker()
      } catch {
        return null
      }
    }

    try {
      const subscription = await this.swRegistration!.pushManager.getSubscription()
      return subscription ? this.convertSubscription(subscription) : null
    } catch (error) {
      console.error('❌ Error getting subscription:', error)
      return null
    }
  }

  /**
   * Show a test notification
   */
  static async showTestNotification(): Promise<void> {
    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    const notification = new Notification('¡Prueba Exitosa!', {
      body: 'Las notificaciones push están funcionando correctamente.',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      tag: 'test-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200]
    })

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close()
    }, 5000)
  }

  /**
   * Convert PushSubscription to our data format
   */
  private static convertSubscription(subscription: PushSubscription): PushSubscriptionData {
    const keys = subscription.getKey('p256dh')
    const auth = subscription.getKey('auth')

    if (!keys || !auth) {
      throw new Error('Unable to get subscription keys')
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(keys))),
        auth: btoa(String.fromCharCode(...new Uint8Array(auth)))
      }
    }
  }

  /**
   * Convert VAPID public key to Uint8Array
   */
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  /**
   * Send message to service worker
   */
  static async sendMessage(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!navigator.serviceWorker.controller) {
        reject(new Error('No service worker controller'))
        return
      }

      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error))
        } else {
          resolve(event.data)
        }
      }

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2])
    })
  }

  /**
   * Get browser and platform information
   */
  static getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language || navigator.languages[0]
    }
  }

  /**
   * Check if device is mobile
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  /**
   * Get notification capabilities
   */
  static getCapabilities() {
    return {
      supported: this.isSupported(),
      permission: this.getPermission(),
      mobile: this.isMobile(),
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      hasNotification: 'Notification' in window
    }
  }
}

// Note: PushSubscriptionData type is defined above
