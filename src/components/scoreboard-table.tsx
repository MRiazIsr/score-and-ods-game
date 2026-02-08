"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScoreBoardData } from "@/app/server/modules/competitions/types"
import { cn } from "@/lib/utils"

interface ScoreBoardTableProps {
  data: ScoreBoardData
  currentUserId?: string
}

export function ScoreBoardTable({ data, currentUserId }: ScoreBoardTableProps) {
  const hasEntries = data.entries && data.entries.length > 0

  if (!hasEntries) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card text-card-foreground">
        <p className="text-lg font-medium text-muted-foreground">No Leaderboard Data Available</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          There are no completed matches with predictions yet. When matches finish and users make predictions, the leaderboard will be populated.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[10%]">Rank</TableHead>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[15%]">
                <div className="flex flex-col">
                  <span>Exact Score</span>
                  <span className="text-[10px] font-normal text-muted-foreground">3 points</span>
                </div>
              </TableHead>
              <TableHead className="w-[15%]">
                <div className="flex flex-col">
                  <span>Difference</span>
                  <span className="text-[10px] font-normal text-muted-foreground">2 points</span>
                </div>
              </TableHead>
              <TableHead className="w-[15%]">
                <div className="flex flex-col">
                  <span>Outcome</span>
                  <span className="text-[10px] font-normal text-muted-foreground">1 point</span>
                </div>
              </TableHead>
              <TableHead className="w-[15%] text-right">Total Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.entries.map((entry, index) => (
              <TableRow 
                key={entry.userId}
                className={cn(
                    entry.userId === currentUserId && "bg-muted/50"
                )}
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  {entry.name} {entry.userId === currentUserId && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
                </TableCell>
                <TableCell>{entry.predictedCount}</TableCell>
                <TableCell>{entry.predictedDifference}</TableCell>
                <TableCell>{entry.predictedOutcome}</TableCell>
                <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                  {entry.points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {data.entries.map((entry, index) => (
            <Card key={entry.userId} className={cn(entry.userId === currentUserId && "border-primary")}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                                {index + 1}
                            </div>
                            <span className="font-medium">
                                {entry.name} {entry.userId === currentUserId && '(You)'}
                            </span>
                        </div>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {entry.points}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex flex-col items-center">
                            <span>Exact</span>
                            <span className="font-semibold text-foreground">{entry.predictedCount}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span>Diff</span>
                            <span className="font-semibold text-foreground">{entry.predictedDifference}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span>Result</span>
                            <span className="font-semibold text-foreground">{entry.predictedOutcome}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
