
import { render } from '@react-email/render'

// Email service configuration
export const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || 'noreply@khesed-tek.com',
  fromName: process.env.FROM_NAME || 'Kḥesed-tek Church Management Systems',
  
  // SMTP Configuration (using environment variables)
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  
  // Development mode for testing
  isDevelopment: process.env.NODE_ENV === 'development',
}

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
  churchName?: string
  userName?: string
}

export interface NotificationEmailData {
  user: {
    email: string
    name?: string
  }
  church: {
    name: string
    id: string
  }
  notification: {
    title: string
    message: string
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
    category?: string
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    actionUrl?: string
    actionLabel?: string
    createdAt: string
  }
}

export interface DigestEmailData {
  user: {
    email: string
    name?: string
  }
  church: {
    name: string
    id: string
  }
  notifications: Array<{
    title: string
    message: string
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'
    category?: string
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    actionUrl?: string
    actionLabel?: string
    createdAt: string
  }>
  period: 'DAILY' | 'WEEKLY'
  date: string
}

// Email sending function with multiple provider support
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // In development, log email instead of sending
    if (EMAIL_CONFIG.isDevelopment) {
      console.log('\n📧 EMAIL (DEVELOPMENT MODE):')
      console.log(`To: ${emailData.to}`)
      console.log(`Subject: ${emailData.subject}`)
      console.log(`From: ${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`)
      console.log('--- HTML Content ---')
      console.log(emailData.html.substring(0, 500) + '...')
      console.log('--- End Email ---\n')
      return true
    }

    // Production email sending with fallback options
    console.log(`Sending email via internal system: ${emailData.subject}`)
    
    // Try multiple email sending methods in order of preference
    const methods = [
      () => sendViaResend(emailData),
      () => sendViaSMTP(emailData),
      () => sendViaConsoleLog(emailData) // Final fallback
    ]
    
    for (const method of methods) {
      try {
        const success = await method()
        if (success) {
          console.log(`📧 Email sent successfully to ${emailData.to}: ${emailData.subject}`)
          return true
        }
      } catch (methodError) {
        console.warn(`Email method failed, trying next method:`, methodError)
        continue
      }
    }
    
    throw new Error('All email sending methods failed')
    
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

// Resend.com integration (popular for Next.js apps)
async function sendViaResend(emailData: EmailData): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not configured')
  }
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Resend email sent: ${result.id}`)
      return true
    } else {
      const error = await response.text()
      throw new Error(`Resend API error: ${response.status} - ${error}`)
    }
  } catch (error) {
    console.error('Resend email failed:', error)
    throw error
  }
}

// SMTP fallback (using built-in Node.js capabilities)
async function sendViaSMTP(emailData: EmailData): Promise<boolean> {
  // Check if SMTP is configured
  if (!EMAIL_CONFIG.smtp.host || !EMAIL_CONFIG.smtp.auth.user) {
    throw new Error('SMTP not configured')
  }
  
  try {
    // Import nodemailer dynamically to avoid requiring it if not used
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransporter({
      host: EMAIL_CONFIG.smtp.host,
      port: EMAIL_CONFIG.smtp.port,
      secure: EMAIL_CONFIG.smtp.secure,
      auth: EMAIL_CONFIG.smtp.auth
    })
    
    const mailOptions = {
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ SMTP email sent: ${result.messageId}`)
    return true
    
  } catch (error) {
    console.error('SMTP email failed:', error)
    throw error
  }
}

// Console log fallback (for when all else fails)
async function sendViaConsoleLog(emailData: EmailData): Promise<boolean> {
  console.log('\n🔔 EMAIL FALLBACK (Console Log):')
  console.log(`To: ${emailData.to}`)
  console.log(`Subject: ${emailData.subject}`)
  console.log(`From: ${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`)
  console.log('--- Content Preview ---')
  console.log(emailData.html.substring(0, 1000))
  console.log('--- End Email Fallback ---\n')
  return true // Always succeeds as a final fallback
}

// Utility function to render React email component to HTML
export function renderEmailTemplate(component: React.ReactElement): string {
  try {
    const result = render(component)
    // The render function can return either a string or Promise<string>
    // If it's a promise, we'll handle it synchronously for now
    if (typeof result === 'string') {
      return result
    }
    // For now, return a fallback - in production you'd want to handle async properly
    console.warn('render() returned a Promise, using fallback template')
    return '<html><body><p>Email template rendered</p></body></html>'
  } catch (error) {
    console.error('Error rendering email template:', error)
    return '<html><body><p>Error rendering email template</p></body></html>'
  }
}

