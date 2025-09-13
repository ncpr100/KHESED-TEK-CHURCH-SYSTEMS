
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { RealTimeProvider } from '@/components/realtime/realtime-provider'
import { ServiceWorkerRegistration } from '@/components/service-worker-registration'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode
  session?: any
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <RealTimeProvider
          enableToasts={true}
          enablePresence={true}
          showStatusIndicator={true}
        >
          <ServiceWorkerRegistration />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          {children}
        </RealTimeProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
