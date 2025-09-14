
import { mailgunService, EmailMessage } from './mailgun'
import { gmailService, GmailMessage } from './gmail'
import { twilioService, SMSMessage } from './twilio'
import { whatsappBusinessService, WhatsAppBusinessMessage } from './whatsapp'

export interface CommunicationStatus {
  email: {
    enabled: boolean
    provider: string
    configured: boolean
  }
  sms: {
    enabled: boolean
    provider: string
    configured: boolean
  }
  whatsapp: {
    enabled: boolean
    provider: string
    configured: boolean
  }
}

export interface BulkMessageResult {
  success: boolean
  total: number
  successful: number
  failed: number
  results: Array<{
    recipient: string
    success: boolean
    messageId?: string
    error?: string
  }>
}

export class CommunicationService {
  async sendEmail(message: EmailMessage | GmailMessage): Promise<{ success: boolean; messageId?: string; error?: string; provider: string }> {
    const defaultProvider = process.env.DEFAULT_EMAIL_PROVIDER || 'internal'
    
    // Try Gmail first if enabled and configured
    if (defaultProvider === 'gmail' && gmailService.getStatus().enabled) {
      const result = await gmailService.sendEmail(message as GmailMessage)
      return { ...result, provider: 'gmail' }
    }
    
    // Try Mailgun if enabled
    if (defaultProvider === 'mailgun' && mailgunService.getStatus().enabled) {
      const result = await mailgunService.sendEmail(message as EmailMessage)
      return { ...result, provider: 'mailgun' }
    }
    
    // Auto-fallback: Try Gmail if Mailgun is not available
    if (gmailService.getStatus().enabled && defaultProvider !== 'gmail') {
      const result = await gmailService.sendEmail(message as GmailMessage)
      return { ...result, provider: 'gmail-fallback' }
    }
    
    // Auto-fallback: Try Mailgun if Gmail is not available  
    if (mailgunService.getStatus().enabled && defaultProvider !== 'mailgun') {
      const result = await mailgunService.sendEmail(message as EmailMessage)
      return { ...result, provider: 'mailgun-fallback' }
    }
    
    // Fallback to internal email system (existing implementation)
    return this.sendInternalEmail(message as EmailMessage)
  }

  async sendSMS(message: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string; provider: string }> {
    const defaultProvider = process.env.DEFAULT_SMS_PROVIDER || 'twilio'
    
    if (defaultProvider === 'twilio') {
      const result = await twilioService.sendSMS(message)
      return { ...result, provider: 'twilio' }
    }
    
    return {
      success: false,
      error: 'No SMS provider configured',
      provider: 'none'
    }
  }

  async sendWhatsApp(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string; provider: string }> {
    // Try WhatsApp Business API first
    const result = await whatsappBusinessService.sendTextMessage(to, message)
    if (result.success) {
      return { ...result, provider: 'whatsapp-business' }
    }
    
    // Fallback to Twilio WhatsApp
    const twilioResult = await twilioService.sendWhatsApp({ to, body: message })
    if (twilioResult.success) {
      return { ...twilioResult, provider: 'twilio-whatsapp' }
    }
    
    return {
      success: false,
      error: 'No WhatsApp provider configured',
      provider: 'none'
    }
  }

  async sendBulkEmail(messages: (EmailMessage | GmailMessage)[]): Promise<BulkMessageResult> {
    const results: BulkMessageResult = {
      success: false,
      total: messages.length,
      successful: 0,
      failed: 0,
      results: []
    }

    for (const message of messages) {
      const result = await this.sendEmail(message)
      const recipients = Array.isArray(message.to) ? message.to : [message.to]
      
      for (const recipient of recipients) {
        results.results.push({
          recipient,
          success: result.success,
          messageId: result.messageId,
          error: result.error
        })
        
        if (result.success) {
          results.successful++
        } else {
          results.failed++
        }
      }
    }

    results.success = results.successful > 0
    return results
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<BulkMessageResult> {
    const results: BulkMessageResult = {
      success: false,
      total: messages.length,
      successful: 0,
      failed: 0,
      results: []
    }

    for (const message of messages) {
      const result = await this.sendSMS(message)
      results.results.push({
        recipient: message.to,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      })
      
      if (result.success) {
        results.successful++
      } else {
        results.failed++
      }
    }

    results.success = results.successful > 0
    return results
  }

  async sendBulkWhatsApp(recipients: string[], message: string): Promise<BulkMessageResult> {
    const results: BulkMessageResult = {
      success: false,
      total: recipients.length,
      successful: 0,
      failed: 0,
      results: []
    }

    for (const recipient of recipients) {
      const result = await this.sendWhatsApp(recipient, message)
      results.results.push({
        recipient,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      })
      
      if (result.success) {
        results.successful++
      } else {
        results.failed++
      }
    }

    results.success = results.successful > 0
    return results
  }

  getStatus(): CommunicationStatus {
    const mailgunStatus = mailgunService.getStatus()
    const gmailStatus = gmailService.getStatus()
    const twilioStatus = twilioService.getStatus()
    const whatsappStatus = whatsappBusinessService.getStatus()

    // Determine which email provider is primary
    const primaryEmailProvider = process.env.DEFAULT_EMAIL_PROVIDER || 'internal'
    const emailEnabled = gmailStatus.enabled || mailgunStatus.enabled
    const emailProvider = gmailStatus.enabled && primaryEmailProvider === 'gmail' ? 'gmail' :
                         mailgunStatus.enabled && primaryEmailProvider === 'mailgun' ? 'mailgun' :
                         gmailStatus.enabled ? 'gmail' :
                         mailgunStatus.enabled ? 'mailgun' : 'internal'

    return {
      email: {
        enabled: emailEnabled,
        provider: emailProvider,
        configured: gmailStatus.configured || mailgunStatus.configured
      },
      sms: {
        enabled: twilioStatus.enabled,
        provider: twilioStatus.enabled ? 'twilio' : 'none',
        configured: twilioStatus.configured
      },
      whatsapp: {
        enabled: whatsappStatus.enabled || twilioStatus.enabled,
        provider: whatsappStatus.enabled ? 'whatsapp-business' : 
                 twilioStatus.enabled ? 'twilio-whatsapp' : 'none',
        configured: whatsappStatus.configured || twilioStatus.configured
      }
    }
  }

  private async sendInternalEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string; provider: string }> {
    try {
      // This would integrate with your existing email queue system
      // For now, we'll simulate success
      console.log('Sending email via internal system:', message.subject)
      return {
        success: true,
        messageId: `internal_${Date.now()}`,
        provider: 'internal'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal email error',
        provider: 'internal'
      }
    }
  }
}

// Singleton instance
export const communicationService = new CommunicationService()
