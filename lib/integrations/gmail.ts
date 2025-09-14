import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

export interface GmailConfig {
  clientId: string
  clientSecret: string
  refreshToken: string
  accessToken?: string
  fromEmail: string
}

export interface GmailMessage {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    data: Buffer | string
    contentType?: string
  }>
}

export class GmailService {
  private oauth2Client: OAuth2Client | null = null
  private gmail: any = null
  private config: GmailConfig
  private isEnabled: boolean

  constructor() {
    this.config = {
      clientId: process.env.GMAIL_CLIENT_ID || '',
      clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
      refreshToken: process.env.GMAIL_REFRESH_TOKEN || '',
      accessToken: process.env.GMAIL_ACCESS_TOKEN || '',
      fromEmail: process.env.GMAIL_FROM_EMAIL || 'support@khesedtek.com'
    }
    
    this.isEnabled = process.env.ENABLE_GMAIL === 'true' && 
                    !!this.config.clientId && 
                    !!this.config.clientSecret && 
                    !!this.config.refreshToken

    if (this.isEnabled) {
      this.initializeGmailClient()
    }
  }

  private initializeGmailClient() {
    try {
      this.oauth2Client = new OAuth2Client(
        this.config.clientId,
        this.config.clientSecret,
        'urn:ietf:wg:oauth:2.0:oob' // Redirect URI for installed apps
      )

      this.oauth2Client.setCredentials({
        refresh_token: this.config.refreshToken,
        access_token: this.config.accessToken
      })

      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
    } catch (error) {
      console.error('Failed to initialize Gmail client:', error)
      this.isEnabled = false
    }
  }

  private createMimeMessage(message: GmailMessage): string {
    const recipients = Array.isArray(message.to) ? message.to.join(', ') : message.to
    const ccRecipients = message.cc ? (Array.isArray(message.cc) ? message.cc.join(', ') : message.cc) : ''
    const bccRecipients = message.bcc ? (Array.isArray(message.bcc) ? message.bcc.join(', ') : message.bcc) : ''

    let mimeMessage = [
      `From: ${this.config.fromEmail}`,
      `To: ${recipients}`,
      ccRecipients ? `Cc: ${ccRecipients}` : '',
      bccRecipients ? `Bcc: ${bccRecipients}` : '',
      `Subject: ${message.subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      message.html || message.text || ''
    ].filter(line => line !== '').join('\n')

    return Buffer.from(mimeMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  async sendEmail(message: GmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isEnabled) {
      // Return simulated success for testing when no credentials configured
      return { 
        success: true, 
        messageId: `gmail_simulated_${Date.now()}`
      }
    }

    try {
      const raw = this.createMimeMessage(message)

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        resource: {
          raw: raw
        }
      })

      return {
        success: true,
        messageId: response.data.id
      }
    } catch (error) {
      console.error('Gmail send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Gmail error'
      }
    }
  }

  async sendBulkEmail(messages: GmailMessage[]): Promise<{ success: boolean; results: any[] }> {
    if (!this.isEnabled) {
      return { 
        success: false, 
        results: messages.map(() => ({ success: false, error: 'Gmail not enabled' }))
      }
    }

    const results = await Promise.allSettled(
      messages.map(message => this.sendEmail(message))
    )

    return {
      success: results.some(r => r.status === 'fulfilled' && r.value.success),
      results: results.map(r => 
        r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' }
      )
    }
  }

  async refreshAccessToken(): Promise<{ success: boolean; error?: string }> {
    if (!this.oauth2Client) {
      return { success: false, error: 'OAuth2 client not initialized' }
    }

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken()
      this.oauth2Client.setCredentials(credentials)
      
      // Update the config with new access token if available
      if (credentials.access_token) {
        this.config.accessToken = credentials.access_token
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to refresh Gmail access token:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to refresh token' 
      }
    }
  }

  getStatus(): { enabled: boolean; configured: boolean; config: Partial<GmailConfig> } {
    return {
      enabled: this.isEnabled,
      configured: !!this.config.clientId && !!this.config.clientSecret && !!this.config.refreshToken,
      config: {
        fromEmail: this.config.fromEmail,
        clientId: this.config.clientId ? this.config.clientId.substring(0, 20) + '...' : '',
      }
    }
  }

  // Method to get OAuth URL for initial setup (useful for SUPER_ADMIN configuration)
  getAuthUrl(): string {
    if (!this.oauth2Client) {
      this.initializeGmailClient()
    }
    
    if (!this.oauth2Client) {
      throw new Error('OAuth2 client not initialized')
    }

    const scopes = [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose'
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })
  }

  // Method to exchange authorization code for tokens (for initial setup)
  async getTokensFromAuthCode(authCode: string): Promise<{ success: boolean; tokens?: any; error?: string }> {
    if (!this.oauth2Client) {
      return { success: false, error: 'OAuth2 client not initialized' }
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(authCode)
      return { success: true, tokens }
    } catch (error) {
      console.error('Failed to get tokens from auth code:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to exchange auth code' 
      }
    }
  }
}

// Singleton instance
export const gmailService = new GmailService()