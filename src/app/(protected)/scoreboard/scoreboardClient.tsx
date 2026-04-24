"use client";

import { useState, useEffect } from "react";
import { Competition, ScoreBoardData } from "@/app/server/modules/competitions/types";
import { CompetitionDropdown } from "@/app/client/components/ui/CompetitionDropdown";
import { ScoreBoardTable } from "@/app/client/components/ui/ScoreBoardTable";
import { Chip } from "@/app/client/components/stadium/Chip";
import { getScoreBoardData } from "@/app/actions/scoreboard";

interface ScoreboardClientProps {
    competitions: Competition[];
    defaultCompetitionId: number;
    currentUserId?: string;
}

type TimeFilter = "week" | "season" | "all";

export default function ScoreBoardClient({
    competitions,
    defaultCompetitionId,
    currentUserId,
}: ScoreboardClientProps) {
    const [selectedCompetitionId, setSelectedCompetitionId] = useState(defaultCompetitionId);
    const [scoreBoardData, setScoreBoardData] = useState<ScoreBoardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("season");

    useEffect(() => {
        let cancelled = false;
        async function loadScoreBoardData() {
            try {
                setLoading(true);
                setError(null);
                const data = await getScoreBoardData(selectedCompetitionId);
                if (!cancelled) setScoreBoardData(data);
            } catch (err) {
                console.error("Error fetching scoreboard data:", err);
                if (!cancelled) setError("Failed to load scoreboard data. Please try again.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        loadScoreBoardData();
        return () => {
            cancelled = true;
        };
    }, [selectedCompetitionId]);

    return (
        <div style={{ display: "grid", gap: 24 }}>
            {/* top heading */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div
                        className="uppercase"
                        style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "#4A5148" }}
                    >
                        Season · League table
                    </div>
                    <h1
                        className="font-display"
                        style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.8, marginTop: 6 }}
                    >
                        Leaderboard
                    </h1>
                    <div className="text-ink2" style={{ fontSize: 13, marginTop: 4 }}>
                        Who&apos;s calling the scores right — and who&apos;s on cleanup duty.
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* segmented control */}
                    <div
                        className="flex"
                        style={{
                            background: "#fff",
                            border: "1px solid #E4E1D6",
                            padding: 3,
                            borderRadius: 6,
                            gap: 2,
                        }}
                    >
                        {([
                            { id: "week", label: "Week" },
                            { id: "season", label: "Season" },
                            { id: "all", label: "All-time" },
                        ] as const).map((tab) => {
                            const active = tab.id === timeFilter;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setTimeFilter(tab.id)}
                                    style={{
                                        padding: "7px 14px",
                                        fontSize: 12,
                                        fontWeight: 600,
                                        borderRadius: 4,
                                        border: "none",
                                        cursor: "pointer",
                                        background: active ? "#9D0010" : "transparent",
                                        color: active ? "#fff" : "#4A5148",
                                        transition: "background 0.15s, color 0.15s",
                                    }}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <CompetitionDropdown
                        competitions={competitions}
                        selectedCompetitionId={selectedCompetitionId}
                        onSelect={setSelectedCompetitionId}
                    />
                </div>
            </div>

            {/* scoring legend */}
            <div
                className="flex flex-wrap items-center gap-3"
                style={{
                    background: "#fff",
                    border: "1px solid #E4E1D6",
                    borderRadius: 8,
                    padding: "10px 14px",
                }}
            >
                <Chip tone="brand">Scoring</Chip>
                <span className="text-ink2" style={{ fontSize: 12 }}>
                    <strong style={{ color: "#1E3A8A", fontWeight: 700 }}>+3</strong> exact score ·{" "}
                    <strong style={{ color: "#1E3A8A", fontWeight: 700 }}>+2</strong> goal difference ·{" "}
                    <strong style={{ color: "#1E3A8A", fontWeight: 700 }}>+1</strong> right outcome
                </span>
            </div>

            {/* content */}
            {loading ? (
                <div className="flex justify-center" style={{ padding: "60px 0" }}>
                    <svg className="animate-spin" style={{ color: "#1E3A8A" }} width="36" height="36" viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            opacity="0.25"
                        />
                        <path
                            fill="currentColor"
                            opacity="0.75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            ) : error ? (
                <div
                    style={{
                        background: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                        color: "#991B1B",
                        padding: "14px 18px",
                        borderRadius: 8,
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            ) : scoreBoardData ? (
                <ScoreBoardTable data={scoreBoardData} currentUserId={currentUserId} />
            ) : null}
        </div>
    );
}
