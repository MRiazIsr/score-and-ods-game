"use client"

import { Match, Goal, Booking, Substitution, LineupPlayer } from "@/app/server/modules/competitions/types"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { X, User, UserCheck, ArrowRightLeft, Target, AlertTriangle } from "lucide-react"

interface MatchDetailsModalProps {
  match: Match
  isOpen: boolean
  onClose: () => void
}

export function MatchDetailsModal({ match, isOpen, onClose }: MatchDetailsModalProps) {
  if (!isOpen) return null

  // Helper for date formatting
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';
  const hasLineups = (match.homeTeam.lineup && match.homeTeam.lineup.length > 0) || 
                     (match.awayTeam.lineup && match.awayTeam.lineup.length > 0);
  const hasGoals = match.goals && match.goals.length > 0;
  const hasBookings = match.bookings && match.bookings.length > 0;
  const hasSubstitutions = match.substitutions && match.substitutions.length > 0;

  // Form guide display component
  const FormGuide = ({ form, teamName }: { form?: ('W' | 'D' | 'L' | 'N')[]; teamName: string }) => {
    if (!form || form.length === 0) return <span className="text-sm text-muted-foreground italic">No recent data</span>;
    return (
      <div className="flex gap-1.5">
        {form.map((r, i) => (
          <div key={i} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm
                ${r === 'W' ? 'bg-green-500' : r === 'D' ? 'bg-yellow-500' : r === 'L' ? 'bg-red-500' : 'bg-gray-400'}`}
            title={r === 'N' ? 'No data' : `${teamName}: ${r === 'W' ? 'Win' : r === 'D' ? 'Draw' : 'Loss'}`}
          >
            {r}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-background rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-border relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 hover:bg-muted z-10" 
            onClick={onClose}
        >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
        </Button>

        {/* Header / Scoreboard */}
        <div className="bg-muted/40 p-6 md:p-8 flex flex-col items-center border-b shrink-0">
          <div className="text-sm text-muted-foreground mb-4 uppercase tracking-widest font-semibold">
            {match.competition.name} • {match.stage.replace(/_/g, ' ')}
          </div>

          <div className="flex w-full justify-between items-center max-w-4xl">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1">
                <div className="w-24 h-24 md:w-32 md:h-32 p-4 bg-background rounded-full shadow-sm flex items-center justify-center mb-4">
                     <Image
                        src={match.homeTeam.crest}
                        alt={match.homeTeam.name}
                        width={100}
                        height={100}
                        className="object-contain max-h-full max-w-full"
                    />
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-center">{match.homeTeam.name}</h2>
                {match.homeTeam.formation && (
                    <span className="text-sm text-muted-foreground mt-1">{match.homeTeam.formation}</span>
                )}
                {match.homeTeam.coach && (
                    <span className="text-xs text-muted-foreground mt-1">Coach: {match.homeTeam.coach.name}</span>
                )}
            </div>

            {/* Score / Time */}
            <div className="flex flex-col items-center px-4 md:px-12">
                {(isLive || isFinished) ? (
                    <div className="text-5xl md:text-7xl font-bold font-mono tracking-tighter flex items-center gap-4">
                        <span>{match.score.fullTime.home ?? 0}</span>
                        <span className="text-muted-foreground/30">-</span>
                        <span>{match.score.fullTime.away ?? 0}</span>
                    </div>
                ) : (
                    <div className="text-4xl md:text-6xl font-bold text-muted-foreground/30 font-mono tracking-widest">
                        VS
                    </div>
                )}
                
                <div className="mt-4 flex flex-col items-center gap-1">
                     {isLive && <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">LIVE</span>}
                     <span className="text-lg font-medium text-muted-foreground">{match.status}</span>
                     <span className="text-sm text-muted-foreground">{formatDate(match.utcDate)}</span>
                     {match.venue && <span className="text-xs text-muted-foreground">📍 {match.venue}</span>}
                     {match.attendance && <span className="text-xs text-muted-foreground">👥 {match.attendance.toLocaleString()}</span>}
                </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1">
                <div className="w-24 h-24 md:w-32 md:h-32 p-4 bg-background rounded-full shadow-sm flex items-center justify-center mb-4">
                     <Image
                        src={match.awayTeam.crest}
                        alt={match.awayTeam.name}
                        width={100}
                        height={100}
                        className="object-contain max-h-full max-w-full"
                    />
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-center">{match.awayTeam.name}</h2>
                {match.awayTeam.formation && (
                    <span className="text-sm text-muted-foreground mt-1">{match.awayTeam.formation}</span>
                )}
                {match.awayTeam.coach && (
                    <span className="text-xs text-muted-foreground mt-1">Coach: {match.awayTeam.coach.name}</span>
                )}
            </div>
          </div>

          {/* Referee */}
          {match.referees && match.referees.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Referee: {match.referees.find(r => r.type === 'REFEREE')?.name || match.referees[0].name}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Predictions & Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Prediction Card */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Your Prediction</h3>
                         {match.predictedScore?.isPredicted ? (
                            <div className="flex flex-col items-center justify-center h-32">
                                <div className="flex items-center gap-4 text-5xl font-bold text-primary">
                                    <span>{match.predictedScore.home}</span>
                                    <span className="text-muted-foreground">-</span>
                                    <span>{match.predictedScore.away}</span>
                                </div>
                                <span className="text-sm text-muted-foreground mt-2">Predicted Outcome</span>
                            </div>
                         ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                                <span>No prediction made</span>
                            </div>
                         )}
                    </div>
                   
                   {/* Form Guide Card */}
                   <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Recent Form (Last 5)</h3>
                        <div className="space-y-6">
                            {/* Home Form */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 relative flex items-center justify-center bg-muted rounded-full p-1">
                                        <Image src={match.homeTeam.crest} width={24} height={24} alt={match.homeTeam.shortName} className="object-contain" />
                                    </div>
                                    <span className="font-medium">{match.homeTeam.shortName}</span>
                                </div>
                                <FormGuide form={match.formGuide?.home} teamName={match.homeTeam.shortName} />
                            </div>
                            
                            {/* Away Form */}
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 relative flex items-center justify-center bg-muted rounded-full p-1">
                                        <Image src={match.awayTeam.crest} width={24} height={24} alt={match.awayTeam.shortName} className="object-contain" />
                                    </div>
                                    <span className="font-medium">{match.awayTeam.shortName}</span>
                                </div>
                                <FormGuide form={match.formGuide?.away} teamName={match.awayTeam.shortName} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goals Timeline */}
                {hasGoals && (
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                            <Target className="w-5 h-5" /> Goals
                        </h3>
                        <div className="space-y-3">
                            {match.goals!.sort((a, b) => a.minute - b.minute).map((goal: Goal, i: number) => (
                                <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${goal.team.id === match.homeTeam.id ? 'bg-muted/50' : 'bg-muted/30'}`}>
                                    <span className="text-lg font-mono font-bold text-muted-foreground w-12">{goal.minute}&apos;</span>
                                    <div className="flex-1">
                                        <span className="font-semibold">{goal.scorer.name}</span>
                                        {goal.assist && <span className="text-muted-foreground ml-2">(Assist: {goal.assist.name})</span>}
                                        {goal.type !== 'REGULAR' && (
                                            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${goal.type === 'PENALTY' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'}`}>
                                                {goal.type}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{goal.team.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bookings */}
                {hasBookings && (
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Bookings
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {match.bookings!.sort((a, b) => a.minute - b.minute).map((booking: Booking, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                    <span className="font-mono text-sm text-muted-foreground">{booking.minute}&apos;</span>
                                    <div className={`w-4 h-5 rounded-sm ${
                                        booking.card === 'RED' ? 'bg-red-600' : 
                                        booking.card === 'YELLOW_RED' ? 'bg-gradient-to-b from-yellow-400 to-red-600' : 
                                        'bg-yellow-400'
                                    }`} />
                                    <span className="font-medium">{booking.player.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Substitutions */}
                {hasSubstitutions && (
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5" /> Substitutions
                        </h3>
                        <div className="space-y-2">
                            {match.substitutions!.sort((a, b) => a.minute - b.minute).map((sub: Substitution, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-2 rounded-lg bg-muted/30">
                                    <span className="font-mono text-sm text-muted-foreground w-10">{sub.minute}&apos;</span>
                                    <span className="text-xs text-muted-foreground">{sub.team.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500">↓ {sub.playerOut.name}</span>
                                        <span className="text-green-500">↑ {sub.playerIn.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lineups */}
                {hasLineups && (
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
                            <UserCheck className="w-5 h-5" /> Lineups
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Home Lineup */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Image src={match.homeTeam.crest} width={24} height={24} alt={match.homeTeam.shortName} className="object-contain" />
                                    <span className="font-semibold">{match.homeTeam.name}</span>
                                    {match.homeTeam.formation && <span className="text-muted-foreground">({match.homeTeam.formation})</span>}
                                </div>
                                {match.homeTeam.lineup && match.homeTeam.lineup.length > 0 ? (
                                    <>
                                        <div className="space-y-1">
                                            {match.homeTeam.lineup.map((player: LineupPlayer, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                                                    <span className="w-6 text-center font-mono text-sm text-muted-foreground">{player.shirtNumber || '-'}</span>
                                                    <span>{player.name}</span>
                                                    {player.position && <span className="text-xs text-muted-foreground ml-auto">{player.position}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        {match.homeTeam.bench && match.homeTeam.bench.length > 0 && (
                                            <div className="mt-4 border-t pt-4">
                                                <span className="text-sm text-muted-foreground mb-2 block">Substitutes</span>
                                                <div className="space-y-1">
                                                    {match.homeTeam.bench.map((player: LineupPlayer, i: number) => (
                                                        <div key={i} className="flex items-center gap-3 p-1.5 rounded text-muted-foreground hover:bg-muted/30">
                                                            <span className="w-6 text-center font-mono text-xs">{player.shirtNumber || '-'}</span>
                                                            <span className="text-sm">{player.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-muted-foreground italic">Lineup not available</span>
                                )}
                            </div>

                            {/* Away Lineup */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <Image src={match.awayTeam.crest} width={24} height={24} alt={match.awayTeam.shortName} className="object-contain" />
                                    <span className="font-semibold">{match.awayTeam.name}</span>
                                    {match.awayTeam.formation && <span className="text-muted-foreground">({match.awayTeam.formation})</span>}
                                </div>
                                {match.awayTeam.lineup && match.awayTeam.lineup.length > 0 ? (
                                    <>
                                        <div className="space-y-1">
                                            {match.awayTeam.lineup.map((player: LineupPlayer, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                                                    <span className="w-6 text-center font-mono text-sm text-muted-foreground">{player.shirtNumber || '-'}</span>
                                                    <span>{player.name}</span>
                                                    {player.position && <span className="text-xs text-muted-foreground ml-auto">{player.position}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        {match.awayTeam.bench && match.awayTeam.bench.length > 0 && (
                                            <div className="mt-4 border-t pt-4">
                                                <span className="text-sm text-muted-foreground mb-2 block">Substitutes</span>
                                                <div className="space-y-1">
                                                    {match.awayTeam.bench.map((player: LineupPlayer, i: number) => (
                                                        <div key={i} className="flex items-center gap-3 p-1.5 rounded text-muted-foreground hover:bg-muted/30">
                                                            <span className="w-6 text-center font-mono text-xs">{player.shirtNumber || '-'}</span>
                                                            <span className="text-sm">{player.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-muted-foreground italic">Lineup not available</span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* No detailed data placeholder */}
                {!hasLineups && !hasGoals && !hasBookings && !hasSubstitutions && (
                    <div className="bg-muted/20 border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center">
                        <div className="bg-muted rounded-full p-4 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </div>
                        <h3 className="text-lg font-medium mb-1">Detailed Statistics Unavailable</h3>
                        <p className="text-muted-foreground max-w-sm">Lineups, events, and deeper match statistics will be available closer to kickoff or after the match has started.</p>
                    </div>
                )}

            </div>
        </div>

      </div>
    </div>
  )
}
