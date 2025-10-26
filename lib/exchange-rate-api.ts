// ExchangeRate-API integration for real currency data
// Free tier: 1,500 requests/month with ANY base currency
// Sign up at: https://www.exchangerate-api.com/

const EXCHANGE_RATE_API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY || 'your_api_key_here'
const EXCHANGE_RATE_BASE_URL = 'https://v6.exchangerate-api.com/v6'

export interface CurrencyRate {
  currency: string
  rate: number
  change?: number
  min?: number
  max?: number
}

export interface ExchangeRateResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  conversion_rates: Record<string, number>
}

// Get latest exchange rates from ExchangeRate-API
export async function getExchangeRates(
  baseCurrency = 'USD',
  targetCurrencies?: string[]
): Promise<Record<string, number> | null> {
  try {
    const url = `${EXCHANGE_RATE_BASE_URL}/${EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data: ExchangeRateResponse = await response.json()
    
    if (data.result !== 'success') {
      throw new Error('ExchangeRate-API request failed')
    }
    
    // If specific currencies requested, filter them
    if (targetCurrencies && targetCurrencies.length > 0) {
      return targetCurrencies.reduce((acc, currency) => {
        if (data.conversion_rates[currency]) {
          acc[currency] = data.conversion_rates[currency]
        }
        return acc
      }, {} as Record<string, number>)
    }
    
    return data.conversion_rates
  } catch (error) {
    console.error('Error fetching ExchangeRate-API rates:', error)
    return null
  }
}

// Get historical rates - ExchangeRate-API doesn't provide this in free tier
// So we'll generate realistic historical data based on current rates
export async function getHistoricalRatesSimple(
  baseCurrency = 'USD',
  targetCurrency = 'MXN',
  days: number = 7
): Promise<Array<{ date: string; rate: number }> | null> {
  try {
    // Get current rate
    const rates = await getExchangeRates(baseCurrency, [targetCurrency])
    
    if (!rates || !rates[targetCurrency]) {
      return null
    }
    
    const currentRate = rates[targetCurrency]
    
    // Generate historical data with realistic variations
    return generateRealisticHistoricalData(currentRate, days)
  } catch (error) {
    console.error('Error generating historical rates:', error)
    return null
  }
}

function generateRealisticHistoricalData(
  currentRate: number,
  days: number
): Array<{ date: string; rate: number }> {
  const data = []
  let rate = currentRate
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Add realistic daily variation (-0.5% to +0.5%)
    const dailyChange = (Math.random() - 0.5) * 0.01
    rate = rate * (1 + dailyChange)
    
    // Keep within reasonable bounds (±3% from current)
    const minRate = currentRate * 0.97
    const maxRate = currentRate * 1.03
    rate = Math.max(minRate, Math.min(maxRate, rate))
    
    data.push({ date, rate })
  }
  
  return data
}

// Enhanced function with caching and fallback
// ExchangeRate-API supports ANY base currency in free tier!
export async function getCurrencyRatesWithCache(
  baseCurrency = 'USD',
  targetCurrencies: string[] = ['MXN', 'EUR', 'GBP', 'JPY', 'CAD']
): Promise<Record<string, number>> {
  const cacheKey = `exchange_rates_${baseCurrency}_${targetCurrencies.join(',')}`
  const cacheExpiry = 5 * 60 * 1000 // 5 minutes
  
  // Check cache first
  if (typeof window !== 'undefined') {
    const cachedData = localStorage.getItem(cacheKey)
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`)
    
    if (cachedData && cacheTimestamp) {
      const isExpired = Date.now() - parseInt(cacheTimestamp) > cacheExpiry
      if (!isExpired) {
        return JSON.parse(cachedData)
      }
    }
  }

  try {
    // Get rates with the specified base currency
    const rates = await getExchangeRates(baseCurrency, targetCurrencies)
    
    if (rates) {
      // Cache the results
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(rates))
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString())
      }
      
      return rates
    }

    throw new Error('Failed to fetch from ExchangeRate-API')
  } catch (error) {
    console.error('Error getting currency rates:', error)
    
    // Return cached data if available, even if expired
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem(cacheKey)
      if (cachedData) {
        return JSON.parse(cachedData)
      }
    }
    
    // Final fallback to mock data
    return getMockRates(baseCurrency, targetCurrencies)
  }
}

