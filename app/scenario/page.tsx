"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Calculator, TrendingUp, Zap, CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { useScenario } from "@/contexts/scenario-context"
import { ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
  TooltipProvider,
} from "@/components/ui/tooltip"

import { LineChart, Line } from 'recharts'

// Add these type definitions
interface SimulationConfig {
  scenario: ScenarioParams
  strategy: {
    type: StrategyType
    params: Record<string, any>
  }
  exit: {
    type: string
    params: Record<string, any>
  }
}

interface SimulationResult {
  strategy_pnl: Array<{ day: number; pnl: number }>
  final_result: {
    total_pnl: number
    max_loss: number
    max_gain: number
    win_probability: number
    exit_day?: number
    exit_reason?: string
  }
}

// Import our simulation system
import { 
  ScenarioBuilder, 
  getStrategy, 
  getExitStrategy,
  STRATEGY_REGISTRY,
  EXIT_REGISTRY,
  generateFormFields,
  validateFormData,
  generatePricePath,
  runSimulation,  // For Island 5
  type ScenarioParams,
  type StrategyType 
} from "@/lib/financial"

interface WizardStep {
  id: string
  title: string
  completed: boolean
  active: boolean
}

interface CandlestickData {
  day: number
  open: number
  high: number
  low: number
  close: number
  displayDate: string
}

