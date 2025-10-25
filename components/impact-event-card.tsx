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
}

export function ImpactEventCard({ imageUrl, title, pairs, url, publishedAt, source }: ImpactEventCardProps) {
  return (
    <Card className="overflow-hidden h-full">
      {/* Compact Image */}
      <div className="relative h-32 w-full">
        <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      
      <CardContent className="p-3 space-y-3 flex flex-col justify-between h-[calc(100%-8rem)]">
        {/* Title with Info */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1">
              {title}
            </h3>
            <InfoTooltip content="AI-generated risk scores based on market analysis. 5/10: Moderate, 8/10: High, 10/10: Critical impact." />
          </div>

          {/* Currency Impact Scores */}
          <div className="space-y-1">
            {pairs.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-xs font-medium", item.direction === "up" ? "text-green-600" : "text-red-600")}>
                    {item.pair}
                  </span>
                  <span className="text-gray-400 text-xs">{item.direction === "up" ? "↗" : "↘"}</span>
                </div>
                <span
                  className={cn(
                    "text-xs font-bold px-1.5 py-0.5 rounded",
                    item.score === "10/10"
                      ? "text-red-600 bg-red-50"
                      : item.score === "8/10"
                        ? "text-orange-600 bg-orange-50"
                        : "text-green-600 bg-green-50",
                  )}
                >
                  {item.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">
                {publishedAt ? format(new Date(publishedAt), 'MMM d, HH:mm') : 'Date posted'}
              </p>
              {url ? (
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                >
                  Link
                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                </a>
              ) : (
                <p className="text-xs text-blue-600 hover:underline cursor-pointer">Link</p>
              )}
            </div>
            <button 
              className="text-gray-400 hover:text-gray-600 ml-2 shrink-0"
              aria-label="Save article"
              title="Save article"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
