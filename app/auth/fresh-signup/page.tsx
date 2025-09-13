
import { Suspense } from 'react'
import StreamlinedChurchRegistration from '@/components/auth/streamlined-church-registration'
import { Loader2 } from 'lucide-react'

export default function FreshSignupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <StreamlinedChurchRegistration />
    </Suspense>
  )
}

export const metadata = {
  title: 'Solicitar Cuenta - Khesed-tek',
  description: 'Solicita una cuenta para tu iglesia en la plataforma Khesed-tek',
}
