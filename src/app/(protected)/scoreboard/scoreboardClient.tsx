"use client";

import { useState, useEffect } from "react";
import { Competition } from "@/app/server/modules/competitions/types";
import { CompetitionDropdown } from "@/app/client/components/ui/CompetitionDropdown";
import { ScoreBoardTable } from "@/app/client/components/ui/ScoreBoardTable";
import { getScoreBoardData } from "@/app/actions/scoreboard";

interface ScoreboardClientProps {
  competitions: Competition[][];
  defaultCompetitionId: number;
  currentUserId?: string;
}

export default function ScoreboardClient({
  competitions,
  defaultCompetitionId,
  currentUserId
}: ScoreboardClientProps) {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(defaultCompetitionId);
  const [scoreboardData, setScoreboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем данные при изменении выбранной компетиции
  useEffect(() => {
    async function loadScoreboardData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getScoreBoardData(selectedCompetitionId);
        setScoreboardData(data);
      } catch (error) {
        console.error("Error fetching scoreboard data:", error);
        setError("Failed to load scoreboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadScoreboardData();
  }, [selectedCompetitionId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Score Board</h1>
          <p className="text-gray-400">See how you're doing compared to other players</p>
        </div>
        <CompetitionDropdown
          competitions={competitions}
          selectedCompetitionId={selectedCompetitionId}
          onSelect={setSelectedCompetitionId}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 p-4 rounded-lg">
          {error}
        </div>
      ) : scoreboardData ? (
        <ScoreBoardTable data={scoreboardData} currentUserId={currentUserId} />
      ) : null}
    </div>
  );
}
