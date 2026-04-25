"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { DashboardFeed, UserStats } from "@/app/server/services/auth/DashboardService";
import { StatCard } from "@/app/client/components/stadium/StatCard";
import { SectionHead } from "@/app/client/components/stadium/SectionHead";
import { SportToggle, type Sport } from "@/app/client/components/stadium/SportToggle";
import { MatchCardCompact } from "@/app/client/components/stadium/MatchCardCompact";
import { LeaguesSidebar } from "@/app/client/components/stadium/LeaguesSidebar";
import { TrashTalk } from "@/app/client/components/stadium/TrashTalk";

interface DashboardClientProps {
    feed: DashboardFeed;
    stats: UserStats;
}

export default function DashboardClient({ feed, stats }: DashboardClientProps) {
    const t = useTranslations();
    const [sport, setSport] = useState<Sport>("football");
    const { live, upcoming, settled, formByTeam } = feed;
    const formFor = (teamId: number) => formByTeam[teamId] ?? [];

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
                        {t("dashboard.weekLabel")}{" "}
                        <span
                            className="font-display"
                            style={{ color: "#0B0F0A", fontWeight: 700 }}
                        >
                            {t("dashboard.weekPoints", { weekly: stats.weekly })}
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
                        label={t("stats.totalPoints")}
                        value={stats.total}
                        sub={t("stats.trackedMatches", {
                            count: live.length + upcoming.length + settled.length,
                        })}
                    />
                    <StatCard
                        label={t("stats.weekly")}
                        value={`+${stats.weekly}`}
                        sub={t("stats.weeklyDescription")}
                    />
                    <StatCard
                        label={t("stats.streak")}
                        value={`${stats.streak}${stats.streak > 0 ? " 🔥" : ""}`}
                        sub={stats.streak > 0 ? t("stats.streakActive") : t("stats.streakInactive")}
                    />
                    <StatCard
                        label={t("stats.hitRate")}
                        value={`${stats.hitRate}%`}
                        sub={t("stats.hitRateDescription")}
                    />
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
                            <SectionHead
                                title={t("dashboard.liveNow")}
                                chip={t("dashboard.liveCount", { count: live.length })}
                            />
                            <div className="grid" style={{ gap: 10, marginBottom: 20 }}>
                                {live.map((m) => (
                                    <MatchCardCompact
                                        key={m.id}
                                        match={m}
                                        homeForm={formFor(m.homeTeam.id)}
                                        awayForm={formFor(m.awayTeam.id)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    <SectionHead
                        title={t("dashboard.upcoming")}
                        chip={
                            upcoming.length
                                ? t("dashboard.upcomingCount", { count: upcoming.length })
                                : t("dashboard.nothingScheduled")
                        }
                    />
                    {upcoming.length > 0 ? (
                        <div className="grid" style={{ gap: 10 }}>
                            {upcoming.map((m) => (
                                <MatchCardCompact
                                    key={m.id}
                                    match={m}
                                    homeForm={formFor(m.homeTeam.id)}
                                    awayForm={formFor(m.awayTeam.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message={t("dashboard.emptyUpcoming")} />
                    )}

                    {settled.length > 0 && (
                        <>
                            <div style={{ height: 28 }} />
                            <SectionHead
                                title={t("dashboard.recentlySettled")}
                                chip={t("dashboard.settledCount", { count: settled.length })}
                            />
                            <div className="grid" style={{ gap: 10 }}>
                                {settled.map((m) => (
                                    <MatchCardCompact
                                        key={m.id}
                                        match={m}
                                        homeForm={formFor(m.homeTeam.id)}
                                        awayForm={formFor(m.awayTeam.id)}
                                    />
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
