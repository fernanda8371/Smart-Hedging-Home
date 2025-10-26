"use client"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InfoTooltipProps {
  content: string
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          aria-label="More information"
          title="More information"
          type="button" // Add this to prevent form submission
        >
          <Info className="w-3 h-3 text-gray-600" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  )
}
