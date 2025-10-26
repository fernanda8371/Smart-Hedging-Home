import type { SimulationConfig, SimulationResult, ScenarioParams } from './types'
import { generatePricePath } from './scenarios'
import { getStrategy } from './strategies'
import { getExitStrategy } from './exits'

export function runSimulation(config: SimulationConfig): SimulationResult {
  const { scenario, strategy, exit } = config
  
  // Generate underlying price path
  const price_path = generatePricePath(scenario)
  
  // Get strategy and exit handlers
  const strategyHandler = getStrategy(strategy.type as any)
  const exitHandler = getExitStrategy(exit.type as any)
  
  // Calculate initial position cost
  const initial_option_value = strategyHandler.calculateValue(
    scenario.initial_price,
    scenario.time_horizon_years,
    strategy.params
  )
  const initial_cost = strategy.params.premium_per_contract * strategy.params.quantity_contracts
  
  const option_values: Array<{ day: number; value: number; intrinsic: number }> = []
  const strategy_pnl: Array<{ day: number; pnl: number; total_value: number }> = []
  
  let exit_day: number | undefined
  let exit_reason: string | undefined
  let position_closed = false
  
  // Simulate each day
  for (const { day, price } of price_path) {
    const time_remaining = Math.max(0, scenario.time_horizon_years - (day / scenario.trading_days) * scenario.time_horizon_years)
    
    if (!position_closed) {
      // Calculate current option values
      const current_values = strategyHandler.calculateValue(price, time_remaining, strategy.params)
      const current_pnl = current_values.total_value - initial_cost
      
      option_values.push({
        day,
        value: current_values.total_value,
        intrinsic: current_values.intrinsic_value
      })
      
      strategy_pnl.push({
        day,
        pnl: current_pnl,
        total_value: current_values.total_value
      })
      
      // Check exit conditions
      const exit_check = exitHandler.shouldExit(day, current_pnl, current_values.total_value, initial_cost, exit.params)
      
      if (exit_check.should_exit) {
        position_closed = true
        exit_day = day
        exit_reason = exit_check.reason
      }
    } else {
      // Position closed, no more changes
      const last_pnl = strategy_pnl[strategy_pnl.length - 1]
      option_values.push({ day, value: 0, intrinsic: 0 })
      strategy_pnl.push({ 
        day, 
        pnl: last_pnl.pnl, 
        total_value: last_pnl.total_value 
      })
    }
  }
  
  // Calculate final metrics
  const all_pnl = strategy_pnl.map(s => s.pnl)
  const final_pnl = all_pnl[all_pnl.length - 1]
  const max_loss = Math.min(...all_pnl)
  const max_gain = Math.max(...all_pnl)
  const win_probability = all_pnl.filter(pnl => pnl > 0).length / all_pnl.length
  
  return {
    price_path,
    option_values,
    strategy_pnl,
    final_result: {
      total_pnl: final_pnl,
      max_loss,
      max_gain,
      win_probability,
      exit_day,
      exit_reason
    }
  }
}
