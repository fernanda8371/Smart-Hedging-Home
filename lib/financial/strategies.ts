import type { ParameterSchema, StrategyParams, ValidationResult } from './types'
import { blackScholes } from './pricing'

export abstract class TradingStrategy {
  abstract getParameterSchema(): ParameterSchema
  abstract getCompatibleExitStrategies(): string[]
  abstract validateParameters(params: StrategyParams): ValidationResult
  abstract fillDefaults(params: Partial<StrategyParams>, spotPrice: number): StrategyParams
  abstract calculateValue(
    spot_price: number,
    time_to_expiry: number,
    params: StrategyParams
  ): { total_value: number; intrinsic_value: number }
  abstract getDescription(): string
}

export class LongCallStrategy extends TradingStrategy {
  getParameterSchema(): ParameterSchema {
    return {
      strike_price: {
        type: 'currency',
        label: 'Strike Price',
        description: 'Price at which you can buy the underlying',
        default: 'ATM',
        min: 0.01
      },
      quantity_contracts: {
        type: 'number',
        label: 'Number of Contracts',
        description: 'How many call contracts to purchase',
        default: 1,
        min: 1,
        step: 1
      },
      premium_per_contract: {
        type: 'currency',
        label: 'Premium per Contract',
        description: 'Cost to purchase each contract',
        default: 'calculated',
        readonly: true
      },
      risk_free_rate: {
        type: 'percentage',
        label: 'Risk-free Rate',
        default: 0.05,
        min: 0,
        max: 0.20,
        step: 0.001
      }
    }
  }

  getCompatibleExitStrategies(): string[] {
    return ['hold_to_expiry', 'stop_loss', 'take_profit', 'trailing_stop']
  }

  validateParameters(params: StrategyParams): ValidationResult {
    const errors: Record<string, string> = {}
    
    if (params.strike_price <= 0) {
      errors.strike_price = 'Strike price must be positive'
    }
    
    if (params.quantity_contracts < 1 || !Number.isInteger(params.quantity_contracts)) {
      errors.quantity_contracts = 'Must be at least 1 whole contract'
    }

    return { valid: Object.keys(errors).length === 0, errors }
  }

  fillDefaults(params: Partial<StrategyParams>, spotPrice: number): StrategyParams {
    const filled = { ...params }
    
    // Default strike to ATM (at-the-money)
    if (!filled.strike_price || filled.strike_price === 'ATM') {
      filled.strike_price = spotPrice
    }
    
    filled.quantity_contracts = filled.quantity_contracts || 1
    filled.risk_free_rate = filled.risk_free_rate || 0.05
    
    return filled as StrategyParams
  }

  calculateValue(spot_price: number, time_to_expiry: number, params: StrategyParams) {
    const { strike_price, quantity_contracts, risk_free_rate } = params
    
    const option_value = blackScholes(
      spot_price,
      strike_price,
      time_to_expiry,
      risk_free_rate,
      0.12, // TODO: Make volatility configurable
      'call'
    )
    
    const intrinsic_value = Math.max(0, spot_price - strike_price)
    
    return {
      total_value: option_value * quantity_contracts,
      intrinsic_value: intrinsic_value * quantity_contracts
    }
  }

  getDescription(): string {
    return 'Buy call options to profit from upward price movement. Limited loss (premium paid), unlimited upside potential.'
  }
}

export class LongPutStrategy extends TradingStrategy {
  getParameterSchema(): ParameterSchema {
    return {
      strike_price: {
        type: 'currency',
        label: 'Strike Price',
        description: 'Price at which you can sell the underlying',
        default: 'ATM',
        min: 0.01
      },
      quantity_contracts: {
        type: 'number',
        label: 'Number of Contracts',
        default: 1,
        min: 1,
        step: 1
      },
      premium_per_contract: {
        type: 'currency',
        label: 'Premium per Contract',
        default: 'calculated',
        readonly: true
      },
      risk_free_rate: {
        type: 'percentage',
        label: 'Risk-free Rate',
        default: 0.05,
        min: 0,
        max: 0.20,
        step: 0.001
      }
    }
  }

  getCompatibleExitStrategies(): string[] {
    return ['hold_to_expiry', 'stop_loss', 'take_profit', 'trailing_stop']
  }

  validateParameters(params: StrategyParams): ValidationResult {
    const errors: Record<string, string> = {}
    
    if (params.strike_price <= 0) {
      errors.strike_price = 'Strike price must be positive'
    }
    
    if (params.quantity_contracts < 1 || !Number.isInteger(params.quantity_contracts)) {
      errors.quantity_contracts = 'Must be at least 1 whole contract'
    }

    return { valid: Object.keys(errors).length === 0, errors }
  }

