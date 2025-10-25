"use client"

import { useState, useEffect } from 'react'

export interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  imageUrl: string
  publishedAt: string
  source: {
    name: string
  }
}

// Mock data for development - replace with real API calls
const mockNewsData: NewsItem[] = [
  {
    id: '1',
    title: 'Federal Reserve Signals Potential Interest Rate Changes',
    description: 'The Federal Reserve indicated potential shifts in monetary policy that could impact USD/MXN exchange rates significantly.',
    url: 'https://example.com/fed-news',
    imageUrl: '/smartphone-with-colorful-bokeh-lights.jpg',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    source: { name: 'Financial Times' }
  },
  {
    id: '2',
    title: 'Mexican Peso Shows Strength Against Dollar',
    description: 'Recent economic indicators suggest the Mexican peso is gaining strength, affecting currency trading patterns.',
    url: 'https://example.com/peso-news',
    imageUrl: '/colorful-surfboards-on-beach.jpg',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    source: { name: 'Bloomberg' }
  },
  {
    id: '3',
    title: 'Trade Relations Impact Currency Markets',
    description: 'New trade agreements between Mexico and the United States are creating volatility in currency exchange rates.',
    url: 'https://example.com/trade-news',
    imageUrl: '/squirrel-eating-nut.jpg',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    source: { name: 'Reuters' }
  }
]

export function useNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      
      // For now, we'll use mock data
      // In production, you would use a real news API like:
      // - NewsAPI (https://newsapi.org/)
      // - New York Times API
      // - Bloomberg API
      // - Reuters API
      
      // Example real API call (commented out):
      /*
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=USD+MXN+OR+currency+OR+"Mexican+peso"&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}&language=en&sortBy=publishedAt&pageSize=10`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      
      const data = await response.json()
      const formattedNews: NewsItem[] = data.articles.map((article: any, index: number) => ({
        id: `${index}`,
        title: article.title,
        description: article.description,
        url: article.url,
        imageUrl: article.urlToImage || '/placeholder.svg',
        publishedAt: article.publishedAt,
        source: article.source
      }))
      
      setNews(formattedNews)
      */
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setNews(mockNewsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch news')
      setNews(mockNewsData) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  return { news, loading, error, refetch: fetchNews }
}