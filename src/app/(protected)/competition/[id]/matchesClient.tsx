"use client";

import {Competition, Match} from "@/app/server/modules/competitions/types";
import { Card } from "@/app/client/components/ui/Card";
import Image from "next/image";
import {useActionState, useState, useEffect, useCallback, useTransition } from "react";
import { MatchScoreInput } from "@/app/client/components/ui/MatchScoreInput";
import {getCompetitionMatches, saveMatchScore} from "@/app/actions/matches";
import Form from "next/form";

interface Props {
  competition: Competition;
  matchDays: number[];
}

export default function MatchesClient({competition, matchDays }: Props) {
  const [selectedMatchDay, setSelectedMatchDay] = useState<number>(competition.activeMatchDay);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pending, startTransition] = useTransition();

  const selectMatchDay = useCallback((day: number) => {
    startTransition(async () => {
      const data = await getCompetitionMatches(competition.id, day);
      setSelectedMatchDay(day);
      setMatches(data ?? []);
    });
  }, [competition.id]);

  useEffect(() => {
    selectMatchDay(selectedMatchDay);
  }, [selectedMatchDay, selectMatchDay]);

  return (
      <div className="z-10 max-w-5xl w-full items-center justify-between px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-center mb-6 md:mb-8">
          {competition && (
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <div className="bg-amber-50 rounded-lg p-2 md:p-3 flex items-center justify-center">
                  <Image
                      src={competition.emblem}
                      alt={competition.name}
                      width={40}
                      height={40}
                      className="object-contain md:w-[60px] md:h-[60px]"
                  />
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-center text-white">
                  {competition.name} Matches
                </h1>
              </div>
          )}
        </div>

        <div className="mb-4 overflow-x-auto no-scrollbar overflow-y-hidden">
          <div className="inline-flex space-x-2 overflow-y-hidden">
            {matchDays.map((matchDay) => {
              const isActive = matchDay === selectedMatchDay;
              return (
                  <button
                      key={matchDay}
                      onClick={() => setSelectedMatchDay(matchDay)}
                      className={`px-2 py-2 w-20 rounded text-sm transition-colors ${
                          isActive
                              ? "bg-blue-600 text-white"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    Match Day {matchDay}
                  </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
  );
}

interface MatchCardProps {
  match: Match;
}

function MatchCard({ match }: MatchCardProps) {
  const [homeScore, setHomeScore] = useState<number>(match.predictedScore?.home ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.predictedScore?.away ?? 0);
  const [isPredicted, setIsPredicted] = useState<boolean>(match.predictedScore?.isPredicted ?? false);
  const [isEditing, setIsEditing] = useState<boolean>(!isPredicted);
  const [state, action, pending] = useActionState(saveMatchScore, undefined);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (state?.message) {
      setShowMessage(true);
      if (state?.success) {
        setIsPredicted(true);
        setIsEditing(false);
      }
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
      <Card
          title={`${match.homeTeam?.tla ?? 'HOME'} ${match.score?.fullTime?.home ?? '-'} : ${match.score?.fullTime?.away ?? '-'} ${match.awayTeam?.tla ?? 'AWAY'}`}
          description={formatDate(match.utcDate)}
          width="w-full"
      >
        {/* Mobile layout */}
        <div className="md:hidden flex flex-col items-center justify-center py-3">
          <div className="flex flex-row items-center justify-center">
            {/* Home Team */}
            <div className="flex flex-col items-center w-32">
              <div className="bg-white p-2 rounded w-12 h-12 flex items-center justify-center mb-2">
                <Image
                    src={match.homeTeam.crest}
                    alt={match.homeTeam.name}
                    width={32}
                    height={32}
                    className="object-contain"
                />
              </div>
              <span className="text-white text-sm font-medium text-center">{match.homeTeam.shortName}</span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center w-32">
              <div className="bg-white p-2 rounded w-12 h-12 flex items-center justify-center mb-2">
                <Image
                    src={match.awayTeam.crest}
                    alt={match.awayTeam.name}
                    width={32}
                    height={32}
                    className="object-contain"
                />
              </div>
              <span className="text-white text-sm font-medium text-center">{match.awayTeam.shortName}</span>
            </div>
          </div>

          <div className="flex items-center justify-center w-32 mx-4">
            <MatchScoreInput
                homeScore={homeScore}
                awayScore={awayScore}
                onHomeScoreChange={setHomeScore}
                onAwayScoreChange={setAwayScore}
                disabled={!isEditing}
            />
          </div>
        </div>
        {/* Desktop layout */}
        <div className="hidden md:flex items-center justify-between px-6 py-4">
          <div className="flex flex-col items-center w-1/3">
            <div className="bg-white p-4 rounded-lg mb-4 w-24 h-24 flex items-center justify-center">
              <Image
                  src={match.homeTeam.crest}
                  alt={match.homeTeam.name}
                  width={80}
                  height={80}
                  className="object-contain"
              />
            </div>
            <h3 className="text-white text-lg font-semibold text-center">{match.homeTeam.shortName}</h3>
          </div>

          <div className="flex items-center justify-center w-1/3">
            <div className="h-24 flex items-start -mt-12">
              <MatchScoreInput
                  homeScore={homeScore}
                  awayScore={awayScore}
                  onHomeScoreChange={setHomeScore}
                  onAwayScoreChange={setAwayScore}
                  disabled={!isEditing}
              />
            </div>
          </div>

          <div className="flex flex-col items-center w-1/3">
            <div className="bg-white p-4 rounded-lg mb-4 w-24 h-24 flex items-center justify-center">
              <Image
                  src={match.awayTeam.crest}
                  alt={match.awayTeam.name}
                  width={80}
                  height={80}
                  className="object-contain"
              />
            </div>
            <h3 className="text-white text-lg font-semibold text-center">{match.awayTeam.shortName}</h3>
          </div>
        </div>

        <div className="mt-4 px-4 md:px-6 pb-4">
          {showMessage && state?.message && (
              <div className={`mb-4 p-3 rounded text-center text-sm ${
                  state.success
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {state.message}
              </div>
          )}

          <div className="flex justify-center space-x-2">
            {!match.isStarted && (
                <div>
                  {isEditing ? (
                      <Form action={action} className="flex justify-center space-x-2">
                        <input type="hidden" name="competitionId" value={match.competition.id}/>
                        <input type="hidden" name="matchId" value={match.id}/>
                        <input type="hidden" name="homeScore" value={homeScore}/>
                        <input type="hidden" name="awayScore" value={awayScore}/>
                        <input type="hidden" name="matchDay" value={match.matchday}/>

                        <button
                            type="submit"
                            disabled={pending}
                            className={`font-bold py-2 px-4 md:px-6 rounded text-sm transition-colors duration-200 ${
                                pending
                                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                          {pending ? 'Saving...' : 'Save Prediction'}
                        </button>
                      </Form>
                  ) : (
                      <button
                          onClick={handleEditClick}
                          className="font-bold py-2 px-4 md:px-6 rounded text-sm transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Edit
                      </button>
                  )}
                </div>
            )}
          </div>
        </div>
      </Card>
  );
}