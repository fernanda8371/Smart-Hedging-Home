"use client"

import { ImpactEventCard } from "@/components/impact-event-card"
import { cn } from "@/lib/utils"

interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string
  publishedAt: string
  source: { name: string }
}

interface CurrencyPair {
  pair: string
  direction: "up" | "down"
  score: string
}

interface NewsCardColumnProps {
  news: NewsItem[]
  onNewsSelect: (index: number) => void
  selectedIndex: number
  getImpactScores: (index: number) => CurrencyPair[]
  onMakeScenario: (data: any) => void
}

export function NewsCardColumn({
  news,
  onNewsSelect,
  selectedIndex,
  getImpactScores,
  onMakeScenario
}: NewsCardColumnProps) {
  return (
    <div className="space-y-4">
      {news.map((newsItem, index) => (
        <div 
          key={newsItem.id} 
          onClick={() => onNewsSelect(index)} 
          className={cn(
            "cursor-pointer rounded-lg transition-all duration-200",
            selectedIndex === index ? "ring-2 ring-blue-500 shadow-lg" : "ring-1 ring-gray-200 hover:ring-blue-400"
          )}
        >
          <ImpactEventCard
            imageUrl={newsItem.imageUrl}
            title={newsItem.title}
            pairs={getImpactScores(index)}
            url={newsItem.url}
            publishedAt={newsItem.publishedAt}
            source={newsItem.source.name}
            onTestScenario={() => onMakeScenario({
              newsId: newsItem.id,
              newsTitle: newsItem.title,
              impactPairs: getImpactScores(index)
            })}
          />
        </div>
      ))}
    </div>
  )
}
