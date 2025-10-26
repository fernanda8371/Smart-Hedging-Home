export function blackScholes(
  spot_price: number,
  strike_price: number,
  time_to_expiry: number, // years
  risk_free_rate: number,
  volatility: number,
  option_type: 'call' | 'put'
): number {
  if (time_to_expiry <= 0) {
    // At expiry, option worth intrinsic value only
    if (option_type === 'call') {
      return Math.max(0, spot_price - strike_price)
    } else {
      return Math.max(0, strike_price - spot_price)
    }
  }

  const d1 = (Math.log(spot_price / strike_price) + 
             (risk_free_rate + 0.5 * volatility ** 2) * time_to_expiry) /
             (volatility * Math.sqrt(time_to_expiry))
  
  const d2 = d1 - volatility * Math.sqrt(time_to_expiry)

  if (option_type === 'call') {
    return spot_price * normalCDF(d1) - 
           strike_price * Math.exp(-risk_free_rate * time_to_expiry) * normalCDF(d2)
  } else {
    return strike_price * Math.exp(-risk_free_rate * time_to_expiry) * normalCDF(-d2) - 
           spot_price * normalCDF(-d1)
  }
}

function normalCDF(x: number): number {
  // Approximation of the cumulative standard normal distribution
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2.0)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}

export function calculateImpliedGreeks(
  spot_price: number,
  strike_price: number,
  time_to_expiry: number,
  risk_free_rate: number,
  volatility: number,
  option_type: 'call' | 'put'
) {
  const price = blackScholes(spot_price, strike_price, time_to_expiry, risk_free_rate, volatility, option_type)
  
  // Simple numerical delta calculation
  const delta_bump = spot_price * 0.01
  const price_up = blackScholes(spot_price + delta_bump, strike_price, time_to_expiry, risk_free_rate, volatility, option_type)
  const price_down = blackScholes(spot_price - delta_bump, strike_price, time_to_expiry, risk_free_rate, volatility, option_type)
  const delta = (price_up - price_down) / (2 * delta_bump)
  
  // Simple theta (1 day time decay)
  const theta_time = Math.max(0, time_to_expiry - 1/365)
  const price_tomorrow = blackScholes(spot_price, strike_price, theta_time, risk_free_rate, volatility, option_type)
  const theta = price_tomorrow - price
  
  return { price, delta, theta }
}
