
'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          
          // Update service worker when available
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available
                  console.log('🔄 Service Worker actualizado disponible')
                  
                  // Optionally show update notification to user
                  if (window.confirm('Nueva versión disponible. ¿Desea actualizar?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' })
                    window.location.reload()
                  }
                }
              })
            }
          })

          // Handle service worker updates
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload()
          })

          console.log('✅ Service Worker registrado:', registration.scope)
        } catch (error) {
          console.warn('❌ Service Worker registration falló:', error)
        }
      }

      // Register service worker after the page is loaded
      window.addEventListener('load', registerServiceWorker)
      
      return () => {
        window.removeEventListener('load', registerServiceWorker)
      }
    }
  }, [])

  return null // This component doesn't render anything
}
