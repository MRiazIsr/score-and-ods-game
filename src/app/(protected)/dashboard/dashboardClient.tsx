"use client";

import { useState } from "react";
import type { DashboardFeed, UserStats } from "@/app/server/services/auth/DashboardService";
import { StatCard } from "@/app/client/components/stadium/StatCard";
import { SectionHead } from "@/app/client/components/stadium/SectionHead";
import { SportToggle, type Sport } from "@/app/client/components/stadium/SportToggle";
import { MatchCard } from "@/app/client/components/stadium/MatchCard";
import { LeaguesSidebar } from "@/app/client/components/stadium/LeaguesSidebar";
import { TrashTalk } from "@/app/client/components/stadium/TrashTalk";

interface DashboardClientProps {
    feed: DashboardFeed;
    stats: UserStats;
}

export default function DashboardClient({ feed, stats }: DashboardClientProps) {
    const [sport, setSport] = useState<Sport>("football");
    const { live, upcoming, settled } = feed;

    return (
        <div
            style={{
                background: "#F4F2EC",
                minHeight: "calc(100vh - 56px)",
                paddingBottom: 48,
            }}
        >
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 0" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                    <SportToggle value={sport} onChange={setSport} />
                    <div style={{ fontSize: 11, color: "#4A5148" }}>
                        Week{" "}
                        <span
                            className="font-display"
                            style={{ color: "#0B0F0A", fontWeight: 700 }}
                        >
                            +{stats.weekly}
                        </span>
                    </div>
                </div>

                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
                        gap: 10,
                    }}
                >
                    <StatCard
                        hero
                        label="Total points"
                        value={stats.total}
                        sub={`${live.length + upcoming.length + settled.length} tracked matches`}
                    />
                    <StatCard
                        label="Weekly"
                        value={`+${stats.weekly}`}
                        sub="This week (Mon–Sun)"
                    />
                    <StatCard
                        label="Streak"
                        value={`${stats.streak}${stats.streak > 0 ? " 🔥" : ""}`}
                        sub={stats.streak > 0 ? "Keep it alive" : "Start a run"}
                    />
                    <StatCard label="Hit rate" value={`${stats.hitRate}%`} sub="Last 25 picks" />
                </div>
            </div>

            <div
                className="grid"
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "24px",
                    gridTemplateColumns: "1fr 300px",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                <div>
                    {live.length > 0 && (
                        <>
                            <SectionHead title="Live now" chip={`${live.length} in play`} />
                            <div className="grid" style={{ gap: 10, marginBottom: 20 }}>
                                {live.map((m) => (
                                    <MatchCard key={m.id} match={m} />
                                ))}
                            </div>
                        </>
                    )}

                    <SectionHead
                        title="Upcoming"
                        chip={upcoming.length ? `${upcoming.length} open` : "Nothing scheduled"}
                    />
                    {upcoming.length > 0 ? (
                        <div className="grid" style={{ gap: 10 }}>
                            {upcoming.map((m) => (
                                <MatchCard key={m.id} match={m} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No upcoming fixtures in the tracked competitions. Check back after the next update." />
                    )}

                    {settled.length > 0 && (
                        <>
                            <div style={{ height: 28 }} />
                            <SectionHead
                                title="Recently settled"
                                chip={`${settled.length} match${settled.length === 1 ? "" : "es"}`}
                            />
                            <div className="grid" style={{ gap: 10 }}>
                                {settled.map((m) => (
                                    <MatchCard key={m.id} match={m} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div>
                    <div aria-hidden style={{ visibility: "hidden" }}>
                        <SectionHead title="—" chip="—" />
                    </div>
                    <div className="grid" style={{ gap: 16, alignContent: "start" }}>
                        <LeaguesSidebar />
                        <TrashTalk />
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px dashed #E4E1D6",
                borderRadius: 8,
                padding: "24px 20px",
                textAlign: "center",
                fontSize: 12,
                color: "#4A5148",
            }}
        >
            {message}
        </div>
    );
}
