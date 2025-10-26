import type { ScenarioParams, ParameterSchema, ValidationResult, StrategyRecommendation } from './types'

export class ScenarioBuilder {
  static getParameterSchema(): ParameterSchema {
    return {
      initial_price: {
        type: 'currency',
        label: 'Current Price',
        description: 'Current spot price of the currency pair',
        default: 18.5,
        min: 0.01,
        validation: (v) => v <= 0 ? 'Price must be positive' : null
      },
      time_horizon_years: {
        type: 'select',
        label: 'Time Horizon',
        default: 0.25,
        options: [
          { value: 0.25, label: '3 months' },
          { value: 0.5, label: '6 months' },
          { value: 1.0, label: '1 year' }
        ]
      },
      annual_volatility: {
        type: 'percentage',
        label: 'Expected Volatility',
        description: 'Annual volatility of the currency pair',
        default: 0.12,
        min: 0.05,
        max: 0.50,
        step: 0.01
      },
      direction: {
        type: 'select',
        label: 'Expected Direction',
        default: 'down',
        options: [
          { value: 'up', label: 'Strengthening' },
          { value: 'down', label: 'Weakening' },
          { value: 'neutral', label: 'Sideways/Volatile' }
        ]
      },
      expected_magnitude: {
        type: 'percentage',
        label: 'Expected Move Size',
        description: 'Total expected price change over time horizon',
        default: 0.15,
        min: 0.01,
        max: 0.50,
        step: 0.01
      },
      currency_pair: {
        type: 'select',
        label: 'Currency Pair',
        default: 'USD/MXN',
        options: [
          { value: 'USD/MXN', label: 'USD/MXN' },
          { value: 'EUR/USD', label: 'EUR/USD' },
          { value: 'GBP/USD', label: 'GBP/USD' },
          { value: 'USD/CAD', label: 'USD/CAD' }
        ]
      },
      seed: {
        type: 'number',
        label: 'Random Seed (optional)',
        description: 'For reproducible simulations',
        default: undefined
      }
    }
  }

  // Replace the getPresets() method in ScenarioBuilder class:
  static getPresets(currencyPair: string = 'USD/MXN'): Record<string, ScenarioParams> {
	const baseParams = {
      trading_days: 126, // Will be calculated automatically
      seed: undefined
	}

	// Currency-specific historical characteristics
	const currencyConfig = {
      'USD/MXN': {
		typical_vol: 0.12,
		crisis_vol: 0.18,
		typical_move: 0.08,
		crisis_move: 0.20,
		base_price: 18.5
      },
      'EUR/USD': {
		typical_vol: 0.10,
		crisis_vol: 0.15,
		typical_move: 0.06,
		crisis_move: 0.15,
		base_price: 1.08
      },
      'GBP/USD': {
		typical_vol: 0.11,
		crisis_vol: 0.16,
		typical_move: 0.07,
		crisis_move: 0.18,
		base_price: 1.25
      },
      'USD/CAD': {
		typical_vol: 0.09,
		crisis_vol: 0.14,
		typical_move: 0.05,
		crisis_move: 0.12,
		base_price: 1.35
      }
	}

	const config = currencyConfig[currencyPair as keyof typeof currencyConfig] || currencyConfig['USD/MXN']

	return {
      bullish: {
		...baseParams,
		initial_price: config.base_price,
		time_horizon_years: 0.25, // 3 months
		annual_volatility: config.typical_vol,
		direction: 'up',
		expected_magnitude: config.typical_move,
		currency_pair: currencyPair
      },
      bearish: {
		...baseParams,
		initial_price: config.base_price,
		time_horizon_years: 0.5, // 6 months
		annual_volatility: config.crisis_vol,
		direction: 'down',
		expected_magnitude: config.crisis_move,
		currency_pair: currencyPair
      },
      high_volatility: {
		...baseParams,
		initial_price: config.base_price,
		time_horizon_years: 0.5, // 6 months
		annual_volatility: config.crisis_vol,
		direction: 'neutral',
		expected_magnitude: 0.03, // Small net move
		currency_pair: currencyPair
      }
	}
  }

