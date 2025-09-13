
import { validateSuperAdminAccess } from '@/lib/server-auth-validator'
import SupportSettingsClient from '@/components/platform/support-settings-client'

// CRITICAL SECURITY: Server-side validation before rendering
export default async function SupportSettings() {
  // Server-side SUPER_ADMIN validation with database verification
  const { user } = await validateSuperAdminAccess()
  
  return <SupportSettingsClient user={user} />
}
