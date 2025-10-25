"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calculator, TrendingUp, TrendingDown, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useScenario } from "@/contexts/scenario-context"

interface OptionInputs {
  underlyingPrice: number
  volatility: number
  riskFreeRate: number
  strike: number
  underlyings: number
  period: number
}

interface OptionOutput {
  europeanCall: number
  europeanPut: number
  d1: number
  d2: number
}

export default function ScenarioPage() {
  const { scenarioData } = useScenario()
  const [inputs, setInputs] = useState<OptionInputs>({
    underlyingPrice: 19.3983,
    volatility: 3.63,
    riskFreeRate: 0.86,
    strike: 20,
    underlyings: 1,
    period: 12
  })

  const [selectedStrategy, setSelectedStrategy] = useState<string>("")

  // Load data from context when component mounts
  useEffect(() => {
    if (scenarioData) {
      setInputs(prev => ({
        ...prev,
        underlyingPrice: scenarioData.currentRate || prev.underlyingPrice,
        volatility: scenarioData.volatility || prev.volatility,
        riskFreeRate: scenarioData.riskFreeRate || prev.riskFreeRate,
        strike: scenarioData.strike || prev.strike,
        period: scenarioData.timePeriod === '1D' ? 1 : 
               scenarioData.timePeriod === '1W' ? 1 :
               scenarioData.timePeriod === '1M' ? 1 :
               scenarioData.timePeriod === '3M' ? 3 : prev.period
      }))
    }
  }, [scenarioData])

  // Mock Black-Scholes calculation (simplified for demo)
  const calculateOptions = (): OptionOutput => {
    const S = inputs.underlyingPrice
    const K = inputs.strike
    const T = inputs.period / 12
    const r = inputs.riskFreeRate / 100
    const sigma = inputs.volatility / 100

    // Simplified Black-Scholes approximation for demo
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
    const d2 = d1 - sigma * Math.sqrt(T)

    // Mock option prices (would use proper Black-Scholes in production)
    const europeanCall = Math.max(0, S - K) * 0.1 + Math.random() * 0.5
    const europeanPut = Math.max(0, K - S) * 0.1 + Math.random() * 0.5

    return {
      europeanCall: Number(europeanCall.toFixed(2)),
      europeanPut: Number(europeanPut.toFixed(2)),
      d1: Number(d1.toFixed(2)),
      d2: Number(d2.toFixed(2))
    }
  }

  const output = calculateOptions()

  const strategies = [
    {
      id: "long-call",
      name: "Long Call",
      description: "Buy call options to profit from upward price movement",
      recommendation: "High volatility expected, bullish outlook",
      risk: "Limited to premium paid",
      maxProfit: "Unlimited upside potential"
    },
    {
      id: "protective-put",
      name: "Protective Put", 
      description: "Hold underlying + buy put for downside protection",
      recommendation: "Portfolio hedging, moderate bearish protection",
      risk: "Limited downside protection",
      maxProfit: "Benefit from upside with protection"
    },
    {
      id: "covered-call",
      name: "Covered Call",
      description: "Hold underlying + sell call to generate income",
      recommendation: "Sideways/slightly bullish market expectation",
      risk: "Limited upside if price rises above strike",
      maxProfit: "Premium collected + limited price appreciation"
    },
    {
      id: "long-straddle",
      name: "Long Straddle",
      description: "Buy call and put at same strike for volatility play",
      recommendation: "High volatility expected, direction unclear",
      risk: "Time decay if price stays near strike",
      maxProfit: "Profit from large moves in either direction"
    }
  ]

  // Mock payoff chart data
  const generatePayoffData = (strategy: string) => {
    const spotRange = Array.from({ length: 21 }, (_, i) => inputs.underlyingPrice * (0.8 + i * 0.02))
    
    return spotRange.map(spot => {
      let payoff = 0
      const callValue = Math.max(0, spot - inputs.strike)
      const putValue = Math.max(0, inputs.strike - spot)
      
      switch (strategy) {
        case "long-call":
          payoff = callValue - output.europeanCall
          break
        case "protective-put":
          payoff = spot - inputs.underlyingPrice + Math.max(0, inputs.strike - spot) - output.europeanPut
          break
        case "covered-call":
          payoff = (spot - inputs.underlyingPrice) - Math.max(0, spot - inputs.strike) + output.europeanCall
          break
        case "long-straddle":
          payoff = callValue + putValue - (output.europeanCall + output.europeanPut)
          break
        default:
          payoff = 0
      }
      
      return {
        spotPrice: spot,
        payoff: Number(payoff.toFixed(2))
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">Options Scenario Builder</h1>
            <p className="text-sm text-gray-500">
              {scenarioData?.newsTitle ? 
                `Modeling strategies for: ${scenarioData.newsTitle.slice(0, 60)}...` :
                'Model option strategies with real-time parameters'
              }
            </p>
          </div>
          {scenarioData?.selectedCurrency && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{scenarioData.selectedCurrency}</p>
              <p className="text-xs text-gray-500">Selected Currency Pair</p>
            </div>
          )}
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Input Parameters */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Input Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1">
                    Underlying Price
                    <InfoTooltip content="Current market price of USD/MXN" />
                  </Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={inputs.underlyingPrice}
                    onChange={(e) => setInputs(prev => ({ ...prev, underlyingPrice: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Price per unit</p>
                </div>
                
                <div>
                  <Label className="flex items-center gap-1">
                    Volatility (σ)
                    <InfoTooltip content="Annualized standard deviation of price returns" />
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inputs.volatility}
                    onChange={(e) => setInputs(prev => ({ ...prev, volatility: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Assumed annualized σ (%)</p>
                </div>

                <div>
                  <Label className="flex items-center gap-1">
                    Risk-free Rate
                    <InfoTooltip content="Risk-free interest rate for option pricing" />
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inputs.riskFreeRate}
                    onChange={(e) => setInputs(prev => ({ ...prev, riskFreeRate: Number(e.target.value) }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Assumed annualized r (%)</p>
                </div>

                <div>
                  <Label>Strike Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inputs.strike}
                    onChange={(e) => setInputs(prev => ({ ...prev, strike: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>Number of Underlyings</Label>
                  <Input
                    type="number"
                    min="1"
                    value={inputs.underlyings}
                    onChange={(e) => setInputs(prev => ({ ...prev, underlyings: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>Period (Months)</Label>
                  <Select value={inputs.period.toString()} onValueChange={(value) => setInputs(prev => ({ ...prev, period: Number(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Month</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Results */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Option Pricing Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Label className="text-sm text-gray-600">European Call</Label>
                    <p className="text-2xl font-bold text-green-600">${output.europeanCall}</p>
                    <p className="text-xs text-gray-500">Price per 1 underlying</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Label className="text-sm text-gray-600">European Put</Label>
                    <p className="text-2xl font-bold text-red-600">${output.europeanPut}</p>
                    <p className="text-xs text-gray-500">Price per 1 underlying</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">d1:</span>
                    <span className="font-medium">{output.d1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">d2:</span>
                    <span className="font-medium">{output.d2}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Strategy Recommendations */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                AI Strategy Recommendations
                <InfoTooltip content="AI-generated strategies based on current market conditions and input parameters" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategies.slice(0, 2).map((strategy) => (
                  <div 
                    key={strategy.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStrategy === strategy.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedStrategy(strategy.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{strategy.name}</h4>
                      <Badge variant="outline" className="text-xs">Recommended</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                    <div className="text-xs text-gray-500">
                      <p><strong>Why:</strong> {strategy.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Details and Payoff Chart */}
        {selectedStrategy && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const strategy = strategies.find(s => s.id === selectedStrategy)
                  return strategy ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{strategy.name}</h3>
                        <p className="text-gray-600">{strategy.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 bg-red-50 rounded-lg">
                          <Label className="text-sm font-medium text-red-800">Risk Profile</Label>
                          <p className="text-sm text-red-700">{strategy.risk}</p>
                        </div>
                        
                        <div className="p-3 bg-green-50 rounded-lg">
                          <Label className="text-sm font-medium text-green-800">Profit Potential</Label>
                          <p className="text-sm text-green-700">{strategy.maxProfit}</p>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Label className="text-sm font-medium text-blue-800">AI Recommendation</Label>
                          <p className="text-sm text-blue-700">{strategy.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ) : null
                })()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payoff Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generatePayoffData(selectedStrategy)}>
                      <XAxis 
                        dataKey="spotPrice" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.toFixed(2)}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => value.toFixed(2)}
                      />
                      <Tooltip 
                        formatter={(value, name) => [`$${value}`, 'Payoff']}
                        labelFormatter={(label) => `Spot: $${Number(label).toFixed(4)}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="payoff" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={false}
                      />
                      {/* Break-even line */}
                      <Line 
                        type="monotone" 
                        dataKey={() => 0} 
                        stroke="#EF4444" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Strategies Grid */}
        <Card>
          <CardHeader>
            <CardTitle>All Available Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {strategies.map((strategy) => (
                <div 
                  key={strategy.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedStrategy === strategy.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedStrategy(strategy.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{strategy.name}</h4>
                    {strategy.id === "long-call" || strategy.id === "protective-put" ? (
                      <Badge className="bg-green-100 text-green-800">AI Recommended</Badge>
                    ) : (
                      <Badge variant="outline">Available</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                  <div className="space-y-1 text-xs">
                    <p><strong>Risk:</strong> {strategy.risk}</p>
                    <p><strong>Profit:</strong> {strategy.maxProfit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
