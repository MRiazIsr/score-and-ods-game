"use client";

import { Match } from "@/app/server/modules/competitions/types";
import { Card } from "@/app/client/components/ui/Card";
import Image from "next/image";
import { useActionState, useState, useEffect } from "react";
import { MatchScoreInput } from "@/app/client/components/ui/MatchScoreInput";
import { saveMatchScore } from "@/app/actions/matches";
import Form from "next/form";

interface Props {
  matches: Match[];
}

export default function MatchesClient({ matches }: Props) {
  // Use the first match to get competition info for the header
  const competition = matches[0]?.competition;

  return (
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <div className="flex items-center justify-center mb-8">
          {competition && (
              <div className="flex items-center space-x-4">
                <div className="bg-amber-50 rounded-lg p-3 flex items-center justify-center">
                  <Image
                      src={competition.emblem}
                      alt={competition.name}
                      width={60}
                      height={60}
                      className="object-contain"
                  />
                </div>
                <h1 className="text-4xl font-bold text-center text-white">
                  {competition.name} Matches
                </h1>
              </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
      <Card
          title={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
          description={formatDate(match.utcDate)}
          width="w-full"
      >
        <div className="flex items-center justify-between px-6 py-4">
          {/* Home Team */}
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

          {/* Score Input */}
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

          {/* Away Team */}
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

        <div className="mt-4 px-6 pb-4">
          {/* Success/Error Message */}
          {showMessage && state?.message && (
              <div className={`mb-4 p-3 rounded text-center ${
                  state.success
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {state.message}
              </div>
          )}

          <div className="flex justify-center space-x-2">
            {isEditing ? (
                <Form action={action} className="flex justify-center space-x-2">
                  {/* Hidden inputs to pass data */}
                  <input type="hidden" name="competitionId" value={match.competition.id} />
                  <input type="hidden" name="matchId" value={match.id} />
                  <input type="hidden" name="homeScore" value={homeScore} />
                  <input type="hidden" name="awayScore" value={awayScore} />
                  <input type="hidden" name="matchDay" value={match.matchday} />

                  <button
                      type="submit"
                      disabled={pending}
                      className={`font-bold py-2 px-6 rounded transition-colors duration-200 ${
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
                    className="font-bold py-2 px-6 rounded transition-colors duration-200 bg-green-600 hover:bg-green-700 text-white"
                >
                  Edit
                </button>
            )}
          </div>
        </div>
      </Card>
  );
}