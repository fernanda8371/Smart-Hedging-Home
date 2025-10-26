"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Play, Calendar, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface SavedScenario {
  id: string
  name: string
  description?: string
  spotPrice: number
  strikePrice: number
  volatility: number
  riskFreeRate: number
  timeToExpiration: number
  strategy: string
  createdAt: string
  updatedAt: string
}

export default function SavedPage() {
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])

  useEffect(() => {
    // Load saved scenarios from localStorage
    const saved = localStorage.getItem('savedScenarios')
    if (saved) {
      setSavedScenarios(JSON.parse(saved))
    }
  }, [])

  const handleDelete = (id: string) => {
    const updated = savedScenarios.filter(scenario => scenario.id !== id)
    setSavedScenarios(updated)
    localStorage.setItem('savedScenarios', JSON.stringify(updated))
  }

  const handleLoadScenario = (scenario: SavedScenario) => {
    // Store scenario data in sessionStorage for the scenario page to pick up
    sessionStorage.setItem('loadedScenario', JSON.stringify(scenario))
    // Redirect to scenario page
    window.location.href = '/scenario'
  }

  const getStrategyColor = (strategy: string) => {
    switch (strategy.toLowerCase()) {
      case 'long call':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'protective put':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'covered call':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'long straddle':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Saved Scenarios</h1>
          <p className="text-slate-600 text-lg">
            Manage your saved hedging strategies and scenario configurations
          </p>
        </div>

        {savedScenarios.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <TrendingUp className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">No saved scenarios yet</h2>
              <p className="text-slate-600 mb-6">
                Create and save scenarios from the Scenario Builder to see them here
              </p>
              <Link href="/scenario">
                <Button className="bg-primary hover:bg-primary/90">
                  Create Your First Scenario
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedScenarios.map((scenario) => (
              <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-900 mb-1">
                        {scenario.name}
                      </CardTitle>
                      {scenario.description && (
                        <CardDescription className="text-sm">
                          {scenario.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={`${getStrategyColor(scenario.strategy)} text-xs font-medium`}>
                      {scenario.strategy}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Parameters */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Spot Price:</span>
                      <div className="font-semibold text-slate-900">
                        ${scenario.spotPrice.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Strike:</span>
                      <div className="font-semibold text-slate-900">
                        ${scenario.strikePrice.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Volatility:</span>
                      <div className="font-semibold text-slate-900">
                        {(scenario.volatility * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Time to Exp:</span>
                      <div className="font-semibold text-slate-900">
                        {scenario.timeToExpiration.toFixed(2)}y
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="text-xs text-slate-500 space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {format(new Date(scenario.createdAt), 'MMM d, yyyy')}
                    </div>
                    {scenario.updatedAt !== scenario.createdAt && (
                      <div className="flex items-center gap-1">
                        <Edit className="h-3 w-3" />
                        Updated: {format(new Date(scenario.updatedAt), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleLoadScenario(scenario)}
                      className="flex-1 bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDelete(scenario.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {savedScenarios.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {savedScenarios.length}
                  </div>
                  <div className="text-sm text-slate-600">Total Scenarios</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {new Set(savedScenarios.map(s => s.strategy)).size}
                  </div>
                  <div className="text-sm text-slate-600">Unique Strategies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-link">
                    ${Math.round(savedScenarios.reduce((sum, s) => sum + s.spotPrice, 0) / savedScenarios.length)}
                  </div>
                  <div className="text-sm text-slate-600">Avg Spot Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-700">
                    {Math.round(savedScenarios.reduce((sum, s) => sum + s.volatility * 100, 0) / savedScenarios.length)}%
                  </div>
                  <div className="text-sm text-slate-600">Avg Volatility</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}