"use client";

import { Match } from "@/app/server/modules/competitions/types";
import { Card } from "@/app/client/components/ui/Card";
import Image from "next/image";
import { useState } from "react";
import { MatchScoreInput } from "@/app/client/components/ui/MatchScoreInput";

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
            <div className={`bg-amber-50`}>
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
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);

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
          <div className="h-24 flex items-start -mt-12"> {/* Еще сильнее увеличенный отрицательный отступ */}
            <MatchScoreInput
              homeScore={homeScore}
              awayScore={awayScore}
              onHomeScoreChange={setHomeScore}
              onAwayScoreChange={setAwayScore}
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
        <div className="flex justify-center space-x-2">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition-colors duration-200">
            Save Prediction
          </button>
        </div>
      </div>
    </Card>
  );
}
