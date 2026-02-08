"use client"

import * as React from "react"
import Image from "next/image"
import { useActionState, useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MatchScoreInput } from "@/components/match-score-input"
import { saveMatchScore } from "@/app/actions/matches"
import { Match, Team } from "@/app/server/modules/competitions/types"
import { Loader2 } from "lucide-react"
import { MatchDetailsModal } from "@/components/match-details-modal"

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  const [homeScore, setHomeScore] = useState<number>(match.predictedScore?.home ?? 0)
  const [awayScore, setAwayScore] = useState<number>(match.predictedScore?.away ?? 0)
  const [isPredicted, setIsPredicted] = useState<boolean>(match.predictedScore?.isPredicted ?? false)
  const [isEditing, setIsEditing] = useState<boolean>(!isPredicted)
  const [state, action, pending] = useActionState(saveMatchScore, undefined)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  
  // Modal state (can be moved up if we want a single modal instance)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (state?.message) {
      setMessage({ 
          text: state.message, 
          type: state.success ? 'success' : 'error' 
      })
      if (state?.success) {
        setIsPredicted(true)
        setIsEditing(false)
      }
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [state])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const FormGuide = ({ form }: { form?: ('W' | 'D' | 'L' | 'N')[] }) => {
    if (!form || form.length === 0) return null;
    return (
        <div className="flex gap-1 mt-2 justify-center">
            {form.map((result, i) => {
                let color = "bg-gray-400"; // Default for 'N' (no data)
                if (result === 'W') color = "bg-green-500";
                if (result === 'D') color = "bg-yellow-500";
                if (result === 'L') color = "bg-red-500";
                return (
                    <div 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${color}`} 
                        title={result === 'N' ? 'No data' : result} 
                    />
                )
            })}
        </div>
    )
  }

  const TeamDisplay = ({ team, isHome, form }: { team: Team; isHome: boolean; form?: ('W' | 'D' | 'L' | 'N')[] }) => (
    <div className={`flex flex-col items-center gap-2 w-1/3 ${isHome ? 'order-1' : 'order-3'}`}>
      <div className="relative h-16 w-16 md:h-20 md:w-20 p-2 bg-muted rounded-full flex items-center justify-center">
        <Image
          src={team.crest}
          alt={team.name}
          width={60}
          height={60}
          className="object-contain max-h-full max-w-full"
        />
      </div>
      <span className="text-center font-semibold text-sm md:text-base leading-tight">
        {team.shortName || team.name}
      </span>
      <FormGuide form={form} />
    </div>
  )

  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  return (
    <>
    <Card className="w-full overflow-hidden transition-all hover:shadow-md relative">
      <CardHeader className="bg-muted/30 py-3">
        <div className="flex justify-between items-center text-xs md:text-sm text-muted-foreground">
          <span>{formatDate(match.utcDate)}</span>
          <div className="flex items-center gap-2">
            {isLive && <span className="animate-pulse text-red-500 font-bold">● LIVE</span>}
            <span className="font-mono uppercase">{match.status}</span>
          </div>
           {/* Additional Information Button in Header */}
           <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700 h-6 px-2 text-xs" onClick={() => setShowDetails(true)}>
                Additional Info
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
            <TeamDisplay team={match.homeTeam} isHome={true} form={match.formGuide?.home} />
            
            <div className="order-2 w-1/3 flex flex-col items-center gap-4">
                
                {/* Score Display for Live/Finished */}
                {(isLive || isFinished) && match.score.fullTime.home !== null && (
                    <div className="flex flex-col items-center mb-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Actual Score</span>
                        <div className="text-3xl font-bold font-mono">
                            {match.score.fullTime.home} - {match.score.fullTime.away}
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center w-full">
                     <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Prediction</span>
                    <MatchScoreInput
                        homeScore={homeScore}
                        awayScore={awayScore}
                        onHomeScoreChange={setHomeScore}
                        onAwayScoreChange={setAwayScore}
                        disabled={!isEditing || match.isStarted}
                    />
                </div>
                
                {message && (
                    <div className={`flex items-center justify-center text-xs px-3 py-1.5 rounded-full font-medium ${
                        message.type === 'success' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                            : 'bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive'
                    }`}>
                        {message.text}
                    </div>
                )}
            </div>

            <TeamDisplay team={match.awayTeam} isHome={false} form={match.formGuide?.away} />
        </div>

        {/* Action Area */}
        <div className="mt-6 flex justify-center">
            {!match.isStarted && (
                isEditing ? (
                    <form action={action}>
                        <input type="hidden" name="competitionId" value={match.competition.id} />
                        <input type="hidden" name="matchId" value={match.id} />
                        <input type="hidden" name="homeScore" value={homeScore} />
                        <input type="hidden" name="awayScore" value={awayScore} />
                        <input type="hidden" name="matchDay" value={match.matchday} />
                        
                        <Button type="submit" disabled={pending} className="min-w-[120px]">
                            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {pending ? 'Saving...' : 'Save Prediction'}
                        </Button>
                    </form>
                ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Prediction
                    </Button>
                )
            )}
            {match.isStarted && !isLive && !isFinished && (
                 <div className="text-sm font-medium text-muted-foreground">
                    Match Started
                 </div>
            )}
        </div>
      </CardContent>
    </Card>
    {/* Match Details Modal */}
    <MatchDetailsModal 
        match={match} 
        isOpen={showDetails} 
        onClose={() => setShowDetails(false)} 
    />
    </>
  )
}
