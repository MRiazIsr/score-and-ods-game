"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Competition, Match } from "@/app/server/modules/competitions/types";
import { SectionHead } from "@/app/client/components/stadium/SectionHead";
import { SportToggle, type Sport } from "@/app/client/components/stadium/SportToggle";
import { LeaguesSidebar } from "@/app/client/components/stadium/LeaguesSidebar";

export interface LeagueSummary {
    competition: Competition;
    season: number;
    fixturesCount: number;
    userPoints: number;
    nextFixtures: Match[];
}

interface LeaguesClientProps {
    leagues: LeagueSummary[];
}

const TABS = ["All", "Football", "Hockey", "Cups & Tournaments", "Private"] as const;
type Tab = (typeof TABS)[number];

function formatKickoff(utcDate: string): string {
    const d = new Date(utcDate);
    return d.toLocaleDateString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function LeaguesClient({ leagues }: LeaguesClientProps) {
    const [sport, setSport] = useState<Sport>("football");
    const [tab, setTab] = useState<Tab>("All");
    const [activeId, setActiveId] = useState<number | null>(leagues[0]?.competition.id ?? null);

    const filtered = leagues.filter((l) => {
        if (tab === "All" || tab === "Football") return true;
        if (tab === "Cups & Tournaments") return l.competition.type === "CUP";
        return false;
    });

    const active = filtered.find((l) => l.competition.id === activeId) ?? filtered[0] ?? null;

    return (
        <div style={{ background: "#F4F2EC", minHeight: "calc(100vh - 56px)" }}>
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "24px 24px 0",
                }}
            >
                <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                    <SportToggle value={sport} onChange={setSport} />
                    <Link
                        href="/dashboard"
                        className="uppercase"
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.4,
                            color: "#4A5148",
                            textDecoration: "none",
                        }}
                    >
                        ← Back to dashboard
                    </Link>
                </div>

                <div>
                    <div
                        className="uppercase"
                        style={{
                            fontSize: 10,
                            color: "#4A5148",
                            fontWeight: 700,
                            letterSpacing: 0.6,
                        }}
                    >
                        Browse
                    </div>
                    <div
                        className="font-display"
                        style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1.2, marginTop: 4 }}
                    >
                        Competitions
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            color: "#4A5148",
                            marginTop: 4,
                            maxWidth: 620,
                        }}
                    >
                        Pick a league to browse fixtures and lock in your predictions. Friend pools are coming soon.
                    </div>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: 4,
                        borderBottom: "1px solid #E4E1D6",
                        marginTop: 20,
                    }}
                >
                    {TABS.map((t) => {
                        const isActive = tab === t;
                        const disabled = t === "Hockey" || t === "Private";
                        return (
                            <button
                                key={t}
                                type="button"
                                onClick={() => !disabled && setTab(t)}
                                disabled={disabled}
                                style={{
                                    padding: "10px 14px",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: isActive ? "#0B0F0A" : disabled ? "#A1A1AA" : "#4A5148",
                                    background: "transparent",
                                    border: "none",
                                    borderBottom: `2px solid ${isActive ? "#1E3A8A" : "transparent"}`,
                                    marginBottom: -1,
                                    cursor: disabled ? "not-allowed" : "pointer",
                                    fontFamily: "inherit",
                                }}
                                title={disabled ? "Coming soon" : undefined}
                            >
                                {t}
                                {disabled && (
                                    <span
                                        className="uppercase"
                                        style={{
                                            marginLeft: 6,
                                            fontSize: 8,
                                            fontWeight: 700,
                                            letterSpacing: 0.5,
                                            padding: "1px 4px",
                                            borderRadius: 2,
                                            background: "#E4E1D6",
                                            color: "#4A5148",
                                        }}
                                    >
                                        Soon
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div
                className="grid"
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    padding: "24px",
                    gridTemplateColumns: "1fr 1.1fr",
                    gap: 20,
                    alignItems: "start",
                }}
            >
                <div>
                    <div
                        className="grid"
                        style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}
                    >
                        {filtered.map((l) => (
                            <LeagueTile
                                key={l.competition.id}
                                league={l}
                                active={l.competition.id === (active?.competition.id ?? -1)}
                                onClick={() => setActiveId(l.competition.id)}
                            />
                        ))}
                    </div>

                    <div style={{ marginTop: 20 }}>
                        <SectionHead title="Private leagues" chip="Preview" />
                        <LeaguesSidebar />
                    </div>
                </div>

                {active && <LeagueDetailPane league={active} />}
            </div>
        </div>
    );
}

function LeagueTile({
    league,
    active,
    onClick,
}: {
    league: LeagueSummary;
    active: boolean;
    onClick: () => void;
}) {
    const { competition } = league;

    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                background: active ? "#0B0F0A" : "#fff",
                color: active ? "#fff" : "#0B0F0A",
                border: `1px solid ${active ? "#0B0F0A" : "#E4E1D6"}`,
                borderRadius: 8,
                padding: "16px",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
            }}
        >
            <div className="flex items-center" style={{ gap: 10 }}>
                <div
                    style={{
                        width: 38,
                        height: 38,
                        borderRadius: 4,
                        background: "#F4F2EC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {competition.emblem ? (
                        <Image
                            src={competition.emblem}
                            alt={competition.name}
                            width={28}
                            height={28}
                            style={{ objectFit: "contain" }}
                        />
                    ) : (
                        <span className="font-display" style={{ fontWeight: 800, fontSize: 14 }}>
                            {competition.code?.slice(0, 1) ?? "?"}
                        </span>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        className="font-display"
                        style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}
                    >
                        {competition.name}
                    </div>
                    <div
                        className="uppercase"
                        style={{
                            fontSize: 10,
                            color: active ? "rgba(255,255,255,.55)" : "#4A5148",
                            marginTop: 2,
                            letterSpacing: 0.3,
                            fontWeight: 600,
                        }}
                    >
                        {competition.code || competition.type} · MD {competition.activeMatchDay ?? "—"}
                    </div>
                </div>
            </div>
            <div
                className="flex items-center justify-between"
                style={{ marginTop: 12 }}
            >
                <span
                    className="uppercase"
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: active ? "rgba(255,255,255,.65)" : "#4A5148",
                        letterSpacing: 0.4,
                    }}
                >
                    {league.fixturesCount} fixtures
                </span>
                <span
                    className="uppercase"
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: active ? "#fff" : "#1E3A8A",
                        background: active ? "rgba(255,255,255,0.12)" : "#E0E7FF",
                        padding: "3px 7px",
                        borderRadius: 3,
                        letterSpacing: 0.4,
                    }}
                >
                    Joined
                </span>
            </div>
        </button>
    );
}