  static validateParameters(params: Partial<ScenarioParams>): ValidationResult {
    const errors: Record<string, string> = {}
    const schema = this.getParameterSchema()

    Object.entries(schema).forEach(([key, config]) => {
      const value = params[key as keyof ScenarioParams]
      
      if (value === undefined || value === null) return // Will use default
      
      if (config.validation) {
        const error = config.validation(value)
        if (error) errors[key] = error
      }

      if (config.min !== undefined && value < config.min) {
        errors[key] = `Must be at least ${config.min}`
      }
      
      if (config.max !== undefined && value > config.max) {
        errors[key] = `Must be at most ${config.max}`
      }
    })

    return { valid: Object.keys(errors).length === 0, errors }
  }

  static fillDefaults(params: Partial<ScenarioParams>): ScenarioParams {
    const schema = this.getParameterSchema()
    const filled = { ...params } as ScenarioParams

    Object.entries(schema).forEach(([key, config]) => {
      if (filled[key as keyof ScenarioParams] === undefined) {
        filled[key as keyof ScenarioParams] = config.default
      }
    })

    // Calculate trading days based on time horizon
    filled.trading_days = Math.floor(filled.time_horizon_years * 252)

    return filled
  }

  static generateRecommendations(params: ScenarioParams): StrategyRecommendation[] {
    const { direction, expected_magnitude, annual_volatility } = params
    const recommendations: StrategyRecommendation[] = []

    // Bearish scenarios (currency weakening)
    if (direction === 'down' && expected_magnitude > 0.10) {
      recommendations.push({
        strategy_type: 'protective_put',
        reason: `Hedge against ${(expected_magnitude * 100).toFixed(0)}% decline`,
        confidence: 'high'
      })
      
      recommendations.push({
        strategy_type: 'long_put',
        reason: 'Profit from expected decline',
        confidence: 'medium'
      })
    }

    // High volatility scenarios
    if (annual_volatility > 0.20) {
      recommendations.push({
        strategy_type: 'long_straddle',
        reason: `High volatility (${(annual_volatility * 100).toFixed(0)}%) favors straddles`,
        confidence: direction === 'neutral' ? 'high' : 'medium'
      })
    }

    // Bullish scenarios
    if (direction === 'up' && expected_magnitude > 0.08) {
      recommendations.push({
        strategy_type: 'long_call',
        reason: 'Benefit from expected appreciation',
        confidence: 'medium'
      })
    }

    // Conservative hedging for any downside risk
    if (direction === 'down' || expected_magnitude > 0.15) {
      recommendations.push({
        strategy_type: 'protective_put',
        reason: 'Conservative downside protection',
        confidence: 'high'
      })
    }

    return recommendations
  }
}

export function generatePricePath(params: ScenarioParams): Array<{ day: number; price: number }> {
  const { initial_price, time_horizon_years, trading_days, annual_volatility, direction, expected_magnitude, seed } = params
  
  const dt = time_horizon_years / trading_days
  
  // Calculate drift to hit expected magnitude
  const sign = direction === 'up' ? 1 : direction === 'down' ? -1 : 0
  const mu = sign * (Math.log(1 + Math.abs(expected_magnitude)) / time_horizon_years)
  
  // Seeded random for reproducible results
  let rng = seed ? createSeededRandom(seed) : Math.random
  
  const path: Array<{ day: number; price: number }> = [{ day: 0, price: initial_price }]
  let current_price = initial_price
  
  for (let day = 1; day <= trading_days; day++) {
    const u1 = rng()
    const u2 = rng()
    
    // Box-Muller transformation
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    
    const increment = (mu - 0.5 * annual_volatility ** 2) * dt + annual_volatility * Math.sqrt(dt) * z
    current_price *= Math.exp(increment)
    
    path.push({ day, price: current_price })
  }
  
  return path
}

function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}