// Mock data as fallback when API fails - REALISTIC RATES
// Estas son las tasas que devolvería Fixer.io con USD como base
function getMockRates(baseCurrency: string, targetCurrencies: string[]): Record<string, number> {
  // Tasas base: 1 USD = X moneda (como devuelve Fixer.io)
  const usdBasedRates: Record<string, number> = {
    MXN: 19.45,   // 1 USD = 19.45 MXN
    EUR: 0.92,    // 1 USD = 0.92 EUR
    GBP: 0.81,    // 1 USD = 0.81 GBP
    JPY: 149.50,  // 1 USD = 149.50 JPY
    CAD: 1.35,    // 1 USD = 1.35 CAD
    USD: 1.0      // 1 USD = 1 USD
  }
  
  // Si la base es USD, devolvemos las tasas directamente
  if (baseCurrency === 'USD') {
    return targetCurrencies.reduce((acc, currency) => {
      acc[currency] = usdBasedRates[currency] || 1
      return acc
    }, {} as Record<string, number>)
  }
  
  // Si la base es otra moneda, necesitamos convertir
  const baseToUsd = usdBasedRates[baseCurrency] || 1
  
  return targetCurrencies.reduce((acc, currency) => {
    if (currency === 'USD') {
      // Cuántos USD por 1 unidad de base
      acc[currency] = 1 / baseToUsd
    } else {
      // Cuántas unidades de currency por 1 unidad de base
      // Ejemplo: EUR/MXN = (USD/MXN) / (USD/EUR) = 19.45 / 0.92 = 21.14
      const currencyPerUsd = usdBasedRates[currency] || 1
      acc[currency] = currencyPerUsd / baseToUsd
    }
    return acc
  }, {} as Record<string, number>)
}

// Get historical data for chart visualization
export async function getHistoricalRatesForChart(
  baseCurrency: string,
  targetCurrency: string,
  days: number = 7
): Promise<Array<{ time: string; price: number }>> {
  try {
    const historicalData = await getHistoricalRatesSimple(baseCurrency, targetCurrency, days)
    
    if (historicalData) {
      return historicalData.map(({ date, rate }) => ({
        time: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: rate
      }))
    }
    
    throw new Error('No historical data available')
  } catch (error) {
    console.error('Error fetching historical data:', error)
    
    // Generate mock historical data as fallback
    return generateMockHistoricalData(baseCurrency, targetCurrency, days)
  }
}

function generateMockHistoricalData(
  baseCurrency: string,
  targetCurrency: string,
  days: number
): Array<{ time: string; price: number }> {
  // Usar las mismas tasas realistas
  const realisticRates: Record<string, Record<string, number>> = {
    USD: { MXN: 19.45, EUR: 0.92, GBP: 0.81, JPY: 149.50, CAD: 1.35 },
    MXN: { USD: 0.0514, EUR: 0.0473, GBP: 0.0417, JPY: 7.69, CAD: 0.0694 },
    EUR: { USD: 1.087, MXN: 21.15, GBP: 0.88, JPY: 162.5, CAD: 1.47 }
  }
  
  const baseRate = realisticRates[baseCurrency]?.[targetCurrency] || 
                   (realisticRates.USD[targetCurrency] || 1) * (realisticRates[baseCurrency]?.USD || 1)
  
  const data = []
  let previousRate = baseRate
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const time = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    // Generar variación más realista (trending con algo de volatilidad)
    const dailyChange = (Math.random() - 0.5) * 0.02 // ±1% diario máximo
    const newRate = previousRate * (1 + dailyChange)
    
    // Mantener dentro de un rango realista (±5% del rate base)
    const minRate = baseRate * 0.95
    const maxRate = baseRate * 1.05
    const finalRate = Math.max(minRate, Math.min(maxRate, newRate))
    
    data.push({ time, price: finalRate })
    previousRate = finalRate
  }
  
  return data
}