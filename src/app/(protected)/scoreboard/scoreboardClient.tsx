"use client";

import { useState, useEffect } from "react";
import {Competition, ScoreBoardData} from "@/app/server/modules/competitions/types";
import { CompetitionDropdown } from "@/app/client/components/ui/CompetitionDropdown";
import { ScoreBoardTable } from "@/app/client/components/ui/ScoreBoardTable";
import { getScoreBoardData } from "@/app/actions/scoreboard";

interface ScoreboardClientProps {
  competitions: Competition[][];
  defaultCompetitionId: number;
  currentUserId?: string;
}

export default function ScoreBoardClient({
                                           competitions,
                                           defaultCompetitionId,
                                           currentUserId
                                         }: ScoreboardClientProps) {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(defaultCompetitionId);
  const [scoreBoardData, setScoreBoardData] = useState<ScoreBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScoreBoardData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getScoreBoardData(selectedCompetitionId);
        setScoreBoardData(data);
      } catch (error) {
        console.error("Error fetching scoreboard data:", error);
        setError("Failed to load scoreboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadScoreBoardData();
  }, [selectedCompetitionId]);

  return (
      <div className="space-y-4 px-2 sm:px-4 md:space-y-6 md:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Score Board</h1>
            <p className="text-gray-400 text-sm md:text-base">See how you are doing compared to other players</p>
          </div>
          <div className="w-full md:w-auto mt-2 md:mt-0">
            <CompetitionDropdown
                competitions={competitions}
                selectedCompetitionId={selectedCompetitionId}
                onSelect={setSelectedCompetitionId}
            />
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        ) : error ? (
            <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 p-3 md:p-4 rounded-lg text-sm md:text-base">
              {error}
            </div>
        ) : scoreBoardData ? (
            <div className="overflow-x-auto -mx-2 px-2 sm:mx-0 sm:px-0">
              <ScoreBoardTable data={scoreBoardData} currentUserId={currentUserId} />
            </div>
        ) : null}
      </div>
  );
}