  fillDefaults(params: Partial<StrategyParams>, spotPrice: number): StrategyParams {
    const filled = { ...params }
    
    if (!filled.strike_price || filled.strike_price === 'ATM') {
      filled.strike_price = spotPrice
    }
    
    filled.quantity_contracts = filled.quantity_contracts || 1
    filled.risk_free_rate = filled.risk_free_rate || 0.05
    
    return filled as StrategyParams
  }

  calculateValue(spot_price: number, time_to_expiry: number, params: StrategyParams) {
    const { strike_price, quantity_contracts, risk_free_rate } = params
    
    const option_value = blackScholes(
      spot_price,
      strike_price,
      time_to_expiry,
      risk_free_rate,
      0.12,
      'put'
    )
    
    const intrinsic_value = Math.max(0, strike_price - spot_price)
    
    return {
      total_value: option_value * quantity_contracts,
      intrinsic_value: intrinsic_value * quantity_contracts
    }
  }

  getDescription(): string {
    return 'Buy put options to profit from downward price movement or hedge existing positions. Limited loss (premium), high profit potential on declines.'
  }
}

export class ProtectivePutStrategy extends TradingStrategy {
  getParameterSchema(): ParameterSchema {
    return {
      underlying_quantity: {
        type: 'currency',
        label: 'Underlying Position Size',
        description: 'Dollar amount of underlying currency exposure to protect',
        default: 100000,
        min: 1000
      },
      strike_price: {
        type: 'currency',
        label: 'Put Strike Price',
        description: 'Minimum price protection level',
        default: '95% ATM',
        min: 0.01
      },
      quantity_contracts: {
        type: 'number',
        label: 'Put Contracts',
        default: 'calculated',
        readonly: true
      },
      premium_per_contract: {
        type: 'currency',
        label: 'Premium per Contract',
        default: 'calculated',
        readonly: true
      },
      risk_free_rate: {
        type: 'percentage',
        label: 'Risk-free Rate',
        default: 0.05,
        min: 0,
        max: 0.20,
        step: 0.001
      }
    }
  }

  getCompatibleExitStrategies(): string[] {
    return ['hold_to_expiry', 'stop_loss', 'dynamic_hedge']
  }

  validateParameters(params: StrategyParams): ValidationResult {
    const errors: Record<string, string> = {}
    
    if (params.underlying_quantity <= 0) {
      errors.underlying_quantity = 'Must have positive underlying exposure'
    }
    
    if (params.strike_price <= 0) {
      errors.strike_price = 'Strike price must be positive'
    }

    return { valid: Object.keys(errors).length === 0, errors }
  }

  fillDefaults(params: Partial<StrategyParams>, spotPrice: number): StrategyParams {
    const filled = { ...params }
    
    filled.underlying_quantity = filled.underlying_quantity || 100000
    
    if (!filled.strike_price || filled.strike_price === '95% ATM') {
      filled.strike_price = spotPrice * 0.95
    }
    
    // Calculate number of contracts needed to hedge the underlying
    filled.quantity_contracts = Math.ceil(filled.underlying_quantity / (spotPrice * 100)) // Assuming 100 units per contract
    filled.risk_free_rate = filled.risk_free_rate || 0.05
    
    return filled as StrategyParams
  }

  calculateValue(spot_price: number, time_to_expiry: number, params: StrategyParams) {
    const { strike_price, quantity_contracts, underlying_quantity, risk_free_rate } = params
    
    // Value of the underlying position
    const underlying_value = underlying_quantity * (spot_price / 18.5) // Normalized to initial price
    
    // Value of protective puts
    const put_value = blackScholes(
      spot_price,
      strike_price,
      time_to_expiry,
      risk_free_rate,
      0.12,
      'put'
    ) * quantity_contracts
    
    const put_intrinsic = Math.max(0, strike_price - spot_price) * quantity_contracts
    
    return {
      total_value: underlying_value + put_value,
      intrinsic_value: underlying_quantity + put_intrinsic
    }
  }

  getDescription(): string {
    return 'Combine long underlying position with protective put options. Limits downside losses while maintaining upside participation.'
  }
}

// Strategy Registry
export const STRATEGY_REGISTRY = {
  long_call: LongCallStrategy,
  long_put: LongPutStrategy,
  protective_put: ProtectivePutStrategy,
  // TODO: Add remaining strategies
} as const

export type StrategyType = keyof typeof STRATEGY_REGISTRY

export function getStrategy(type: StrategyType): TradingStrategy {
  const StrategyClass = STRATEGY_REGISTRY[type]
  return new StrategyClass()
}
