"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, Minus, Plus } from "lucide-react"

interface MatchScoreInputProps {
  homeScore: number
  awayScore: number
  onHomeScoreChange: (value: number) => void
  onAwayScoreChange: (value: number) => void
  disabled?: boolean
}

export function MatchScoreInput({
  homeScore,
  awayScore,
  onHomeScoreChange,
  onAwayScoreChange,
  disabled = false,
}: MatchScoreInputProps) {
  const handleScoreChange = (
    currentScore: number,
    onChange: (value: number) => void,
    diff: number
  ) => {
    if (disabled) return
    const newScore = Math.max(0, Math.min(99, currentScore + diff))
    onChange(newScore)
  }

  const handleInputChange = (
    value: string,
    onChange: (value: number) => void
  ) => {
    if (disabled) return
    const num = parseInt(value)
    if (!isNaN(num)) {
       onChange(Math.max(0, Math.min(99, num)))
    } else if (value === "") {
        onChange(0)
    }
  }

  const ScoreControl = ({
    score,
    onChange,
  }: {
    score: number
    onChange: (value: number) => void
  }) => (
    <div className="flex flex-col items-center gap-1">
      {!disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted"
          onClick={() => handleScoreChange(score, onChange, 1)}
          aria-label="Increase score"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
      <Input
        type="number"
        min={0}
        max={99}
        value={score}
        onChange={(e) => handleInputChange(e.target.value, onChange)}
        disabled={disabled}
        className={cn(
          "h-14 w-16 text-center text-2xl font-bold p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          disabled && "bg-muted text-muted-foreground opacity-100" // opacity-100 to ensure readability
        )}
      />
      {!disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-muted"
          onClick={() => handleScoreChange(score, onChange, -1)}
          aria-label="Decrease score"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <ScoreControl score={homeScore} onChange={onHomeScoreChange} />
      <span className="text-2xl font-bold text-muted-foreground">:</span>
      <ScoreControl score={awayScore} onChange={onAwayScoreChange} />
    </div>
  )
}
