// Core types
export * from './types'

// Engines  
export * from './scenarios'
export * from './strategies'
export * from './exits'
export * from './simulator'
export * from './pricing'

// Utilities
export * from './form-utils'

// Main orchestration function
export function createSimulationWizard() {
  return {
    // Step 1: Scenario configuration
    getScenarioSchema: () => import('./scenarios').then(m => m.ScenarioBuilder.getParameterSchema()),
    getScenarioPresets: () => import('./scenarios').then(m => m.ScenarioBuilder.getPresets()),
    
    // Step 2: Strategy selection  
    getAvailableStrategies: () => Object.keys(STRATEGY_REGISTRY),
    getStrategyRecommendations: (scenario: ScenarioParams) => 
      import('./scenarios').then(m => m.ScenarioBuilder.generateRecommendations(scenario)),
    
    // Step 3: Strategy configuration
    getStrategySchema: (strategyType: string) => 
      getStrategy(strategyType as any).getParameterSchema(),
    
    // Step 4: Exit strategy  
    getCompatibleExits: (strategyType: string) =>
      getStrategy(strategyType as any).getCompatibleExitStrategies(),
    getExitSchema: (exitType: string) =>
      getExitStrategy(exitType as any).getParameterSchema(),
    
    // Step 5: Run simulation
    runSimulation: (config: SimulationConfig) => runSimulation(config)
  }
}

import { STRATEGY_REGISTRY } from './strategies'
