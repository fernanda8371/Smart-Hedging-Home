"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { TimeFilter } from "@/components/ui/time-filter"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Button } from "@/components/ui/button"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useCurrencyRates, useHistoricalRates } from "@/hooks/use-fixer-rates"

interface CurrencyPair {
  pair: string
  direction: "up" | "down"
  score: string
}

interface MetricsColumnProps {
  impactPairs: CurrencyPair[]
  onCurrencyChange?: (pair: string) => void
  userCurrencies?: string[]
  primaryCurrency?: string
}

// Datos por defecto con tasas realistas (octubre 2025)
const currencyPairs = [
  { value: "USD/MXN", label: "USD/MXN", rate: 19.45, change: 0.62, min: 19.24, max: 19.66 },
  { value: "EUR/MXN", label: "EUR/MXN", rate: 21.15, change: -0.34, min: 20.98, max: 21.32 },
  { value: "GBP/MXN", label: "GBP/MXN", rate: 24.01, change: 1.25, min: 23.76, max: 24.26 },
  { value: "CAD/MXN", label: "CAD/MXN", rate: 14.41, change: 0.18, min: 14.28, max: 14.54 },
  { value: "JPY/MXN", label: "JPY/MXN", rate: 0.130, change: -0.45, min: 0.129, max: 0.131 },
]

const getChartData = (period: string, pair: string, historicalData?: Array<{ time: string; price: number }>) => {
  // Use real historical data if available
  if (historicalData && historicalData.length > 0) {
    return historicalData
  }
  
  // Fallback to mock data
  const baseRate = currencyPairs.find(p => p.value === pair)?.rate || 19.3983
  
  const dataByPeriod = {
    '1D': Array.from({ length: 12 }, (_, i) => ({
      time: `${i * 2}:00`,
      price: baseRate * (1 + (Math.random() - 0.5) * 0.02)
    })),
    '1W': Array.from({ length: 7 }, (_, i) => ({
      time: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      price: baseRate * (1 + (Math.random() - 0.5) * 0.05)
    })),
    '1M': Array.from({ length: 4 }, (_, i) => ({
      time: `Week ${i + 1}`,
      price: baseRate * (1 + (Math.random() - 0.5) * 0.08)
    })),
    '3M': Array.from({ length: 3 }, (_, i) => ({
      time: `Month ${i + 1}`,
      price: baseRate * (1 + (Math.random() - 0.5) * 0.12)
    }))
  }
  
  return dataByPeriod[period as keyof typeof dataByPeriod] || dataByPeriod['1D']
}

