

import { PlatformSidebar } from '@/components/platform/platform-sidebar'
import { PlatformHeader } from '@/components/platform/platform-header'
import { validateSuperAdminAccess } from '@/lib/server-auth-validator'

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // CRITICAL SECURITY: Server-side SUPER_ADMIN validation with database verification
  const { session } = await validateSuperAdminAccess()

  return (
    <div className="flex h-screen bg-gray-100">
      <PlatformSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <PlatformHeader user={session.user} />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