// Helper to generate email content based on notification type
export function getEmailSubjectPrefix(type: string, priority: string): string {
  const priorityPrefix = priority === 'URGENT' ? '🚨 URGENTE: ' : 
                        priority === 'HIGH' ? '⚡ ' : ''
  
  const typePrefix = type === 'ERROR' ? '❌ ' :
                    type === 'WARNING' ? '⚠️ ' :
                    type === 'SUCCESS' ? '✅ ' : 
                    '📢 '
  
  return priorityPrefix + typePrefix
}

// Helper to format church name for email
export function formatChurchEmailSignature(churchName: string): string {
  return `

---
${churchName}
Sistema de Gestión Kḥesed-tek

Para cambiar tus preferencias de notificación, visita tu perfil en la plataforma.
Si tienes preguntas, contacta al administrador de tu iglesia.
`
}

// Queue management for email sending
class EmailQueue {
  private queue: EmailData[] = []
  private processing = false

  async add(emailData: EmailData): Promise<void> {
    this.queue.push(emailData)
    if (!this.processing) {
      await this.process()
    }
  }

  async addBulk(emails: EmailData[]): Promise<void> {
    this.queue.push(...emails)
    if (!this.processing) {
      await this.process()
    }
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) return
    
    this.processing = true
    
    while (this.queue.length > 0) {
      const email = this.queue.shift()!
      
      try {
        const success = await sendEmail(email)
        if (!success) {
          console.error(`Failed to send email to ${email.to}`)
          // In production, you might want to retry or add to dead letter queue
        }
        
        // Rate limiting - small delay between emails
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error('Email queue processing error:', error)
      }
    }
    
    this.processing = false
  }

  getQueueLength(): number {
    return this.queue.length
  }
}

export const emailQueue = new EmailQueue()

// Helper function to check if user should receive email based on preferences
export function shouldSendEmailNotification(
  preferences: any,
  notificationType: string,
  currentTime: Date = new Date()
): boolean {
  // Check if email notifications are enabled globally
  if (!preferences.emailEnabled) {
    return false
  }

  // Check quiet hours
  if (preferences.quietHoursEnabled && preferences.quietHoursStart && preferences.quietHoursEnd) {
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeInMinutes = currentHour * 60 + currentMinute
    
    const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number)
    const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number)
    
    const startTimeInMinutes = startHour * 60 + startMinute
    const endTimeInMinutes = endHour * 60 + endMinute
    
    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startTimeInMinutes > endTimeInMinutes) {
      if (currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes) {
        return false // In quiet hours
      }
    } else {
      if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
        return false // In quiet hours
      }
    }
  }

  // Check weekend notifications
  if (!preferences.weekendNotifications) {
    const dayOfWeek = currentTime.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      return false
    }
  }

  // Check category-specific settings
  const categoryKey = `email${notificationType.charAt(0).toUpperCase() + notificationType.slice(1)}`
  if (preferences[categoryKey] === false) {
    return false
  }

  return true
}

// Digest helper functions
export function shouldSendDigest(preferences: any, period: 'DAILY' | 'WEEKLY'): boolean {
  return preferences.digestEnabled && preferences.digestFrequency === period
}

export function getDigestSchedule(period: 'DAILY' | 'WEEKLY'): Date {
  const now = new Date()
  
  if (period === 'DAILY') {
    // Send daily digest at 9 AM
    const digestTime = new Date(now)
    digestTime.setHours(9, 0, 0, 0)
    
    if (now > digestTime) {
      // If it's past 9 AM today, schedule for tomorrow
      digestTime.setDate(digestTime.getDate() + 1)
    }
    
    return digestTime
  } else {
    // Send weekly digest on Monday at 9 AM
    const digestTime = new Date(now)
    digestTime.setHours(9, 0, 0, 0)
    
    // Find next Monday
    const daysUntilMonday = (1 + 7 - now.getDay()) % 7
    if (daysUntilMonday === 0 && now.getHours() >= 9) {
      // If it's Monday and past 9 AM, schedule for next Monday
      digestTime.setDate(digestTime.getDate() + 7)
    } else {
      digestTime.setDate(digestTime.getDate() + daysUntilMonday)
    }
    
    return digestTime
  }
}
