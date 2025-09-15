/**
 * Environment Variable Validation Utility
 * 
 * This utility helps validate required environment variables
 * and provides helpful error messages for deployment issues.
 */

export interface EnvironmentValidation {
  isValid: boolean
  missing: string[]
  warnings: string[]
  errors: string[]
}

/**
 * Core environment variables required for the application to function
 */
export const REQUIRED_ENV_VARS = {
  // NextAuth Configuration
  NEXTAUTH_SECRET: {
    required: true,
    description: 'Secret key for NextAuth.js JWT encryption. Generate with: openssl rand -base64 32',
    example: 'your-32-character-secret-key-here'
  },
  NEXTAUTH_URL: {
    required: true,
    description: 'Base URL of your application',
    example: 'https://your-domain.com or http://localhost:3000'
  },
  
  // Database Configuration
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL database connection string',
    example: 'postgresql://username:password@localhost:5432/database_name'
  }
} as const

/**
 * Optional environment variables that enhance functionality
 */
export const OPTIONAL_ENV_VARS = {
  // Email Configuration
  SMTP_HOST: {
    description: 'SMTP server hostname for sending emails'
  },
  SMTP_PORT: {
    description: 'SMTP server port (usually 587 for TLS or 465 for SSL)'
  },
  SMTP_USER: {
    description: 'SMTP username for authentication'
  },
  SMTP_PASS: {
    description: 'SMTP password or app-specific password'
  },
  
  // Social Media Integration
  FACEBOOK_APP_ID: {
    description: 'Facebook App ID for social media integration'
  },
  FACEBOOK_APP_SECRET: {
    description: 'Facebook App Secret for social media integration'
  },
  
  // Payment Processing
  STRIPE_PUBLISHABLE_KEY: {
    description: 'Stripe publishable key for payment processing'
  },
  STRIPE_SECRET_KEY: {
    description: 'Stripe secret key for payment processing'
  },
  
  // Communication Services
  TWILIO_ACCOUNT_SID: {
    description: 'Twilio Account SID for SMS functionality'
  },
  TWILIO_AUTH_TOKEN: {
    description: 'Twilio Auth Token for SMS functionality'
  },
  
  // Cloud Storage
  AWS_ACCESS_KEY_ID: {
    description: 'AWS Access Key ID for file storage'
  },
  AWS_SECRET_ACCESS_KEY: {
    description: 'AWS Secret Access Key for file storage'
  },
  AWS_S3_BUCKET_NAME: {
    description: 'AWS S3 bucket name for file storage'
  }
} as const

/**
 * Validates environment variables and returns detailed information
 */
export function validateEnvironment(): EnvironmentValidation {
  const missing: string[] = []
  const warnings: string[] = []
  const errors: string[] = []

  // Check required variables
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, config]) => {
    const value = process.env[key]
    
    if (!value) {
      missing.push(key)
      errors.push(`${key}: ${config.description}. Example: ${config.example}`)
    }
  })

  // Check for common issues
  if (process.env.NEXTAUTH_SECRET === 'your-nextauth-secret-here') {
    warnings.push('NEXTAUTH_SECRET is using the example value. Generate a secure secret for production.')
  }

  if (process.env.NEXTAUTH_URL?.includes('localhost') && process.env.NODE_ENV === 'production') {
    warnings.push('NEXTAUTH_URL is set to localhost in production environment.')
  }

  if (process.env.DATABASE_URL?.includes('localhost') && process.env.NODE_ENV === 'production') {
    warnings.push('DATABASE_URL points to localhost in production environment.')
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    errors
  }
}

/**
 * Logs environment validation results
 */
export function logEnvironmentValidation(): EnvironmentValidation {
  const validation = validateEnvironment()
  
  if (validation.isValid) {
    console.log('✅ Environment validation passed')
  } else {
    console.error('❌ Environment validation failed')
    console.error('Missing required environment variables:')
    validation.errors.forEach(error => console.error(`  - ${error}`))
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:')
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  return validation
}

/**
 * Generates helpful setup instructions
 */
export function generateSetupInstructions(): string {
  return `
🚀 Environment Setup Instructions

1. Copy the .env.example file to .env.local (for development) or set environment variables in your deployment platform:
   cp .env.example .env.local

2. Set the required environment variables:

${Object.entries(REQUIRED_ENV_VARS).map(([key, config]) => 
  `   ${key}=${config.example}
   # ${config.description}`
).join('\n\n')}

3. For production deployment:
   - Generate a secure NEXTAUTH_SECRET: openssl rand -base64 32
   - Set NEXTAUTH_URL to your actual domain
   - Configure your production database URL
   - Set any optional variables needed for your features

4. Restart your application after setting environment variables.

For more information, see the deployment documentation.
`
}