function generateCandlestickData(pricePath: Array<{ day: number; price: number }>): CandlestickData[] {
  const candlesticks: CandlestickData[] = []
  
  // Daily candles (with simulated intra-day high/low for realism)
  pricePath.forEach(({ day, price }) => {
    // Simulate intra-day movement (±1% volatility)
    const variation = price * 0.01 * (Math.random() - 0.5) * 2
    const open = price
    const close = price + variation
    const high = Math.max(open, close) + Math.abs(variation) * 0.5
    const low = Math.min(open, close) - Math.abs(variation) * 0.5
    
    const displayDate = new Date(Date.now() + day * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    candlesticks.push({
      day,
      open,
      high,
      low,
      close,
      displayDate
    })
  })
  
  return candlesticks
}

function CandlestickChart({ data }: { data: CandlestickData[] }) {
  const CustomCandlestick = ({ payload, x, y, width, height }: any) => {
    if (!payload) return null
    
    const { open, high, low, close } = payload
    const isGreen = close > open
    const bodyHeight = Math.abs(close - open) * height / (payload.high - payload.low)
    const bodyY = y + (Math.max(open, close) - payload.high) * height / (payload.high - payload.low)
    
    return (
      <g>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={y}
          x2={x + width / 2}
          y2={y + height}
          stroke="#666"
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={x + width * 0.2}
          y={bodyY}
          width={width * 0.6}
          height={bodyHeight}
          fill={isGreen ? '#10B981' : '#EF4444'}
          stroke={isGreen ? '#059669' : '#DC2626'}
          strokeWidth={1}
        />
      </g>
    )
  }

  return (
    <div className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <XAxis 
            dataKey="displayDate" 
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            domain={['dataMin - 0.5', 'dataMax + 0.5']}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip
            formatter={(value: any, name: string) => [
              typeof value === 'number' ? value.toFixed(4) : value, 
              name.charAt(0).toUpperCase() + name.slice(1)
            ]}
            labelFormatter={(label) => `Week of ${label}`}
          />
          <Bar 
            dataKey="high"
            shape={<CustomCandlestick />}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

// Replace the entire ScenarioPage component with this updated version:

export default function ScenarioPage() {
  const { scenarioData } = useScenario()
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<WizardStep[]>([
    { id: 'scenario', title: 'Market Scenario', completed: false, active: true },
    { id: 'strategy', title: 'Select Strategy', completed: false, active: false },
    { id: 'parameters', title: 'Strategy Parameters', completed: false, active: false },
    { id: 'exit', title: 'Exit Strategy', completed: false, active: false },
    { id: 'simulate', title: 'Run Simulation', completed: false, active: false }
  ])

  // Form data
  const [scenarioParams, setScenarioParams] = useState<Partial<ScenarioParams>>({
    currency_pair: 'USD/MXN' // Default
  })
  const [simulatedPath, setSimulatedPath] = useState<Array<{ day: number; price: number }> | null>(null)
  const [selectedStrategyType, setSelectedStrategyType] = useState<StrategyType | ''>('')
  const [strategyParams, setStrategyParams] = useState<Record<string, any>>({})
  const [selectedExitType, setSelectedExitType] = useState<string>('')
  const [exitParams, setExitParams] = useState<Record<string, any>>({})

  // Load context data on mount
  useEffect(() => {
    if (scenarioData) {
      setScenarioParams(prev => ({
        ...prev,
        initial_price: scenarioData.currentRate || 18.5,
        currency_pair: scenarioData.selectedCurrency || 'USD/MXN'
      }))
    }
  }, [scenarioData])

  const updateStepStatus = (stepIndex: number, completed: boolean) => {
    setSteps(prev => prev.map((step, i) => ({
      ...step,
      completed: i < stepIndex ? true : i === stepIndex ? completed : false,
      active: i === stepIndex || (i === stepIndex + 1 && completed)
    })))
  }

  const handleScenarioSubmit = (data: ScenarioParams) => {
    setScenarioParams(data)
    
    // Generate the price path immediately
    const path = generatePricePath(data)
    setSimulatedPath(path)
    
    updateStepStatus(0, true)
    setCurrentStep(1)
  }

  const handleStrategySelect = (strategyType: StrategyType) => {
    setSelectedStrategyType(strategyType)
    
    // Fill strategy defaults
    const strategy = getStrategy(strategyType)
    const defaults = strategy.fillDefaults({}, scenarioParams.initial_price || 18.5)
    setStrategyParams(defaults)
    
    updateStepStatus(1, true)
    setCurrentStep(2)
  }

  return (
	    <TooltipProvider>
	<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - Keep exact same style */}
      <Header />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
      
		{/* Progress Indicator - Same as before */}
		<Card>
          <CardContent className="py-4">
			<div className="flex items-center justify-between">
              {steps.map((step, index) => (
				<div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-2">
					<div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      step.completed ? 'bg-green-500 border-green-500 text-white' :
						step.active ? 'border-blue-500 text-blue-500' :
						  'border-gray-300 text-gray-400'
					}`}>
                      {step.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
					</div>
					<span className={`text-sm font-medium ${
                      step.active ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-400'
					}`}>
                      {step.title}
					</span>
                  </div>
                  {index < steps.length - 1 && (
					<div className={`w-12 h-px mx-4 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300'
					}`} />
                  )}
				</div>
              ))}
			</div>
          </CardContent>
		</Card>

		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Configuration Islands */}
          <div className="lg:col-span-2 space-y-6">
			{/* Island 1: Scenario Configuration */}
			{currentStep >= 0 && (
              <ScenarioIsland
				active={currentStep === 0}
				completed={steps[0].completed}
				onSubmit={handleScenarioSubmit}
				onPreviewUpdate={(path) => setSimulatedPath(path)}
				initialData={scenarioParams}
              />
			)}

			{/* Island 2: Strategy Selection */}
			{currentStep >= 1 && (
              <StrategySelectionIsland
				active={currentStep === 1}
				completed={steps[1].completed}
				scenarioParams={scenarioParams as ScenarioParams}
				onSelect={handleStrategySelect}
				selectedStrategy={selectedStrategyType}
              />
			)}

			{/* Island 3: Strategy Parameters */}
			{currentStep >= 2 && selectedStrategyType && (
              <StrategyParametersIsland
				active={currentStep === 2}
				completed={steps[2].completed}
				strategyType={selectedStrategyType}
				scenarioParams={scenarioParams as ScenarioParams}
				onSubmit={(params) => {
                  setStrategyParams(params)
                  updateStepStatus(2, true)
                  setCurrentStep(3)
				}}
				initialData={strategyParams}
              />
			)}

			{currentStep >= 3 && selectedStrategyType && (
              <ExitStrategyIsland
				active={currentStep === 3}
				completed={steps[3].completed}
				strategyType={selectedStrategyType}
				onSubmit={(exitType, params) => {
                  setSelectedExitType(exitType)
                  setExitParams(params)
                  updateStepStatus(3, true)
                  setCurrentStep(4)
				}}
				initialExitType={selectedExitType}
				initialData={exitParams}
              />
			)}

			{currentStep >= 4 && selectedStrategyType && selectedExitType && (
              <SimulationResultsIsland
				active={currentStep === 4}
				completed={steps[4].completed}
				config={{
                  scenario: scenarioParams as ScenarioParams,
                  strategy: {
					type: selectedStrategyType,
					params: strategyParams
                  },
                  exit: {
					type: selectedExitType,
					params: exitParams
                  }
				}}
				onComplete={() => updateStepStatus(4, true)}
              />
			)}
          </div>

          {/* Right Column: Scenario Visualization */}
          <div className="lg:col-span-1">
			{simulatedPath ? (
              <Card className="sticky top-6">
				<CardHeader>
                  <CardTitle className="flex items-center gap-2">
					<TrendingUp className="w-5 h-5" />
														Scenario Preview
                  </CardTitle>
				</CardHeader>
				<CardContent>
                  <CandlestickChart data={generateCandlestickData(simulatedPath)} />
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
					<div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">Start Price</p>
                      <p className="font-semibold">{simulatedPath[0]?.price.toFixed(4)}</p>
					</div>
					<div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-gray-600">End Price</p>
                      <p className="font-semibold">{simulatedPath[simulatedPath.length - 1]?.price.toFixed(4)}</p>
					</div>
                  </div>
				</CardContent>
              </Card>
			) : (
              <Card className="sticky top-6 opacity-60">
				<CardHeader>
                  <CardTitle className="flex items-center gap-2">
					<TrendingUp className="w-5 h-5" />
														Scenario Preview
                  </CardTitle>
				</CardHeader>
				<CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
					<p>Configure scenario to see preview</p>
                  </div>
				</CardContent>
              </Card>
			)}
          </div>
		</div>
      </div>
	</div>
	    </TooltipProvider>		
  )
}



// Island 1: Scenario Configuration Component
function ScenarioIsland({ 
  active, 
  completed, 
  onSubmit, 
  initialData,
  onPreviewUpdate
}: {
  active: boolean
  completed: boolean
  onSubmit: (data: ScenarioParams) => void
  onPreviewUpdate: (path: Array<{ day: number; price: number }>) => void
  initialData: Partial<ScenarioParams>
}) {
  const [formData, setFormData] = useState<Partial<ScenarioParams>>(initialData)
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const schema = ScenarioBuilder.getParameterSchema()
  const presets = ScenarioBuilder.getPresets(formData.currency_pair || 'USD/MXN')
  const formFields = generateFormFields(schema) // Keep this line

  const handlePresetSelect = (presetKey: string) => {
    if (presetKey && presetKey !== 'custom' && presets[presetKey]) {
      setFormData(presets[presetKey])
      setSelectedPreset(presetKey)
      setErrors({})
    } else if (presetKey === 'custom') {
      setSelectedPreset(presetKey)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    
    if (field === 'currency_pair' && selectedPreset && selectedPreset !== 'custom') {
      const newPresets = ScenarioBuilder.getPresets(value)
      if (newPresets[selectedPreset]) {
        setFormData(newPresets[selectedPreset])
      }
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = () => {
    const filledData = ScenarioBuilder.fillDefaults(formData)
    const validation = ScenarioBuilder.validateParameters(filledData)
    
    if (validation.valid) {
      onSubmit(filledData)
    } else {
      setErrors(validation.errors)
    }
  }

  // Separate currency pair field from others
  const currencyPairField = formFields.find(f => f.name === 'currency_pair')
  const otherFields = formFields.filter(f => f.name !== 'currency_pair')

  return (
    <Card className={`transition-all duration-300 ${
      active ? 'border-2 border-blue-200 bg-blue-50/20' : 
      completed ? 'border-green-200 bg-green-50/20' : 
      'opacity-60'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Market Scenario Configuration
          {completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Currency Pair - Top Priority */}
        {currencyPairField && (
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <Label className="flex items-center gap-1 text-blue-900 font-medium">
              {currencyPairField.label}
              <InfoTooltip content={currencyPairField.description} />
            </Label>
            <Select 
              value={formData.currency_pair?.toString() || ''}
              onValueChange={(value) => handleInputChange('currency_pair', value)}
            >
              <SelectTrigger className="mt-2 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencyPairField.options?.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Preset Selection */}
        <div>
          <Label className="flex items-center gap-1">
            Market Scenario Presets
            <InfoTooltip content={`Pre-configured scenarios based on ${formData.currency_pair || 'USD/MXN'} historical patterns`} />
          </Label>
          <Select value={selectedPreset} onValueChange={handlePresetSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a market scenario or configure manually" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Configuration</SelectItem>
              <SelectItem value="bullish">
                <div>
                  <div className="font-medium text-green-700">📈 Bullish Trend</div>
                  <div className="text-xs text-gray-500">Currency strengthens over 3 months</div>
                </div>
              </SelectItem>
              <SelectItem value="bearish">
                <div>
                  <div className="font-medium text-red-700">📉 Bearish Crisis</div>
                  <div className="text-xs text-gray-500">Currency weakens significantly over 6 months</div>
                </div>
              </SelectItem>
              <SelectItem value="high_volatility">
                <div>
                  <div className="font-medium text-yellow-700">⚡ High Volatility</div>
                  <div className="text-xs text-gray-500">Sideways movement with increased uncertainty</div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Other Parameters */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* REMOVE THIS ENTIRE BLOCK - this is what's causing the infinite loop */}
          {/* 
          {active && (
            <Button 
              variant="outline" 
              className="w-full mb-4"
              onClick={() => {...}}
            >
               Update Preview
            </Button>
          )}
          */}
          
          {otherFields.map(field => (
            <div key={field.name}>
              <Label className="flex items-center gap-1">
                {field.label}
                {field.description && <InfoTooltip content={field.description} />}
              </Label>
              
              {field.type === 'select' && field.options ? (
                <Select 
                  value={formData[field.name as keyof ScenarioParams]?.toString() || ''}
                  onValueChange={(value) => handleInputChange(field.name, 
                    field.options?.find(opt => opt.value.toString() === value)?.value
                  )}
                >
                  <SelectTrigger className={errors[field.name] ? 'border-red-300' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  value={formData[field.name as keyof ScenarioParams] || ''}
                  onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                  step={field.validation?.step}
                  min={field.validation?.min}
                  max={field.validation?.max}
                  className={errors[field.name] ? 'border-red-300' : ''}
                />
              )}
              
              {errors[field.name] && (
                <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        {active && (
          <Button onClick={handleSubmit} className="w-full">
            Generate Scenario & Continue
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// Island 2: Strategy Selection Component  
function StrategySelectionIsland({
  active,
  completed,
  scenarioParams,
  onSelect,
  selectedStrategy
}: {
  active: boolean
  completed: boolean
  scenarioParams: ScenarioParams
  onSelect: (strategy: StrategyType) => void
  selectedStrategy: StrategyType | ''
}) {
  const recommendations = ScenarioBuilder.generateRecommendations(scenarioParams)
  const strategies = Object.keys(STRATEGY_REGISTRY) as StrategyType[]

  return (
    <Card className={`transition-all duration-300 ${
      active ? 'border-2 border-blue-200 bg-blue-50/20' : 
      completed ? 'border-green-200 bg-green-50/20' : 
      'opacity-60'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Strategy Selection
          {completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">AI Recommended Strategies</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.slice(0, 2).map(rec => {
                const strategy = getStrategy(rec.strategy_type as StrategyType)
                return (
                  <div
                    key={rec.strategy_type}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedStrategy === rec.strategy_type 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                    onClick={() => onSelect(rec.strategy_type as StrategyType)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">
                        {rec.strategy_type.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </h5>
                      <Badge className={`text-xs ${
                        rec.confidence === 'high' ? 'bg-green-100 text-green-800' :
                        rec.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{strategy.getDescription()}</p>
                    <p className="text-xs text-blue-700">
                      <strong>Why:</strong> {rec.reason}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* All Available Strategies */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">All Available Strategies</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {strategies.map(strategyType => {
              const strategy = getStrategy(strategyType)
              const isRecommended = recommendations.some(r => r.strategy_type === strategyType)
              
              return (
                <div
                  key={strategyType}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedStrategy === strategyType
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onSelect(strategyType)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">
                      {strategyType.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </h5>
                    {isRecommended && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        AI Pick
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{strategy.getDescription()}</p>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StrategyParametersIsland({
  active,
  completed,
  strategyType,
  scenarioParams, // Add this prop
  onSubmit,
  initialData
}: {
  active: boolean
  completed: boolean
  strategyType: StrategyType
  scenarioParams: ScenarioParams // Add this type
  onSubmit: (params: Record<string, any>) => void
  initialData: Record<string, any>
}) {
  const strategy = getStrategy(strategyType)
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const schema = strategy.getParameterSchema()
  const formFields = generateFormFields(schema)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = () => {
    const filledData = strategy.fillDefaults(formData, scenarioParams.initial_price || 18.5)
    const validation = strategy.validateParameters(filledData)
    
    if (validation.valid) {
      onSubmit(filledData)
    } else {
      setErrors(validation.errors)
    }
  }

  return (
    <Card className={`transition-all duration-300 ${
      active ? 'border-2 border-blue-200 bg-blue-50/20' : 
      completed ? 'border-green-200 bg-green-50/20' : 
      'opacity-60'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          {strategyType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Parameters
          {completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </CardTitle>
        <p className="text-sm text-gray-500">{strategy.getDescription()}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {formFields.map(field => (
            <div key={field.name}>
              <Label className="flex items-center gap-1">
                {field.label}
                {field.description && <InfoTooltip content={field.description} />}
              </Label>
              
              {field.type === 'select' && field.options ? (
                <Select 
                  value={formData[field.name]?.toString() || ''}
                  onValueChange={(value) => handleInputChange(field.name, 
                    field.options?.find(opt => opt.value.toString() === value)?.value
                  )}
                >
                  <SelectTrigger className={errors[field.name] ? 'border-red-300' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type="number"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                  step={field.validation?.step}
                  min={field.validation?.min}
                  max={field.validation?.max}
                  className={errors[field.name] ? 'border-red-300' : ''}
                  disabled={field.defaultValue === 'calculated' && !formData[field.name]}
                />
              )}
              
              {errors[field.name] && (
                <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        {active && (
          <Button onClick={handleSubmit} className="w-full">
            Set Parameters & Continue
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
   
function ExitStrategyIsland({
  active,
  completed,
  strategyType,
  onSubmit,
  initialExitType,
  initialData
}: {
  active: boolean
  completed: boolean
  strategyType: StrategyType
  onSubmit: (exitType: string, params: Record<string, any>) => void
  initialExitType: string
  initialData: Record<string, any>
}) {
  const strategy = getStrategy(strategyType)
  const availableExits = strategy.getCompatibleExitStrategies()

  const [selectedExit, setSelectedExit] = useState(initialExitType)
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleExitSelect = (exitType: string) => {
    setSelectedExit(exitType)
    const exitStrategy = getExitStrategy(exitType as any)
    const defaults = exitStrategy.fillDefaults({})
    setFormData(defaults)
  }

  const schema = selectedExit ? getExitStrategy(selectedExit as any).getParameterSchema() : {}
  const formFields = generateFormFields(schema)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = () => {
    if (!selectedExit) {
      setErrors({ general: 'Please select an exit strategy' })
      return
    }

    const exitStrategy = getExitStrategy(selectedExit as any)
    const filledData = exitStrategy.fillDefaults(formData)
    const validation = exitStrategy.validateParameters(filledData)
    
    if (validation.valid) {
      onSubmit(selectedExit, filledData)
    } else {
      setErrors(validation.errors)
    }
  }

  return (
    <Card className={`transition-all duration-300 ${
      active ? 'border-2 border-blue-200 bg-blue-50/20' : 
      completed ? 'border-green-200 bg-green-50/20' : 
      'opacity-60'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Exit Strategy
          {completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="flex items-center gap-1">
            Choose Exit Strategy
            <InfoTooltip content="How and when to close the position" />
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {availableExits.map(exitType => {
              const exit = getExitStrategy(exitType as any)
              return (
                <div
                  key={exitType}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedExit === exitType
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleExitSelect(exitType)}
                >
                  <h5 className="font-medium">
                    {exitType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </h5>
                  <p className="text-sm text-gray-600">{exit.getDescription()}</p>
                </div>
              )
            })}
          </div>
          {errors.general && <p className="text-red-600 text-sm mt-2">{errors.general}</p>}
        </div>

        {selectedExit && formFields.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Exit Parameters</h4>
            <div className="grid grid-cols-2 gap-4">
              {formFields.map(field => (
                <div key={field.name}>
                  <Label className="flex items-center gap-1">
                    {field.label}
                    {field.description && <InfoTooltip content={field.description} />}
                  </Label>
                  
                  {field.type === 'select' && field.options ? (
                    <Select 
                      value={formData[field.name]?.toString() || ''}
                      onValueChange={(value) => handleInputChange(field.name, value)}
                    >
                      <SelectTrigger className={errors[field.name] ? 'border-red-300' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="number"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, Number(e.target.value))}
                      step={field.validation?.step}
                      min={field.validation?.min}
                      max={field.validation?.max}
                      className={errors[field.name] ? 'border-red-300' : ''}
                    />
                  )}
                  
                  {errors[field.name] && (
                    <p className="text-xs text-red-600 mt-1">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {active && (
          <Button onClick={handleSubmit} className="w-full">
            Set Exit & Simulate
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function SimulationResultsIsland({
  active,
  completed,
  config,
  onComplete
}: {
  active: boolean
  completed: boolean
  config: SimulationConfig
  onComplete: () => void
}) {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const runSimulationNow = () => {
    setIsRunning(true)
    try {
      const simResult = runSimulation(config)
      setResult(simResult)
      onComplete()
    } catch (error) {
      console.error('Simulation failed:', error)
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    if (active) {
      runSimulationNow()
    }
  }, [active, config])

  const generatePnlChartData = () => {
    if (!result) return []
    return result.strategy_pnl.map(({ day, pnl }) => ({
      day,
      pnl: pnl.toFixed(4),
      displayDate: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }))
  }

  return (
    <Card className={`transition-all duration-300 ${
      active ? 'border-2 border-blue-200 bg-blue-50/20' : 
      completed ? 'border-green-200 bg-green-50/20' : 
      'opacity-60'
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Simulation Results
          {completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
        </CardTitle>
        {/* Add the re-run button in the header */}
        {active && (
          <Button 
            onClick={runSimulationNow} 
            disabled={isRunning}
            variant="outline" 
            size="sm"
            className="ml-auto"
          >
            {isRunning ? 'Running...' : 'Re-run Simulation'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {isRunning ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Running simulation...
            </div>
          </div>
        ) : result ? (
          <>
            {/* P&L Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generatePnlChartData()}>
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => value.toFixed(2)} />
                  <Tooltip 
                    formatter={(value: any) => [`$${value}`, 'P&L']}
                    labelFormatter={(label) => `Week of ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm text-gray-600">Total P&L</Label>
                <p className={`text-xl font-bold ${result.final_result.total_pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${result.final_result.total_pnl.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm text-gray-600">Max Loss</Label>
                <p className="text-xl font-bold text-red-600">
                  ${result.final_result.max_loss.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm text-gray-600">Max Gain</Label>
                <p className="text-xl font-bold text-green-600">
                  ${result.final_result.max_gain.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm text-gray-600">Win Prob.</Label>
                <p className="text-xl font-bold text-blue-600">
                  {(result.final_result.win_probability * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Exit Details */}
            {result.final_result.exit_day && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  Position exited on day {result.final_result.exit_day}: {result.final_result.exit_reason}
                </p>
              </div>
            )}

            {/* Add another re-run button at the bottom for convenience */}
            <div className="pt-4 border-t">
              <Button 
                onClick={runSimulationNow} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? 'Running Simulation...' : 'Re-run with Current Parameters'}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-gray-600">Simulation ready to run...</p>
        )}
      </CardContent>
    </Card>
  )
}
