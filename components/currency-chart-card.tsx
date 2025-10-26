"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { TimeFilter } from "@/components/ui/time-filter"
import { InfoTooltip } from "@/components/ui/info-tooltip"

interface CurrencyChartCardProps {
  baseCurrency: string
  quoteCurrency: string
  currentRate: number
  change: number
  changePercent: number
  min: number
  minChange: number
  max: number
  maxChange: number
}

// Chart data for different time periods
const getChartData = (period: string) => {
  const baseData = {
    '1D': [
      { time: "00:00", price: 19.3983 },
      { time: "02:00", price: 19.4120 },
      { time: "04:00", price: 19.4050 },
      { time: "06:00", price: 19.4200 },
      { time: "08:00", price: 19.4380 },
      { time: "10:00", price: 19.4250 },
      { time: "12:00", price: 19.4400 },
      { time: "14:00", price: 19.4350 },
      { time: "16:00", price: 19.4480 },
      { time: "18:00", price: 19.4520 },
      { time: "20:00", price: 19.4600 },
      { time: "22:00", price: 19.4750 },
    ],
    '1W': [
      { time: "Mon", price: 19.35 },
      { time: "Tue", price: 19.38 },
      { time: "Wed", price: 19.42 },
      { time: "Thu", price: 19.40 },
      { time: "Fri", price: 19.45 },
      { time: "Sat", price: 19.43 },
      { time: "Sun", price: 19.47 },
    ],
    '1M': [
      { time: "Week 1", price: 19.25 },
      { time: "Week 2", price: 19.30 },
      { time: "Week 3", price: 19.35 },
      { time: "Week 4", price: 19.47 },
    ],
    '3M': [
      { time: "Month 1", price: 18.95 },
      { time: "Month 2", price: 19.15 },
      { time: "Month 3", price: 19.47 },
    ],
    '6M': [
      { time: "Jan", price: 18.50 },
      { time: "Feb", price: 18.65 },
      { time: "Mar", price: 18.85 },
      { time: "Apr", price: 19.05 },
      { time: "May", price: 19.25 },
      { time: "Jun", price: 19.47 },
    ],
    '1Y': [
      { time: "Q1", price: 18.20 },
      { time: "Q2", price: 18.60 },
      { time: "Q3", price: 19.10 },
      { time: "Q4", price: 19.47 },
    ],
  }
  return baseData[period as keyof typeof baseData] || baseData['1D']
}

export function CurrencyChartCard({
  baseCurrency,
  quoteCurrency,
  currentRate,
  change,
  changePercent,
  min,
  minChange,
  max,
  maxChange,
}: CurrencyChartCardProps) {
  const [timePeriod, setTimePeriod] = useState('1D')
  const chartData = getChartData(timePeriod)
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-8">
          {/* Left side - Currency selectors and chart */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <span className="font-semibold text-gray-900">{baseCurrency}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <span className="font-semibold text-gray-900">{quoteCurrency}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <TimeFilter 
                value={timePeriod} 
                onChange={setTimePeriod}
                className="shrink-0"
              />
            </div>

            {/* Chart */}
            <div className="relative h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                  <YAxis
                    domain={[6550, 6800]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    fill="url(#colorPrice)"
                  />
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {/* Horizontal reference line */}
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#EF4444" strokeWidth={1} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right side - Rate info and stats */}
          <div className="w-80 space-y-6">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-bold text-gray-900">{currentRate.toFixed(4)}</span>
                <span className="text-sm text-gray-500">{quoteCurrency}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-medium">{change.toFixed(2)}%</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-500 text-sm">{changePercent.toFixed(2)}%</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Min</span>
                  <InfoTooltip content="Minimum value for the selected time period based on AI scenario modeling and market analysis." />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {min.toLocaleString("en-US", { minimumFractionDigits: 3 })}
                  </span>
                  <span className={`text-sm font-medium ${minChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {minChange >= 0 ? '+' : ''}{minChange.toFixed(2)}%
                  </span>
                  {minChange >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Max</span>
                  <InfoTooltip content="Maximum value for the selected time period based on AI scenario modeling and market analysis." />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {max.toLocaleString("en-US", { minimumFractionDigits: 3 })}
                  </span>
                  <span className={`text-sm font-medium ${maxChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {maxChange >= 0 ? '+' : ''}{maxChange.toFixed(2)}%
                  </span>
                  {maxChange >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            <Link href="/scenario" className="block">
              <Button
                variant="ghost"
                className="w-full justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                Test Scenario
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
