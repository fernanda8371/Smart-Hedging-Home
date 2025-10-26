"use client"

import { useEffect, useState } from "react"
import { ChevronDown, FileText } from "lucide-react"
import { useNews } from "@/hooks/use-news"
import { useScenario } from "@/contexts/scenario-context"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/user-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { NewsCardColumn } from "@/components/dashboard/news-card-column"
import { MetricsColumn } from "@/components/dashboard/metrics-column"

/** ---- Tipo del item que devuelve /api/news/analyze ---- */
type AIItem = {
  newsId: string
  newsTitle: string
  impactPairs: { pair: string; direction: "up" | "down"; score: string }[]
  imageUrl?: string
  timestamp?: string
}

export default function HomePage() {
  const { news, loading } = useNews()
  const { setScenarioData } = useScenario()
  const { isLoggedIn, userProfile } = useUser()
  const router = useRouter()

  // Estado original
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [selectedNewsIndex, setSelectedNewsIndex] = useState(0)

  // ---- Estado para análisis AI (endpoint Opción B) ----
  const [aiItems, setAiItems] = useState<AIItem[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSelectedIndex, setAiSelectedIndex] = useState<number | null>(null)

  // Redirect to landing if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/landing')
    }
  }, [isLoggedIn, router])

  // Show loading or empty state while checking auth
  if (!isLoggedIn) {
    return null
  }

  // Generate AI impact scores for each news item based on user's currencies (fallback actual)
  const getImpactScores = (newsIndex: number) => {
    if (!userProfile?.operatingCurrencies || !userProfile?.currency) {
      // Fallback to default if no user profile
      return [
        { pair: "USD/MXN", direction: "up" as const, score: "5/10" },
        { pair: "EUR/MXN", direction: "down" as const, score: "8/10" },
      ]
    }

    const primaryCurrency = userProfile.currency
    const operatingCurrencies = userProfile.operatingCurrencies
    
    // Generate currency pairs (excluding primary currency from pairing with itself)
    const currencyPairs = operatingCurrencies
      .filter(currency => currency !== primaryCurrency)
      .map(currency => `${currency}/${primaryCurrency}`)

    // Generate impact scores for each pair based on news index
    const directions = ["up", "down"] as const
    const scores = ["5/10", "6/10", "7/10", "8/10", "9/10", "10/10"]
    
    return currencyPairs.map((pair, pairIndex) => {
      // Use news index and pair index to generate consistent but varied scores
      const directionIndex = (newsIndex + pairIndex) % 2
      const scoreIndex = (newsIndex * 2 + pairIndex) % scores.length
      
      return {
        pair,
        direction: directions[directionIndex],
        score: scores[scoreIndex]
      }
    })
  }

  const handleCurrencyChange = (pair: string) => {
    console.log(`News ${selectedNewsIndex}: Currency changed to ${pair}`)
  }

  const handleMakeScenario = (scenarioData: any) => {
    setScenarioData(scenarioData)
    router.push('/scenario')
  }

  // ---- Botón "Create News Summary" (tu flujo existente) ----
  const generateNewsSummary = async () => {
    if (!userProfile?.operatingCurrencies?.length) {
      alert('Please configure your operating currencies in Settings first.')
      return
    }

    setSummaryLoading(true)
    
    try {
      // Simulate AI summary generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const currencyList = userProfile.operatingCurrencies.join(', ')
      const totalRevenue = Object.values(userProfile.currencyRevenues || {})
        .reduce((sum: number, revenue: number) => sum + revenue, 0)
      
      const summary = `📊 **Market News Summary**

**Your Currency Profile:** ${currencyList}
**Total Revenue Exposure:** $${totalRevenue.toLocaleString()}

**Latest Analysis:**
• Current market sentiment shows increased volatility across your currency pairs
• ${userProfile.operatingCurrencies[0]} exposure shows moderate to high impact potential
• Risk factors have increased by ~15% compared to last week

**Key Recommendations:**
• Consider hedging ${Math.round(totalRevenue * 0.7).toLocaleString()} of your ${userProfile.operatingCurrencies[0]} exposure
• Monitor central bank announcements this week
• Review option strategies for high volatility pairs

Generated based on ${news.length} recent news items and your financial profile.`
      alert(summary)
      
    } catch (error) {
      alert('Error generating summary. Please try again.')
    } finally {
      setSummaryLoading(false)
    }
  }

  // ---- Botón "Load More Analysis": pega al endpoint Opción B y crea flashcards AI ----
  const loadMoreAnalysis = async () => {
    setAiLoading(true)
    try {
      const currencies = userProfile?.operatingCurrencies
      const body = currencies?.length
        ? { currencies, limit: 5, mode: "any" as const }
        : { limit: 5, mode: "any" as const }

      const res = await fetch("/api/mcp/news-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || "Analyze failed")

      const metaPicked = (data.meta?.picked ?? []) as { id: string; imageUrl?: string; timestamp?: string }[]

      const merged: AIItem[] = (data.items as AIItem[]).map((it, idx) => ({
      ...it,
      imageUrl: metaPicked[idx]?.imageUrl,
      timestamp: metaPicked[idx]?.timestamp,
    }))

      setAiItems(merged)
      setAiSelectedIndex(0) // seleccionar la primera card
    } catch (e) {
      console.error(e)
      alert("Error loading analysis")
    } finally {
      setAiLoading(false)
    }
  }

  // News de la columna original
  const selectedNewsItem = news[selectedNewsIndex]

  // Impactos que alimentan la métrica grande: si hay AI card seleccionada, usamos esa; si no, el fallback actual
  const impactForMetrics =
    aiSelectedIndex !== null && aiItems[aiSelectedIndex]
      ? aiItems[aiSelectedIndex].impactPairs
      : getImpactScores(selectedNewsIndex)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="p-4 h-[calc(100vh-73px)]">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-red-500"></div>
            <h2 className="text-lg font-semibold text-gray-900">Market Analysis Dashboard</h2>
            <p className="text-sm text-gray-500 ml-4">
              Real-time news impact analysis with synchronized currency charts and data
            </p>
          </div>
          <Button 
            onClick={generateNewsSummary}
            disabled={summaryLoading}
            className="flex items-center gap-2"
            variant="outline"
          >
            <FileText className="w-4 h-4" />
            {summaryLoading ? 'Generating...' : 'Create News Summary'}
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[calc(100%-52px)]">
          {/* News Column */}
          <div className="col-span-3 h-full overflow-y-auto">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-72">
                    <div className="bg-gray-200 h-32 w-full rounded-t-lg"></div>
                    <div className="bg-white p-3 rounded-b-lg border h-40">
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <NewsCardColumn
                  news={news.slice(0, 3)}
                  onNewsSelect={setSelectedNewsIndex}
                  selectedIndex={selectedNewsIndex}
                  getImpactScores={getImpactScores}
                  onMakeScenario={handleMakeScenario}
                />

                {/* AI Flashcards (análisis generado por /api/news/analyze) */}
                {aiItems.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="text-xs text-gray-500 uppercase tracking-wider">AI Analysis</div>
                      {aiItems.map((it, idx) => (
                        <div
                          key={it.newsId}
                          className={`border rounded-lg bg-white p-3 cursor-pointer transition-colors ${
                            aiSelectedIndex === idx ? "ring-2 ring-blue-500" : "hover:bg-gray-50"
                          }`}
                          onClick={() => setAiSelectedIndex(idx)}
                          title="Select to drive the Metrics panel"
                          aria-label={`AI card ${idx + 1}`}
                        >
                          {/* Cabecera con imagen opcional */}
                          {it.imageUrl && (
                            <div className="-mx-3 -mt-3 mb-2">
                              <img
                                src={it.imageUrl}
                                alt=""
                                className="w-full h-24 object-cover rounded-t-lg"
                              />
                            </div>
                          )}

                          {/* Título y fecha opcional */}
                          <div className="font-semibold text-sm">{it.newsTitle}</div>
                          {it.timestamp && (
                            <div className="text-[10px] text-gray-400 mt-1">
                              {new Date(it.timestamp).toLocaleString()}
                            </div>
                          )}

                          {/* Lista de impactos */}
                          <ul className="mt-2 text-xs text-gray-600 space-y-1">
                            {it.impactPairs.map((p, i) => (
                              <li key={i}>
                                {p.pair}:{" "}
                                <span className={p.direction === "up" ? "text-green-600" : "text-red-600"}>
                                  {p.direction}
                                </span>{" "}
                                (score {p.score})
                              </li>
                            ))}
                          </ul>

                          {/* Botón azul: Test Scenario */}
                          <Button
                            size="sm"
                            className="mt-3 w-full"
                            onClick={(e) => {
                              e.stopPropagation() // evita que seleccione la card al clickear el botón
                              const scenarioData = {
                                title: it.newsTitle,
                                source: "ai-analysis",
                                timestamp: it.timestamp ?? null,
                                imageUrl: it.imageUrl ?? null,
                                impactPairs: it.impactPairs,
                                primaryCurrency: userProfile?.currency || "MXN",
                                userCurrencies: userProfile?.operatingCurrencies || [],
                              }
                              handleMakeScenario(scenarioData)
                            }}
                          >
                            Test Scenario
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
              </>
            )}

            <div className="mt-6 text-center">
              <button 
                onClick={loadMoreAnalysis}
                disabled={aiLoading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto text-sm"
                aria-label="Load more analysis"
                title="Load more analysis"
              >
                <span className="text-gray-600">{aiLoading ? "Loading..." : "Load More Analysis"}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Metrics and Chart Column */}
          <div className="col-span-9 h-full">
            {loading ? (
              <div className="grid grid-cols-9 gap-4 h-72">
                <div className="col-span-6 h-full">
                  <div className="bg-white p-4 rounded-lg border h-full">
                    <div className="flex justify-between mb-3">
                      <div className="h-8 bg-gray-200 rounded w-32"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-40 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="col-span-3 h-full">
                  <div className="bg-white p-4 rounded-lg border h-full">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              selectedNewsItem && (
                <MetricsColumn
                  key={selectedNewsItem.id ?? `ai-${aiSelectedIndex ?? 'none'}`}
                  impactPairs={impactForMetrics}
                  onCurrencyChange={handleCurrencyChange}
                  userCurrencies={userProfile?.operatingCurrencies || ['USD']}
                  primaryCurrency={userProfile?.currency || 'MXN'}
                />
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
