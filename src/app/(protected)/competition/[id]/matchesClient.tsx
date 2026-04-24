"use client";

import { Competition, Match } from "@/app/server/modules/competitions/types";
import Image from "next/image";
import { useActionState, useState, useEffect, useCallback, useTransition } from "react";
import { MatchScoreInput } from "@/app/client/components/ui/MatchScoreInput";
import { getCompetitionMatches, saveMatchScore } from "@/app/actions/matches";
import { Chip } from "@/app/client/components/stadium/Chip";
import Form from "next/form";

interface Props {
    competition: Competition;
    matchDays: number[];
}

function formatKickoff(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function MatchesClient({ competition, matchDays }: Props) {
    const [selectedMatchDay, setSelectedMatchDay] = useState<number>(competition.activeMatchDay);
    const [matches, setMatches] = useState<Match[]>([]);
    const [pending, startTransition] = useTransition();

    const selectMatchDay = useCallback(
        (day: number) => {
            startTransition(async () => {
                const data = await getCompetitionMatches(competition.id, day);
                setSelectedMatchDay(day);
                setMatches(data ?? []);
            });
        },
        [competition.id]
    );

    useEffect(() => {
        selectMatchDay(selectedMatchDay);
    }, [selectedMatchDay, selectMatchDay]);

    return (
        <div className="w-full" style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 48px" }}>
            {/* header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4" style={{ marginBottom: 24 }}>
                <div className="flex items-center gap-4">
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: 68,
                            height: 68,
                            background: "#fff",
                            border: "1px solid #E4E1D6",
                            borderRadius: 12,
                        }}
                    >
                        <Image
                            src={competition.emblem}
                            alt={competition.name}
                            width={48}
                            height={48}
                            className="object-contain"
                            style={{ width: "auto", height: 48 }}
                        />
                    </div>
                    <div>
                        <div
                            className="uppercase"
                            style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "#4A5148" }}
                        >
                            Match prediction · {competition.code || competition.type}
                        </div>
                        <h1 className="font-display" style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, marginTop: 2 }}>
                            {competition.name}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Chip tone="brand">Matchday {selectedMatchDay}</Chip>
                    <Chip>Lock in before kickoff</Chip>
                </div>
            </div>

            {/* matchday tabs */}
            <div className="overflow-x-auto" style={{ marginBottom: 20 }}>
                <div className="inline-flex gap-1.5">
                    {matchDays.map((md) => {
                        const active = md === selectedMatchDay;
                        return (
                            <button
                                key={md}
                                type="button"
                                onClick={() => setSelectedMatchDay(md)}
                                className="uppercase"
                                style={{
                                    padding: "8px 14px",
                                    background: active ? "#0B0F0A" : "#fff",
                                    color: active ? "#fff" : "#4A5148",
                                    border: `1px solid ${active ? "#0B0F0A" : "#E4E1D6"}`,
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: 0.4,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    whiteSpace: "nowrap",
                                    transition: "all 0.15s",
                                }}
                            >
                                MD {md}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* loading state */}
            {pending && matches.length === 0 ? (
                <div className="flex justify-center" style={{ padding: "60px 0" }}>
                    <svg className="animate-spin" style={{ color: "#1E3A8A" }} width="32" height="32" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.25" />
                        <path
                            fill="currentColor"
                            opacity="0.75"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            ) : (
                <div className="grid gap-3">
                    {matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
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

    const live = match.isStarted;
    const fullTimeHome = match.score?.fullTime?.home;
    const fullTimeAway = match.score?.fullTime?.away;
    const hasResult = fullTimeHome !== null && fullTimeHome !== undefined && fullTimeAway !== null && fullTimeAway !== undefined;

    return (
        <article
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 10,
                boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(15,25,15,0.06)",
                overflow: "hidden",
            }}
        >
            {/* header */}
            <div
                className="flex justify-between items-center uppercase"
                style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #F3F1EA",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#4A5148",
                    letterSpacing: 0.5,
                }}
            >
                <span>
                    {match.competition?.name ?? match.competition?.code ?? "League"} · MD {match.matchday}
                </span>
                {live ? <Chip tone="live">Live</Chip> : <span style={{ fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>{formatKickoff(match.utcDate)}</span>}
            </div>

            {/* teams + score */}
            <div style={{ padding: "22px 20px 16px" }}>
                <div className="grid items-center" style={{ gridTemplateColumns: "1fr auto 1fr", gap: 16 }}>
                    {/* home */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 10,
                                background: "#F4F2EC",
                                border: "1px solid #E4E1D6",
                                flexShrink: 0,
                            }}
                        >
                            <Image
                                src={match.homeTeam.crest}
                                alt={match.homeTeam.name}
                                width={36}
                                height={36}
                                className="object-contain"
                                style={{ width: "auto", height: 36 }}
                            />
                        </div>
                        <div className="min-w-0">
                            <div
                                className="font-display truncate"
                                style={{ fontSize: 15, fontWeight: 700, color: "#0B0F0A" }}
                            >
                                {match.homeTeam.shortName || match.homeTeam.name}
                            </div>
                            <div className="text-ink2 uppercase" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4 }}>
                                {match.homeTeam.tla}
                            </div>
                        </div>
                    </div>

                    {/* score */}
                    <div className="flex flex-col items-center">
                        {hasResult ? (
                            <div className="flex items-center gap-2 font-display" style={{ fontSize: 28, fontWeight: 700 }}>
                                <span style={{ color: "#0B0F0A" }}>{fullTimeHome}</span>
                                <span className="text-ink2">–</span>
                                <span style={{ color: "#0B0F0A" }}>{fullTimeAway}</span>
                            </div>
                        ) : (
                            <MatchScoreInput
                                homeScore={homeScore}
                                awayScore={awayScore}
                                onHomeScoreChange={setHomeScore}
                                onAwayScoreChange={setAwayScore}
                                disabled={!isEditing || live}
                            />
                        )}
                    </div>

                    {/* away */}
                    <div className="flex items-center gap-3 justify-end min-w-0">
                        <div className="min-w-0 text-right">
                            <div className="font-display truncate" style={{ fontSize: 15, fontWeight: 700, color: "#0B0F0A" }}>
                                {match.awayTeam.shortName || match.awayTeam.name}
                            </div>
                            <div className="text-ink2 uppercase" style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.4 }}>
                                {match.awayTeam.tla}
                            </div>
                        </div>
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 10,
                                background: "#F4F2EC",
                                border: "1px solid #E4E1D6",
                                flexShrink: 0,
                            }}
                        >
                            <Image
                                src={match.awayTeam.crest}
                                alt={match.awayTeam.name}
                                width={36}
                                height={36}
                                className="object-contain"
                                style={{ width: "auto", height: 36 }}
                            />
                        </div>
                    </div>
                </div>

                {/* status + action */}
                <div className="flex flex-wrap items-center justify-between gap-2" style={{ marginTop: 16 }}>
                    {isPredicted && !isEditing && !live && !hasResult && (
                        <span
                            className="inline-flex items-center"
                            style={{
                                padding: "5px 10px",
                                background: "#E0E7FF",
                                color: "#1E3A8A",
                                fontSize: 11,
                                fontWeight: 700,
                                borderRadius: 999,
                                letterSpacing: 0.3,
                            }}
                        >
                            Locked in {homeScore}–{awayScore}
                        </span>
                    )}
                    {live && (
                        <span
                            className="inline-flex items-center"
                            style={{
                                padding: "5px 10px",
                                background: "#FFFBEB",
                                color: "#92400E",
                                fontSize: 11,
                                fontWeight: 600,
                                borderRadius: 999,
                            }}
                        >
                            Your pick: {homeScore}–{awayScore} · result pending
                        </span>
                    )}
                    {!live && !hasResult && !isPredicted && !isEditing && <span />}
                    {!live && !hasResult && !isPredicted && isEditing && <span />}

                    <div style={{ marginLeft: "auto" }}>
                        {!live && !hasResult && (
                            <>
                                {isEditing ? (
                                    <Form action={action} className="inline-flex">
                                        <input type="hidden" name="competitionId" value={match.competition.id} />
                                        <input type="hidden" name="matchId" value={match.id} />
                                        <input type="hidden" name="homeScore" value={homeScore} />
                                        <input type="hidden" name="awayScore" value={awayScore} />
                                        <input type="hidden" name="matchDay" value={match.matchday} />
                                        <button
                                            type="submit"
                                            disabled={pending}
                                            className="uppercase"
                                            style={{
                                                padding: "8px 16px",
                                                background: pending ? "#4A5148" : "#9D0010",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: 6,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                letterSpacing: 0.4,
                                                cursor: pending ? "not-allowed" : "pointer",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            {pending ? "Saving…" : isPredicted ? "Update pick" : "Lock in pick"}
                                        </button>
                                    </Form>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="uppercase"
                                        style={{
                                            padding: "8px 16px",
                                            background: "transparent",
                                            color: "#9D0010",
                                            border: "1.5px solid #9D0010",
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 700,
                                            letterSpacing: 0.4,
                                            cursor: "pointer",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        Edit pick
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {showMessage && state?.message && (
                    <div
                        style={{
                            marginTop: 12,
                            padding: "8px 12px",
                            borderRadius: 6,
                            fontSize: 12,
                            border: `1px solid ${state.success ? "#86EFAC" : "#FCA5A5"}`,
                            background: state.success ? "#F0FDF4" : "#FEF2F2",
                            color: state.success ? "#166534" : "#991B1B",
                        }}
                    >
                        {state.message}
                    </div>
                )}
            </div>
        </article>
    );
}
