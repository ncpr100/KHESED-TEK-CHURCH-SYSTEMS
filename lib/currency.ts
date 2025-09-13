
// Currency formatting utilities with dynamic support

export interface CurrencyConfig {
  code: string
  locale: string
  symbol: string
  conversionRate: number // Rate from base currency (USD)
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    locale: 'en-US',
    symbol: '$',
    conversionRate: 1 // Base currency
  },
  COP: {
    code: 'COP',
    locale: 'es-CO',
    symbol: '$',
    conversionRate: 4166.67 // 1 USD = ~4166.67 COP (approximate)
  },
  EUR: {
    code: 'EUR',
    locale: 'de-DE',
    symbol: '€',
    conversionRate: 0.92 // 1 USD = 0.92 EUR (approximate)
  }
}

export const formatPrice = (cents: number, currencyCode: string = 'USD') => {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.USD
  
  // Convert cents directly to currency amount (cents are stored as base currency units)
  const amount = cents / 100
  
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: currencyCode === 'COP' ? 0 : 2,
  }).format(amount)
}

export const convertPrice = (usdCents: number, toCurrency: string): number => {
  const config = CURRENCY_CONFIGS[toCurrency] || CURRENCY_CONFIGS.USD
  return Math.round((usdCents * config.conversionRate))
}

// Hook to get current platform currency
export const usePlatformCurrency = () => {
  return { currency: 'USD' } // Default, will be replaced with actual API call
}
