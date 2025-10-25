"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimeFilterProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

const timeOptions = [
  { value: '1D', label: 'Past Day' },
  { value: '1W', label: 'Past Week' },
  { value: '1M', label: 'Past Month' },
  { value: '3M', label: 'Past 3 Months' },
  { value: '6M', label: 'Past 6 Months' },
  { value: '1Y', label: 'Past Year' },
]

export function TimeFilter({ value, onChange, className }: TimeFilterProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          {timeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}