"use client";

import { useState, useEffect } from "react";
import {Competition, ScoreBoardData} from "@/app/server/modules/competitions/types";
import { getScoreBoardData } from "@/app/actions/scoreboard";
import { ScoreBoardTable } from "@/components/scoreboard-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card";

interface ScoreboardClientProps {
  competitions: Competition[];
  defaultCompetitionId: number;
  currentUserId?: string;
}

export default function ScoreBoardClient({
                                           competitions,
                                           defaultCompetitionId,
                                           currentUserId
                                         }: ScoreboardClientProps) {
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(defaultCompetitionId.toString());
  const [scoreBoardData, setScoreBoardData] = useState<ScoreBoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScoreBoardData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getScoreBoardData(parseInt(selectedCompetitionId));
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Score Board</h1>
            <p className="text-muted-foreground">See how you are doing compared to other players</p>
          </div>
          <div className="w-full md:w-[250px]">
            <Select 
                value={selectedCompetitionId} 
                onValueChange={setSelectedCompetitionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Competition" />
              </SelectTrigger>
              <SelectContent>
                {competitions.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-12">
               <span className="loading loading-spinner text-primary">Loading scoreboard...</span>
            </div>
        ) : error ? (
            <Card className="border-destructive bg-destructive/10 text-destructive">
                <CardContent className="p-4">
                    {error}
                </CardContent>
            </Card>
        ) : scoreBoardData ? (
             <ScoreBoardTable data={scoreBoardData} currentUserId={currentUserId} />
        ) : null}
      </div>
  );
}