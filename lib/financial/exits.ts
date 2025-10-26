import type { ParameterSchema, ExitParams, ValidationResult } from './types'

export abstract class ExitStrategy {
  abstract getParameterSchema(): ParameterSchema
  abstract validateParameters(params: ExitParams): ValidationResult
  abstract fillDefaults(params: Partial<ExitParams>): ExitParams
  abstract shouldExit(
    current_day: number,
    current_pnl: number,
    current_value: number,
    initial_cost: number,
    params: ExitParams
  ): { should_exit: boolean; reason?: string }
  abstract getDescription(): string
}

export class HoldToExpiryExit extends ExitStrategy {
  getParameterSchema(): ParameterSchema {
    return {} // No parameters needed
  }

  validateParameters(params: ExitParams): ValidationResult {
    return { valid: true, errors: {} }
  }

  fillDefaults(params: Partial<ExitParams>): ExitParams {
    return {}
  }

  shouldExit(): { should_exit: boolean; reason?: string } {
    return { should_exit: false } // Never exit until expiry
  }

  getDescription(): string {
    return 'Hold the position until expiration date. No early exit.'
  }
}

export class StopLossExit extends ExitStrategy {
  getParameterSchema(): ParameterSchema {
    return {
      stop_loss_percentage: {
        type: 'percentage',
        label: 'Stop Loss Threshold',
        description: 'Exit when losses reach this percentage of initial cost',
        default: -0.50, // 50% loss
        min: -0.95,
        max: -0.05,
        step: 0.05
      }
    }
  }

  validateParameters(params: ExitParams): ValidationResult {
    const errors: Record<string, string> = {}
    
    if (params.stop_loss_percentage >= 0) {
      errors.stop_loss_percentage = 'Stop loss must be negative (represents a loss)'
    }

    return { valid: Object.keys(errors).length === 0, errors }
  }

  fillDefaults(params: Partial<ExitParams>): ExitParams {
    return {
      stop_loss_percentage: params.stop_loss_percentage || -0.50
    }
  }

  shouldExit(
    current_day: number,
    current_pnl: number,
    current_value: number,
    initial_cost: number,
    params: ExitParams
  ): { should_exit: boolean; reason?: string } {
    const loss_percentage = current_pnl / initial_cost
    
    if (loss_percentage <= params.stop_loss_percentage) {
      return {
        should_exit: true,
        reason: `Stop loss triggered: ${(loss_percentage * 100).toFixed(1)}% loss`
      }
    }
    
    return { should_exit: false }
  }

  getDescription(): string {
    return 'Exit position when losses reach a specified percentage threshold.'
  }
}

export class TakeProfitExit extends ExitStrategy {
  getParameterSchema(): ParameterSchema {
    return {
      profit_target_percentage: {
        type: 'percentage',
        label: 'Profit Target',
        description: 'Exit when gains reach this percentage of initial cost',
        default: 1.0, // 100% gain
        min: 0.10,
        max: 5.0,
        step: 0.10
      }
    }
  }

  validateParameters(params: ExitParams): ValidationResult {
    const errors: Record<string, string> = {}
    
    if (params.profit_target_percentage <= 0) {
      errors.profit_target_percentage = 'Profit target must be positive'
    }

    return { valid: Object.keys(errors).length === 0, errors }
  }

  fillDefaults(params: Partial<ExitParams>): ExitParams {
    return {
      profit_target_percentage: params.profit_target_percentage || 1.0
    }
  }

  shouldExit(
    current_day: number,
    current_pnl: number,
    current_value: number,
    initial_cost: number,
    params: ExitParams
  ): { should_exit: boolean; reason?: string } {
    const gain_percentage = current_pnl / initial_cost
    
    if (gain_percentage >= params.profit_target_percentage) {
      return {
        should_exit: true,
        reason: `Profit target reached: ${(gain_percentage * 100).toFixed(1)}% gain`
      }
    }
    
    return { should_exit: false }
  }

  getDescription(): string {
    return 'Exit position when profits reach a specified percentage target.'
  }
}

// Exit Strategy Registry
export const EXIT_REGISTRY = {
  hold_to_expiry: HoldToExpiryExit,
  stop_loss: StopLossExit,
  take_profit: TakeProfitExit,
} as const

export type ExitType = keyof typeof EXIT_REGISTRY

export function getExitStrategy(type: ExitType): ExitStrategy {
  const ExitClass = EXIT_REGISTRY[type]
  return new ExitClass()
}
