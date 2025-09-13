
import { redirect } from 'next/navigation'

export default async function AdvancedEventsRedirect() {
  // Redirect to the new unified events page
  redirect('/events')
}
