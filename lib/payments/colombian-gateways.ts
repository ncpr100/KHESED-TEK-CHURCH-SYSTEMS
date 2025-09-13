
// Colombian Payment Gateway Integrations

export interface PaymentGateway {
  name: string
  processPayment(amount: number, currency: string, metadata: any): Promise<PaymentResult>
  verifyPayment(paymentId: string): Promise<PaymentStatus>
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  redirectUrl?: string
  error?: string
  gatewayResponse?: any
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentId: string
  amount?: number
  currency?: string
  gatewayResponse?: any
}

export interface DonationPaymentData {
  amount: number
  currency: string
  donorName: string
  donorEmail: string
  donorPhone?: string
  churchId: string
  categoryId: string
  notes?: string
  isRecurring?: boolean
  returnUrl: string
}

// PSE (Pagos Seguros en Línea) Integration
export class PSEGateway implements PaymentGateway {
  name = 'PSE'
  
  constructor(
    private merchantId: string,
    private apiKey: string,
    private testMode: boolean = true
  ) {}

  async processPayment(amount: number, currency: string, metadata: DonationPaymentData): Promise<PaymentResult> {
    try {
      const baseUrl = this.testMode 
        ? 'https://sandbox.pse.com.co/api' 
        : 'https://api.pse.com.co/api'
      
      const paymentData = {
        merchant_id: this.merchantId,
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || 'COP',
        description: `Donación - ${metadata.churchId}`,
        customer_name: metadata.donorName,
        customer_email: metadata.donorEmail,
        customer_phone: metadata.donorPhone,
        return_url: metadata.returnUrl,
        webhook_url: process.env.PSE_WEBHOOK_URL,
        reference: `DON-${Date.now()}`,
        metadata: {
          church_id: metadata.churchId,
          category_id: metadata.categoryId,
          notes: metadata.notes
        }
      }

      const response = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()
      
      if (response.ok && result.payment_url) {
        return {
          success: true,
          paymentId: result.payment_id,
          redirectUrl: result.payment_url,
          gatewayResponse: result
        }
      } else {
        return {
          success: false,
          error: result.message || 'Error procesando pago PSE',
          gatewayResponse: result
        }
      }
    } catch (error) {
      console.error('PSE Payment Error:', error)
      return {
        success: false,
        error: 'Error de conexión con PSE'
      }
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatus> {
    try {
      const baseUrl = this.testMode 
        ? 'https://sandbox.pse.com.co/api' 
        : 'https://api.pse.com.co/api'

      const response = await fetch(`${baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      const result = await response.json()
      
      return {
        status: this.mapPSEStatus(result.status),
        paymentId,
        amount: result.amount ? result.amount / 100 : undefined,
        currency: result.currency,
        gatewayResponse: result
      }
    } catch (error) {
      console.error('PSE Verify Error:', error)
      return {
        status: 'failed',
        paymentId
      }
    }
  }

  private mapPSEStatus(pseStatus: string): 'pending' | 'completed' | 'failed' | 'cancelled' {
    switch (pseStatus?.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'completed'
      case 'pending':
      case 'processing':
        return 'pending'
      case 'declined':
      case 'failed':
        return 'failed'
      case 'cancelled':
        return 'cancelled'
      default:
        return 'pending'
    }
  }
}

// Nequi Integration
export class NequiGateway implements PaymentGateway {
  name = 'Nequi'
  
  constructor(
    private clientId: string,
    private clientSecret: string,
    private testMode: boolean = true
  ) {}

  async processPayment(amount: number, currency: string, metadata: DonationPaymentData): Promise<PaymentResult> {
    try {
      const baseUrl = this.testMode 
        ? 'https://sandbox.nequi.com/api' 
        : 'https://api.nequi.com/api'
      
      // First get access token
      const tokenResponse = await fetch(`${baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      })

      const tokenData = await tokenResponse.json()
      
      if (!tokenData.access_token) {
        throw new Error('Failed to get Nequi access token')
      }

      // Create payment request
      const paymentData = {
        amount: Math.round(amount * 100), // Convert to cents
        description: `Donación - ${metadata.churchId}`,
        phone_number: metadata.donorPhone,
        callback_url: process.env.NEQUI_WEBHOOK_URL,
        reference: `DON-NEQ-${Date.now()}`,
        metadata: {
          church_id: metadata.churchId,
          category_id: metadata.categoryId,
          donor_name: metadata.donorName,
          donor_email: metadata.donorEmail
        }
      }

      const paymentResponse = await fetch(`${baseUrl}/payments/push`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      const result = await paymentResponse.json()
      
      if (paymentResponse.ok && result.transaction_id) {
        return {
          success: true,
          paymentId: result.transaction_id,
          gatewayResponse: result
        }
      } else {
        return {
          success: false,
          error: result.message || 'Error procesando pago Nequi',
          gatewayResponse: result
        }
      }
    } catch (error) {
      console.error('Nequi Payment Error:', error)
      return {
        success: false,
        error: 'Error de conexión con Nequi'
      }
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentStatus> {
    try {
      // Get access token
      const tokenResponse = await fetch(`${process.env.NEQUI_API_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        })
      })

      const tokenData = await tokenResponse.json()
      
      if (!tokenData.access_token) {
        throw new Error('Failed to get Nequi access token')
      }

      const response = await fetch(`${process.env.NEQUI_API_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      })

      const result = await response.json()
      
      return {
        status: this.mapNequiStatus(result.status),
        paymentId,
        amount: result.amount ? result.amount / 100 : undefined,
        currency: 'COP',
        gatewayResponse: result
      }
    } catch (error) {
      console.error('Nequi Verify Error:', error)
      return {
        status: 'failed',
        paymentId
      }
    }
  }

  private mapNequiStatus(nequiStatus: string): 'pending' | 'completed' | 'failed' | 'cancelled' {
    switch (nequiStatus?.toLowerCase()) {
      case 'successful':
      case 'approved':
        return 'completed'
      case 'pending':
        return 'pending'
      case 'declined':
      case 'failed':
        return 'failed'
      case 'cancelled':
        return 'cancelled'
      default:
        return 'pending'
    }
  }
}

// Payment Gateway Factory
export class PaymentGatewayFactory {
  static createGateway(gatewayType: string): PaymentGateway {
    switch (gatewayType.toLowerCase()) {
      case 'pse':
        return new PSEGateway(
          process.env.PSE_MERCHANT_ID!,
          process.env.PSE_API_KEY!,
          process.env.PSE_TEST_MODE === 'true'
        )
      
      case 'nequi':
        return new NequiGateway(
          process.env.NEQUI_CLIENT_ID!,
          process.env.NEQUI_CLIENT_SECRET!,
          process.env.NEQUI_TEST_MODE === 'true'
        )
      
      default:
        throw new Error(`Unsupported payment gateway: ${gatewayType}`)
    }
  }

  static getSupportedGateways(): Array<{id: string, name: string, description: string}> {
    return [
      {
        id: 'pse',
        name: 'PSE - Pagos Seguros en Línea',
        description: 'Pago con cualquier banco colombiano'
      },
      {
        id: 'nequi',
        name: 'Nequi',
        description: 'Pago desde tu cuenta Nequi'
      }
    ]
  }
}
