
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { data: session, status } = useSession() || {}
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (session?.user) {
      // Add small delay to prevent middleware collision during redirect
      const timer = setTimeout(() => {
        if (session.user.role === 'SUPER_ADMIN') {
          router.replace('/platform/dashboard')
        } else {
          router.replace('/home')
        }
      }, 100)
      return () => clearTimeout(timer)
    } else {
      router.replace('/auth/signin')
    }
  }, [session, status, router])

  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">Kḥesed-tek Church Management Systems</h1>
        <p className="text-lg opacity-80">Cargando sistema...</p>
      </div>
    </div>
  )
}
