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

export default function HomePage() {
  const { news, loading } = useNews()
  const { setScenarioData } = useScenario()
  const { isLoggedIn, userProfile } = useUser()
  const router = useRouter()
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [selectedNewsIndex, setSelectedNewsIndex] = useState(0)

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

  // Generate AI impact scores for each news item based on user's currencies
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

      // Show summary in alert (in production, this would be a proper modal)
      alert(summary)
      
    } catch (error) {
      alert('Error generating summary. Please try again.')
    } finally {
      setSummaryLoading(false)
    }
  }

  const selectedNewsItem = news[selectedNewsIndex]

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
              <NewsCardColumn
                news={news.slice(0, 3)}
                onNewsSelect={setSelectedNewsIndex}
                selectedIndex={selectedNewsIndex}
                getImpactScores={getImpactScores}
                onMakeScenario={handleMakeScenario}
              />
            )}
            <div className="mt-6 text-center">
              <button 
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto text-sm"
                aria-label="Load more analysis"
                title="Load more analysis"
              >
                <span className="text-gray-600">Load More Analysis</span>
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
                  key={selectedNewsItem.id}
                  impactPairs={getImpactScores(selectedNewsIndex)}
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
