import type { SimulationParams, SimulationResult } from './types'

export function generatePricePath(params: SimulationParams): SimulationResult {
  const { initialPrice, timeHorizon, steps, volatility, direction, magnitude, seed } = params
  
  const dt = timeHorizon / steps
  
  // Calculate drift to hit expected magnitude
  const sign = direction === 'up' ? 1 : direction === 'down' ? -1 : 0
  const mu = sign * (Math.log(1 + Math.abs(magnitude)) / timeHorizon)
  
  // Seeded random for reproducible results
  let rng = seed ? createSeededRandom(seed) : Math.random
  
  const prices: number[] = [initialPrice]
  let currentPrice = initialPrice
  
  for (let i = 0; i < steps; i++) {
    const u1 = rng()
    const u2 = rng()
    
    // Box-Muller transformation for normal distribution
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
    
    const increment = (mu - 0.5 * volatility ** 2) * dt + volatility * Math.sqrt(dt) * z
    currentPrice *= Math.exp(increment)
    prices.push(currentPrice)
  }
  
  const timePoints = Array.from({ length: steps + 1 }, (_, i) => (i * timeHorizon) / steps)
  
  return {
    prices,
    timePoints,
    metadata: calculateMetadata(prices, initialPrice, dt)
  }
}

function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

function calculateMetadata(prices: number[], initialPrice: number, dt: number) {
  const finalPrice = prices[prices.length - 1]
  const totalReturn = (finalPrice - initialPrice) / initialPrice
  
  // Max drawdown
  let maxDrawdown = 0
  let peak = prices[0]
  for (const price of prices) {
    if (price > peak) peak = price
    const drawdown = (peak - price) / peak
    if (drawdown > maxDrawdown) maxDrawdown = drawdown
  }
  
  // Realized volatility
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]))
  }
  
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
  const variance = returns.reduce((sum, ret) => sum + (ret - meanReturn) ** 2, 0) / (returns.length - 1)
  const volatilityRealized = Math.sqrt(variance / dt)
  
  return {
    finalPrice,
    totalReturn,
    maxDrawdown,
    volatilityRealized
  }
}
