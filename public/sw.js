
// Service Worker for Push Notifications
// Kḥesed-tek Church Management Systems

const CACHE_NAME = 'khesed-tek-v1'
const OFFLINE_URL = '/offline'

// Install event
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
        '/icons/icon-192.png',
        '/icons/icon-512.png'
      ])
    })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated')
  
  event.waitUntil(
    // Clean up old caches
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      )
    }).then(() => {
      // Take control of all clients
      return self.clients.claim()
    })
  )
})

// Push event - Handle incoming push notifications
self.addEventListener('push', event => {
  console.log('📨 Push notification received:', event.data?.text())
  
  if (!event.data) {
    console.warn('Push event has no data')
    return
  }
  
  let notificationData
  try {
    notificationData = event.data.json()
  } catch (error) {
    console.error('Error parsing push data:', error)
    notificationData = {
      title: 'Kḥesed-tek Church',
      body: event.data.text() || 'Nueva notificación',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png'
    }
  }
  
  const {
    title,
    body,
    icon = '/icons/icon-192.png',
    badge = '/icons/badge-72.png',
    tag = 'khesed-notification',
    url = '/',
    actions = [],
    requireInteraction = false,
    silent = false,
    data = {}
  } = notificationData
  
  const notificationOptions = {
    body,
    icon,
    badge,
    tag,
    data: {
      url,
      timestamp: Date.now(),
      ...data
    },
    actions,
    requireInteraction,
    silent,
    vibrate: silent ? undefined : [200, 100, 200],
    timestamp: Date.now()
  }
  
  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  )
})

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('🖱️ Notification clicked:', event.notification.data)
  
  const notification = event.notification
  const action = event.action
  const data = notification.data || {}
  
  notification.close()
  
  let targetUrl = data.url || '/'
  
  // Handle action buttons
  if (action) {
    switch (action) {
      case 'view':
        targetUrl = data.actionUrl || data.url || '/'
        break
      case 'dismiss':
        return // Just close the notification
      case 'reply':
        targetUrl = `/notifications?reply=${data.notificationId}`
        break
      default:
        targetUrl = data.url || '/'
    }
  }
  
  event.waitUntil(
    // Find existing window or open new one
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      
      // Open new window if none exists
      return clients.openWindow(targetUrl)
    }).catch(error => {
      console.error('Error handling notification click:', error)
      return clients.openWindow('/')
    })
  )
})

// Notification close event
self.addEventListener('notificationclose', event => {
  console.log('❌ Notification closed:', event.notification.tag)
  
  // Track notification dismissal
  const data = event.notification.data
  if (data?.notificationId) {
    fetch('/api/notifications/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        notificationId: data.notificationId,
        action: 'dismissed',
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Error tracking notification dismissal:', error)
    })
  }
})

// Background sync for offline notifications
self.addEventListener('sync', event => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications())
  }
})

async function syncNotifications() {
  try {
    // Sync any pending notifications when back online
    const response = await fetch('/api/notifications/sync', {
      method: 'POST'
    })
    
    if (response.ok) {
      console.log('✅ Notifications synced successfully')
    }
  } catch (error) {
    console.error('❌ Error syncing notifications:', error)
  }
}

// Fetch event for offline support
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL)
      })
    )
    return
  }
  
  // Handle other requests with cache-first strategy for static assets
  if (event.request.url.includes('/icons/') || 
      event.request.url.includes('/manifest.json') ||
      event.request.url.includes('/_next/static/')) {
    
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchResponse => {
          // Cache the response for future use
          const responseClone = fetchResponse.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone)
          })
          return fetchResponse
        })
      })
    )
  }
})

// Message event for communication with main thread
self.addEventListener('message', event => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME })
      break
    case 'CACHE_URLS':
      event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
          return cache.addAll(payload.urls)
        })
      )
      break
    default:
      console.log('Unknown message type:', type)
  }
})
