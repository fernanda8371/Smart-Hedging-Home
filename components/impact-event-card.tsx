import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Bookmark, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { format } from "date-fns"

interface CurrencyPair {
  pair: string
  direction: "up" | "down"
  score: string
}

interface ImpactEventCardProps {
  imageUrl: string
  title: string
  pairs: CurrencyPair[]
  url?: string
  publishedAt?: string
  source?: string
  onTestScenario?: () => void
}

export function ImpactEventCard({ imageUrl, title, pairs, url, publishedAt, source, onTestScenario }: ImpactEventCardProps) {
  return (
    <Card className="overflow-hidden h-full relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <>
            <Image 
              src={imageUrl} 
              alt={title} 
              fill 
              className="object-cover" 
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          /* Fallback gradient background */
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
        )}
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 p-4 flex flex-col h-full text-white">
        {/* Header with title and tooltip */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 flex-1">
            {title}
          </h3>
          <div className="text-white/80">
            <InfoTooltip content="AI-generated risk scores based on market analysis. 5/10: Moderate, 8/10: High, 10/10: Critical impact." />
          </div>
        </div>

        {/* Currency Impact Scores */}
        <div className="space-y-2 mb-4 flex-1">
          {pairs.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-black/20 rounded-lg px-2 py-1.5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">
                  {item.pair}
                </span>
                <span className={cn("text-xs", item.direction === "up" ? "text-green-400" : "text-red-400")}>
                  {item.direction === "up" ? "↗" : "↘"}
                </span>
              </div>
              <span
                className={cn(
                  "text-xs font-bold px-2 py-1 rounded-md",
                  item.score === "10/10"
                    ? "text-red-100 bg-red-600/80"
                    : item.score === "8/10"
                      ? "text-orange-100 bg-orange-600/80"
                      : "text-green-100 bg-green-600/80",
                )}
              >
                {item.score}
              </span>
            </div>
          ))}
        </div>

        {/* Test Scenario Button */}
        {onTestScenario && (
          <div className="mb-3">
            <button 
              onClick={onTestScenario}
              className="w-full px-3 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors backdrop-blur-sm"
            >
              Test Scenario
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-white/20 mt-auto">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70 truncate">
                {publishedAt ? format(new Date(publishedAt), 'MMM d, HH:mm') : 'Date posted'}
              </p>
              {url ? (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1 mt-0.5 truncate transition-colors"
                >
                  Link
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ) : (
                <p className="text-xs text-blue-300 hover:text-blue-200 cursor-pointer">Link</p>
              )}
            </div>
            <button 
              className="text-white/60 hover:text-white/80 ml-2 shrink-0 transition-colors"
              aria-label="Save article"
              title="Save article"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
