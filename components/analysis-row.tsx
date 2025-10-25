"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown, ExternalLink, Bookmark } from "lucide-react"
import { ImpactEventCard } from "@/components/impact-event-card"
import { TimeFilter } from "@/components/ui/time-filter"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import Link from "next/link"

interface CurrencyPair {
  pair: string
  direction: "up" | "down"
  score: string
}

interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string
  publishedAt: string
  source: { name: string }
}

interface AnalysisRowProps {
  newsItem: NewsItem
  impactPairs: CurrencyPair[]
  onCurrencyChange?: (pair: string) => void
  onMakeScenario?: (data: any) => void
}

const currencyPairs = [
  { value: "USD/MXN", label: "USD/MXN", rate: 19.3983, change: 0.62, min: 19.2450, max: 19.5620 },
  { value: "EUR/MXN", label: "EUR/MXN", rate: 21.1250, change: -0.34, min: 20.9800, max: 21.3400 },
  { value: "GBP/MXN", label: "GBP/MXN", rate: 24.8750, change: 1.25, min: 24.5200, max: 25.1100 },
  { value: "CAD/MXN", label: "CAD/MXN", rate: 14.2340, change: 0.18, min: 14.1100, max: 14.4200 },
  { value: "JPY/MXN", label: "JPY/MXN", rate: 0.1289, change: -0.45, min: 0.1275, max: 0.1305 },
]

const getChartData = (period: string, pair: string) => {
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

export function AnalysisRow({ newsItem, impactPairs, onCurrencyChange, onMakeScenario }: AnalysisRowProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD/MXN")
  const [timePeriod, setTimePeriod] = useState('1D')
  
  const currentPairData = currencyPairs.find(p => p.value === selectedCurrency) || currencyPairs[0]
  const chartData = getChartData(timePeriod, selectedCurrency)
  
  const handleCurrencyChange = (newPair: string) => {
    setSelectedCurrency(newPair)
    onCurrencyChange?.(newPair)
  }
  
  const handleMakeScenario = () => {
    const scenarioData = {
      newsId: newsItem.id,
      newsTitle: newsItem.title,
      selectedCurrency,
      currentRate: currentPairData.rate,
      volatility: 3.63, // This would be calculated based on the selected currency
      riskFreeRate: 0.86,
      strike: currentPairData.rate * 1.03, // 3% out of the money
      timePeriod,
      impactPairs
    }
    onMakeScenario?.(scenarioData)
  }

  return (
    <div className="grid grid-cols-12 gap-4 mb-4">
      {/* News Card - 3 columns */}
      <div className="col-span-12 lg:col-span-3 h-72">
        <ImpactEventCard
          imageUrl={newsItem.imageUrl}
          title={newsItem.title}
          pairs={impactPairs}
          url={newsItem.url}
          publishedAt={newsItem.publishedAt}
          source={newsItem.source.name}
        />
      </div>

      {/* Chart Card - 6 columns */}
      <div className="col-span-12 lg:col-span-6 h-72">
        <Card className="h-full">
          <CardContent className="p-4 h-full flex flex-col">
            {/* Currency Selector and Time Filter */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger className="w-36 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyPairs.map((pair) => (
                      <SelectItem key={pair.value} value={pair.value}>
                        {pair.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InfoTooltip content="Select currency pair to analyze based on the news impact" />
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
                  {currentPairData.rate.toFixed(4)}
                </span>
                <span className="text-xs text-gray-500">{selectedCurrency.split('/')[1]}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className={`text-xs font-medium ${currentPairData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentPairData.change >= 0 ? '+' : ''}{currentPairData.change.toFixed(2)}%
                </span>
                {currentPairData.change >= 0 ? (
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
      <div className="col-span-12 lg:col-span-3 h-72">
        <Card className="h-full">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              {/* Min/Max Stats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Min</span>
                    <InfoTooltip content={`Minimum ${selectedCurrency} value for ${timePeriod} period`} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-900">
                      {currentPairData.min.toFixed(4)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {timePeriod} period
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Max</span>
                    <InfoTooltip content={`Maximum ${selectedCurrency} value for ${timePeriod} period`} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-gray-900">
                      {currentPairData.max.toFixed(4)}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {timePeriod} period
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="text-[10px] text-gray-500 mb-2 font-medium">Impact Score for {selectedCurrency}</div>
                {impactPairs
                  .filter(pair => pair.pair === selectedCurrency)
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

            {/* Make Scenario Button */}
            <div className="pt-3 border-t border-gray-100">
              <Link href="/scenario" onClick={handleMakeScenario}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-8"
                >
                  <span className="text-xs">Make Scenario</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}