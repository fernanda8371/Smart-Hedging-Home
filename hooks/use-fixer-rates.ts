import { useState, useEffect, useCallback } from 'react'
import { getCurrencyRatesWithCache, getHistoricalRatesForChart } from '@/lib/exchange-rate-api'

interface CurrencyPair {
  value: string
  label: string
  rate: number
  change: number
  min: number
  max: number
  currency: string
}

interface UseCurrencyRatesOptions {
  baseCurrency?: string
  targetCurrencies?: string[]
  refreshInterval?: number
  enabled?: boolean
}

export function useCurrencyRates({
  baseCurrency = 'USD',
  targetCurrencies = ['MXN', 'EUR', 'GBP', 'JPY', 'CAD'],
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  enabled = true
}: UseCurrencyRatesOptions = {}) {
  const [rates, setRates] = useState<Record<string, number>>({})
  const [currencyPairs, setCurrencyPairs] = useState<CurrencyPair[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRates = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)
      
      const newRates = await getCurrencyRatesWithCache(baseCurrency, targetCurrencies)
      
      // Convert to currency pairs format
      const pairs: CurrencyPair[] = Object.entries(newRates).map(([currency, rate]) => {
        const pairValue = `${currency}/${baseCurrency}`
        
        // Calculate mock change (in real implementation, compare with previous rate)
        const change = (Math.random() - 0.5) * 1.5 // Mock change between -0.75% to 0.75%
        
        return {
          value: pairValue,
          label: pairValue,
          rate,
          change,
          min: rate * 0.985, // Rango más realista
          max: rate * 1.015,
          currency
        }
      })
      
      setRates(newRates)
      setCurrencyPairs(pairs)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch currency rates')
    } finally {
      setLoading(false)
    }
  }, [baseCurrency, targetCurrencies.join(','), enabled])

  useEffect(() => {
    fetchRates()
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchRates, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchRates, refreshInterval])

  return {
    rates,
    currencyPairs,
    loading,
    error,
    lastUpdated,
    refresh: fetchRates
  }
}

// Hook for historical chart data
export function useHistoricalRates(
  baseCurrency: string,
  targetCurrency: string,
  days: number = 7
) {
  const [chartData, setChartData] = useState<Array<{ time: string; price: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchHistoricalData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await getHistoricalRatesForChart(baseCurrency, targetCurrency, days)
        
        if (isMounted) {
          setChartData(data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch historical data')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (baseCurrency && targetCurrency) {
      fetchHistoricalData()
    }

    return () => {
      isMounted = false
    }
  }, [baseCurrency, targetCurrency, days])

  return { chartData, loading, error }
}