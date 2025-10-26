export interface ParameterSchema {
  [key: string]: {
    type: 'number' | 'percentage' | 'select' | 'boolean' | 'currency'
    label: string
    description?: string
    default?: any
    readonly?: boolean
    min?: number
    max?: number
    step?: number
    options?: Array<{ value: any; label: string }>
    validation?: (value: any) => string | null
  }
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export interface ScenarioParams {
  initial_price: number
  time_horizon_years: number
  trading_days: number
  annual_volatility: number
  direction: 'up' | 'down' | 'neutral'
  expected_magnitude: number
  currency_pair: string
  seed?: number
}

export interface StrategyParams {
  [key: string]: any
}

export interface ExitParams {
  [key: string]: any
}

export interface SimulationConfig {
  scenario: ScenarioParams
  strategy: {
    type: string
    params: StrategyParams
  }
  exit: {
    type: string
    params: ExitParams
  }
}

export interface SimulationResult {
  price_path: Array<{ day: number; price: number }>
  option_values: Array<{ day: number; value: number; intrinsic: number }>
  strategy_pnl: Array<{ day: number; pnl: number; total_value: number }>
  final_result: {
    total_pnl: number
    max_loss: number
    max_gain: number
    win_probability: number
    exit_day?: number
    exit_reason?: string
  }
}

export interface StrategyRecommendation {
  strategy_type: string
  reason: string
  confidence: 'high' | 'medium' | 'low'
}
