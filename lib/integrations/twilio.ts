
import { Twilio } from 'twilio'

export interface TwilioConfig {
  accountSid: string
  authToken: string
  phoneNumber: string
}

export interface SMSMessage {
  to: string
  body: string
  mediaUrl?: string[]
}

export interface WhatsAppMessage {
  to: string
  body: string
  mediaUrl?: string[]
}

export class TwilioService {
  private client: any
  private config: TwilioConfig
  private isEnabled: boolean

  constructor() {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
    }
    
    this.isEnabled = process.env.ENABLE_TWILIO_SMS === 'true' && 
                    !!this.config.accountSid && 
                    !!this.config.authToken

    if (this.isEnabled) {
      this.client = new Twilio(this.config.accountSid, this.config.authToken)
    }
  }

  async sendSMS(message: SMSMessage): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    if (!this.isEnabled) {
      // Return simulated success for testing when no credentials configured
      return { 
        success: true, 
        messageSid: `simulated_sms_${Date.now()}`
      }
    }

    try {
      const result = await this.client.messages.create({
        body: message.body,
        from: this.config.phoneNumber,
        to: message.to,
        ...(message.mediaUrl && { mediaUrl: message.mediaUrl })
      })

      return {
        success: true,
        messageSid: result.sid
      }
    } catch (error) {
      console.error('Twilio SMS error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Twilio error'
      }
    }
  }

  async sendWhatsApp(message: WhatsAppMessage): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    if (!this.isEnabled) {
      // Return simulated success for testing when no credentials configured
      return { 
        success: true, 
        messageSid: `simulated_whatsapp_${Date.now()}`
      }
    }

    try {
      // WhatsApp messages through Twilio use a special "whatsapp:" prefix
      const whatsappNumber = this.config.phoneNumber.startsWith('whatsapp:') 
        ? this.config.phoneNumber 
        : `whatsapp:${this.config.phoneNumber}`

      const toNumber = message.to.startsWith('whatsapp:') 
        ? message.to 
        : `whatsapp:${message.to}`

      const result = await this.client.messages.create({
        body: message.body,
        from: whatsappNumber,
        to: toNumber,
        ...(message.mediaUrl && { mediaUrl: message.mediaUrl })
      })

      return {
        success: true,
        messageSid: result.sid
      }
    } catch (error) {
      console.error('Twilio WhatsApp error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown WhatsApp error'
      }
    }
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<{ success: boolean; results: any[] }> {
    if (!this.isEnabled) {
      return { 
        success: false, 
        results: messages.map(() => ({ success: false, error: 'Twilio not enabled' }))
      }
    }

    const results = await Promise.allSettled(
      messages.map(message => this.sendSMS(message))
    )

    return {
      success: results.some(r => r.status === 'fulfilled' && r.value.success),
      results: results.map(r => 
        r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' }
      )
    }
  }

  getStatus(): { enabled: boolean; configured: boolean; config: Partial<TwilioConfig> } {
    return {
      enabled: this.isEnabled,
      configured: !!this.config.accountSid && !!this.config.authToken && !!this.config.phoneNumber,
      config: {
        accountSid: this.config.accountSid ? this.config.accountSid.substring(0, 8) + '...' : '',
        phoneNumber: this.config.phoneNumber
      }
    }
  }
}

// Singleton instance
export const twilioService = new TwilioService()