function LeagueDetailPane({ league }: { league: LeagueSummary }) {
    const { competition, userPoints, fixturesCount, nextFixtures } = league;

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 8,
                padding: "20px 22px",
            }}
        >
            <div
                className="flex items-center"
                style={{
                    gap: 14,
                    paddingBottom: 16,
                    borderBottom: "1px solid #E4E1D6",
                }}
            >
                <div
                    style={{
                        width: 60,
                        height: 60,
                        borderRadius: 6,
                        background: "#F4F2EC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {competition.emblem ? (
                        <Image
                            src={competition.emblem}
                            alt={competition.name}
                            width={46}
                            height={46}
                            style={{ objectFit: "contain" }}
                        />
                    ) : (
                        <span className="font-display" style={{ fontWeight: 800, fontSize: 22 }}>
                            {competition.code?.slice(0, 1) ?? "?"}
                        </span>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <div
                        className="uppercase"
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#4A5148",
                            letterSpacing: 0.5,
                        }}
                    >
                        {competition.code || competition.type} · Matchday {competition.activeMatchDay ?? "—"}
                    </div>
                    <div
                        className="font-display"
                        style={{
                            fontSize: 24,
                            fontWeight: 800,
                            letterSpacing: -0.6,
                            marginTop: 2,
                        }}
                    >
                        {competition.name}
                    </div>
                </div>
                <Link
                    href={`/competition/${competition.id}`}
                    className="uppercase"
                    style={{
                        padding: "9px 16px",
                        background: "#1E3A8A",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.4,
                        textDecoration: "none",
                    }}
                >
                    Open →
                </Link>
            </div>

            <div
                className="grid"
                style={{
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    padding: "16px 0",
                    borderBottom: "1px solid #E4E1D6",
                }}
            >
                <Stat label="Fixtures" value={String(fixturesCount)} />
                <Stat label="Matchdays" value={String(competition.matchDays?.length ?? 0)} />
                <Stat label="Your points" value={String(userPoints)} />
            </div>

            <div style={{ padding: "16px 0 6px" }}>
                <div
                    className="uppercase"
                    style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#4A5148",
                        letterSpacing: 0.5,
                        marginBottom: 10,
                    }}
                >
                    Next fixtures · {competition.name}
                </div>
                {nextFixtures.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#4A5148", padding: "12px 0" }}>
                        No scheduled fixtures.
                    </div>
                ) : (
                    nextFixtures.map((m, i) => (
                        <Link
                            key={m.id}
                            href={`/match/${m.id}`}
                            className="flex items-center"
                            style={{
                                gap: 10,
                                padding: "10px 0",
                                borderTop: i ? "1px solid #E4E1D6" : "none",
                                textDecoration: "none",
                                color: "inherit",
                            }}
                        >
                            <div
                                className="font-display uppercase"
                                style={{
                                    fontSize: 10,
                                    color: "#4A5148",
                                    width: 76,
                                    fontWeight: 600,
                                    letterSpacing: 0.3,
                                    flexShrink: 0,
                                }}
                            >
                                {formatKickoff(m.utcDate)}
                            </div>
                            <div className="flex items-center" style={{ gap: 8, flex: 1, minWidth: 0 }}>
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {m.homeTeam.name}
                                </span>
                                <span style={{ fontSize: 10, color: "#4A5148" }}>vs</span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {m.awayTeam.name}
                                </span>
                            </div>
                            {m.predictedScore?.isPredicted ? (
                                <span
                                    className="font-display uppercase"
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#1E3A8A",
                                        background: "#E0E7FF",
                                        padding: "3px 7px",
                                        borderRadius: 3,
                                        letterSpacing: 0.3,
                                    }}
                                >
                                    {m.predictedScore.home}–{m.predictedScore.away}
                                </span>
                            ) : (
                                <span
                                    className="uppercase"
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        color: "#4A5148",
                                        letterSpacing: 0.3,
                                    }}
                                >
                                    Open
                                </span>
                            )}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div
                className="uppercase"
                style={{ fontSize: 9, fontWeight: 700, color: "#4A5148", letterSpacing: 0.5 }}
            >
                {label}
            </div>
            <div
                className="font-display"
                style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.6, marginTop: 2 }}
            >
                {value}
            </div>
        </div>
    );
}
