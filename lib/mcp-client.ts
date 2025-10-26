/**
 * Simple utility to send news analysis to MCP
 * 
 * Usage:
 * await sendNewsAnalysisToMCP({
 *   newsId: '123',
 *   newsTitle: 'Fed signals rate changes',
 *   impactPairs: [{ pair: 'USD/MXN', direction: 'up', score: '8/10' }]
 * })
 */

interface NewsAnalysisData {
  newsId: string
  newsTitle: string
  impactPairs: Array<{
    pair: string
    direction: 'up' | 'down'
    score: string
  }>
}

export async function sendNewsAnalysisToMCP(data: NewsAnalysisData) {
  try {
    const response = await fetch('/api/mcp/news-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      })
    })

    const result = await response.json()
    return result

  } catch (error) {
    console.error('Failed to send to MCP:', error)
    throw error
  }
}