export function MetricsColumn({ 
  impactPairs, 
  onCurrencyChange, 
  userCurrencies = ['USD'], 
  primaryCurrency = 'MXN' 
}: MetricsColumnProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD/MXN")
  const [timePeriod, setTimePeriod] = useState('1D')
  
  // Use real currency data from Fixer.io
  const { 
    currencyPairs: realCurrencyPairs, 
    loading: ratesLoading, 
    error: ratesError,
    lastUpdated,
    refresh 
  } = useCurrencyRates({
    baseCurrency: primaryCurrency,
    targetCurrencies: userCurrencies.filter(c => c !== primaryCurrency),
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  })

  // Get historical data for selected currency pair
  const selectedPairCurrencies = selectedCurrency.split('/')
  const { chartData: historicalChartData, loading: chartLoading } = useHistoricalRates(
    selectedPairCurrencies[1] || primaryCurrency,
    selectedPairCurrencies[0] || 'USD',
    timePeriod === '1D' ? 1 : timePeriod === '1W' ? 7 : timePeriod === '1M' ? 30 : 90
  )

  // Generate currency pairs based on user's operating currencies with real data
  const generateUserCurrencyPairs = () => {
    const filteredCurrencies = userCurrencies.filter(currency => currency !== primaryCurrency)
    
    if (filteredCurrencies.length === 0) {
      return []
    }
    
    return filteredCurrencies.map(currency => {
      const pair = `${currency}/${primaryCurrency}`
      
      // Try to find real data first
      const realPair = realCurrencyPairs.find(p => p.currency === currency)
      
      if (realPair && !ratesLoading) {
        return {
          value: pair,
          label: pair,
          rate: realPair.rate,
          change: realPair.change,
          min: realPair.min,
          max: realPair.max,
          currency: realPair.currency
        }
      }
      
      // Fallback to existing mock data or default pairs
      const existingPair = currencyPairs.find(p => p.value === pair)
      if (existingPair) {
        return existingPair
      }
      
      // Generate realistic mock data as last resort
      const realisticRates: Record<string, number> = {
        [`USD/${primaryCurrency}`]: primaryCurrency === 'MXN' ? 19.45 : 1.0,
        [`EUR/${primaryCurrency}`]: primaryCurrency === 'MXN' ? 21.15 : 0.92,
        [`GBP/${primaryCurrency}`]: primaryCurrency === 'MXN' ? 24.01 : 0.81,
        [`CAD/${primaryCurrency}`]: primaryCurrency === 'MXN' ? 14.41 : 1.35,
        [`JPY/${primaryCurrency}`]: primaryCurrency === 'MXN' ? 0.130 : 149.50,
      }
      
      const baseRate = realisticRates[pair] || 1.0
      return {
        value: pair,
        label: pair,
        rate: baseRate,
        change: (Math.random() - 0.5) * 1.5, // ±0.75%
        min: baseRate * 0.985,
        max: baseRate * 1.015,
        currency
      }
    })
  }

  const userCurrencyPairs = generateUserCurrencyPairs()
  const availablePairs = userCurrencyPairs.length > 0 ? userCurrencyPairs : currencyPairs
  
  const currentPairData = availablePairs.find(p => p.value === selectedCurrency) || availablePairs[0]
  const chartData = getChartData(timePeriod, selectedCurrency, historicalChartData)
  
  const handleCurrencyChange = (newPair: string) => {
    setSelectedCurrency(newPair)
    onCurrencyChange?.(newPair)
  }

  // Update selected currency when user currencies change
  useEffect(() => {
    if (availablePairs.length > 0 && !availablePairs.find(p => p.value === selectedCurrency)) {
      setSelectedCurrency(availablePairs[0].value)
    }
  }, [userCurrencies, primaryCurrency])

  // If no user currencies available, show default behavior
  if (availablePairs.length === 0) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-center text-gray-500">
          <p className="text-sm">No currency pairs available</p>
          <p className="text-xs">Please configure your operating currencies in Settings</p>
        </div>
      </div>
    )
  }

  // If only one currency pair, show single container
  if (availablePairs.length === 1) {
    const pairData = availablePairs[0]
    const chartData = getChartData(timePeriod, pairData.value, historicalChartData)
    
    return (
      <div className="grid grid-cols-9 gap-4 h-72">
        {/* Chart Card - 6 columns */}
        <div className="col-span-6 h-full">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              {/* Currency Header and Time Filter */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold">{pairData.label}</h3>
                  <InfoTooltip content="Currency pair based on your operating currencies" />
                </div>
                
                <TimeFilter 
                  value={timePeriod} 
                  onChange={setTimePeriod}
                  className="shrink-0"
                />
              </div>

              {/* Chart */}
              <div className="relative flex-1 w-full mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: "#9CA3AF", fontSize: 10 }} 
                    />
                    <YAxis
                      domain={['dataMin - 0.5%', 'dataMax + 0.5%']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 10 }}
                      tickFormatter={(value) => value.toFixed(4)}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Current Rate Display */}
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {pairData.rate.toFixed(4)}
                  </span>
                  <span className="text-xs text-gray-500">{pairData.value.split('/')[1]}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-xs font-medium ${pairData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pairData.change >= 0 ? '+' : ''}{pairData.change.toFixed(2)}%
                  </span>
                  {pairData.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info/Stats Card - 3 columns */}
        <div className="col-span-3 h-full">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-medium">
                  Macro outlook from MRACoreEconomics for the selected period
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Min</span>
                      <InfoTooltip content={`Minimum ${pairData.value} value for ${timePeriod} period`} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900">
                        {pairData.min.toFixed(4)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {timePeriod} period
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Max</span>
                      <InfoTooltip content={`Maximum ${pairData.value} value for ${timePeriod} period`} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-900">
                        {pairData.max.toFixed(4)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {timePeriod} period
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[10px] text-gray-500 mb-2 font-medium">Impact Score for {pairData.value}</div>
                  {impactPairs
                    .filter(pair => pair.pair === pairData.value)
                    .map((pair, index) => (
                      <div key={index} className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs ${pair.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                            {pair.direction === "up" ? "↗" : "↘"}
                          </span>
                          <span className="text-xs text-gray-600 capitalize">{pair.direction}</span>
                        </div>
                        <span className={`text-xs font-bold px-1 py-0.5 rounded ${
                          pair.score === "10/10" ? "text-red-600 bg-red-50" : 
                          pair.score === "8/10" ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50"
                        }`}>
                          {pair.score}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Multiple currency pairs - show grid of containers
  return (
    <div className="space-y-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Your Currency Pairs</h2>
          <div className="flex items-center gap-2">
            {ratesError ? (
              <WifiOff className="w-4 h-4 text-red-500" />
            ) : (
              <Wifi className="w-4 h-4 text-green-500" />
            )}
            <span className="text-xs text-gray-500">
              {ratesError ? 'Using cached data' : ratesLoading ? 'Updating...' : 'Live data'}
            </span>
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={ratesLoading}
            className="h-8"
          >
            <RefreshCw className={`w-3 h-3 ${ratesLoading ? 'animate-spin' : ''}`} />
            <span className="ml-1">Refresh</span>
          </Button>
          <TimeFilter 
            value={timePeriod} 
            onChange={setTimePeriod}
            className="shrink-0"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {availablePairs.map((pairData, index) => {
          // Use historical data if available for the selected currency, otherwise use mock data
          const isSelectedPair = pairData.value === selectedCurrency
          const chartData = getChartData(timePeriod, pairData.value, isSelectedPair ? historicalChartData : undefined)
          const pairImpactScores = impactPairs.filter(pair => pair.pair === pairData.value)
          
          return (
            <Card key={pairData.value} className="h-64">
              <CardContent className="p-4 h-full flex flex-col">
                {/* Currency Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{pairData.label}</h3>
                    <InfoTooltip content={`Currency pair comparing ${pairData.value.split('/')[0]} to your primary currency ${primaryCurrency}`} />
                  </div>
                  
                  {/* Current Rate Display */}
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-gray-900">
                        {pairData.rate.toFixed(4)}
                      </span>
                      <span className="text-xs text-gray-500">{pairData.value.split('/')[1]}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <span className={`text-xs font-medium ${pairData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {pairData.change >= 0 ? '+' : ''}{pairData.change.toFixed(2)}%
                      </span>
                      {pairData.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Mini Chart */}
                <div className="relative flex-1 w-full mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#9CA3AF", fontSize: 9 }} 
                        hide={true}
                      />
                      <YAxis
                        domain={['dataMin - 0.5%', 'dataMax + 0.5%']}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#9CA3AF", fontSize: 9 }}
                        hide={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={index % 2 === 0 ? "#3B82F6" : "#10B981"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Impact Scores */}
                <div className="border-t border-gray-100 pt-2">
                  <div className="text-[10px] text-gray-500 mb-1 font-medium">Impact Score</div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {pairImpactScores.map((pair, scoreIndex) => (
                        <div key={scoreIndex} className="flex items-center gap-1">
                          <span className={`text-xs ${pair.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                            {pair.direction === "up" ? "↗" : "↘"}
                          </span>
                          <span className={`text-xs font-bold px-1 py-0.5 rounded ${
                            pair.score === "10/10" ? "text-red-600 bg-red-50" : 
                            pair.score === "8/10" ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50"
                          }`}>
                            {pair.score}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-right text-xs text-gray-500">
                      <div>Min: {pairData.min.toFixed(4)}</div>
                      <div>Max: {pairData.max.toFixed(4)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
