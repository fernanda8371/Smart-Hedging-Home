"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface ScenarioData {
  newsId?: string
  newsTitle?: string
  selectedCurrency?: string
  currentRate?: number
  volatility?: number
  riskFreeRate?: number
  strike?: number
  timePeriod?: string
  impactPairs?: any[]
}

interface ScenarioContextType {
  scenarioData: ScenarioData | null
  setScenarioData: (data: ScenarioData) => void
  clearScenarioData: () => void
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined)

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenarioData, setScenarioDataState] = useState<ScenarioData | null>(null)

  const setScenarioData = (data: ScenarioData) => {
    setScenarioDataState(data)
    // Also store in localStorage for persistence across page navigation
    localStorage.setItem('scenarioData', JSON.stringify(data))
  }

  const clearScenarioData = () => {
    setScenarioDataState(null)
    localStorage.removeItem('scenarioData')
  }

  return (
    <ScenarioContext.Provider value={{ scenarioData, setScenarioData, clearScenarioData }}>
      {children}
    </ScenarioContext.Provider>
  )
}

export function useScenario() {
  const context = useContext(ScenarioContext)
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider')
  }
  return context
}