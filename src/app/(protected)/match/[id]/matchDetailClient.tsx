"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Match } from "@/app/server/modules/competitions/types";
import type { TeamFormResult } from "@/app/server/services/auth/CompetitionsService";
import type { CrowdBucket } from "@/app/server/services/auth/CrowdService";
import { Chip } from "@/app/client/components/stadium/Chip";
import { Stepper } from "@/app/client/components/stadium/Stepper";
import { FormRibbon, type FormResult } from "@/app/client/components/stadium/FormRibbon";
import { CrowdBars } from "@/app/client/components/stadium/CrowdBars";
import { SectionHead } from "@/app/client/components/stadium/SectionHead";
import { saveMatchScore } from "@/app/actions/matches";
import { SCORING_RULES as RULES } from "@/app/server/services/ScoringService";

interface MatchDetailClientProps {
    match: Match;
    season: number;
    homeForm: TeamFormResult[];
    awayForm: TeamFormResult[];
    crowd: CrowdBucket[];
    h2h: Match[];
}

function computeWDL(form: TeamFormResult[]): { w: number; d: number; l: number } {
    return form.reduce(
        (acc, f) => {
            if (f.result === "W") acc.w++;
            else if (f.result === "D") acc.d++;
            else acc.l++;
            return acc;
        },
        { w: 0, d: 0, l: 0 },
    );
}

function formatKickoff(utcDate: string, status: string): string {
    if (status === "FINISHED") return "Finished";
    const d = new Date(utcDate);
    return d.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

function outcomeLabel(h: number, a: number, homeName: string, awayName: string): string {
    if (h > a) return `${homeName} win`;
    if (h < a) return `${awayName} win`;
    return "Draw";
}

export default function MatchDetailClient({ match, season, homeForm, awayForm, crowd, h2h }: MatchDetailClientProps) {
    const initialH = match.predictedScore?.isPredicted ? match.predictedScore.home : 1;
    const initialA = match.predictedScore?.isPredicted ? match.predictedScore.away : 1;
    const [h, setH] = useState(initialH);
    const [a, setA] = useState(initialA);

    const locked = match.status !== "SCHEDULED" && match.status !== "TIMED";

    const [state, formAction, pending] = useActionState(saveMatchScore, undefined);

    const homeWDL = computeWDL(homeForm);
    const awayWDL = computeWDL(awayForm);
    const homeResults: FormResult[] = homeForm.map((f) => f.result);
    const awayResults: FormResult[] = awayForm.map((f) => f.result);

    return (
        <div style={{ background: "#F4F2EC", minHeight: "calc(100vh - 56px)" }}>
            <div
                style={{
                    padding: "14px 24px",
                    borderBottom: "1px solid #E4E1D6",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <Link
                    href="/dashboard"
                    className="uppercase"
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#4A5148",
                        letterSpacing: 0.4,
                        textDecoration: "none",
                    }}
                >
                    ← Back
                </Link>
                <div style={{ flex: 1 }} />
                <Chip>{match.competition.name}</Chip>
                <Chip>MD {match.matchday}</Chip>
                {match.status === "IN_PLAY" || match.status === "LIVE" || match.status === "PAUSED" ? (
                    <Chip tone="live">Live</Chip>
                ) : match.status === "FINISHED" ? (
                    <Chip tone="final">Final</Chip>
                ) : null}
            </div>

            {/* HERO */}
            <div style={{ padding: "40px 24px 28px", textAlign: "center" }}>
                <div
                    className="uppercase"
                    style={{
                        fontSize: 11,
                        color: "#4A5148",
                        fontWeight: 600,
                        letterSpacing: 0.6,
                    }}
                >
                    {formatKickoff(match.utcDate, match.status)}
                </div>
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: 32,
                        maxWidth: 640,
                        margin: "24px auto 0",
                    }}
                >
                    <TeamHero team={match.homeTeam} wdl={homeWDL} form={homeResults} />
                    {match.status === "FINISHED" && match.score.fullTime.home !== null ? (
                        <div
                            className="font-display"
                            style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, color: "#0B0F0A" }}
                        >
                            {match.score.fullTime.home}–{match.score.fullTime.away}
                        </div>
                    ) : (
                        <div
                            className="font-display uppercase"
                            style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#4A5148",
                                letterSpacing: 2,
                            }}
                        >
                            VS
                        </div>
                    )}
                    <TeamHero team={match.awayTeam} wdl={awayWDL} form={awayResults} reverse />
                </div>
            </div>

            <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px 40px" }}>
                {/* Score picker */}
                <div
                    style={{
                        background: "#fff",
                        border: "1px solid #E4E1D6",
                        borderRadius: 10,
                        padding: 24,
                        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(15,25,15,0.06)",
                    }}
                >
                    <div
                        className="uppercase"
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            color: "#4A5148",
                            marginBottom: 16,
                            textAlign: "center",
                        }}
                    >
                        Your prediction
                    </div>

                    <div
                        className="grid"
                        style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}
                    >
                        <Stepper
                            value={h}
                            onChange={setH}
                            label={match.homeTeam.tla || match.homeTeam.name || "Home"}
                            disabled={locked}
                        />
                        <Stepper
                            value={a}
                            onChange={setA}
                            label={match.awayTeam.tla || match.awayTeam.name || "Away"}
                            disabled={locked}
                        />
                    </div>

                    {!locked && (
                        <div
                            className="flex items-center justify-between"
                            style={{
                                marginTop: 20,
                                padding: "12px 14px",
                                background: "#F4F2EC",
                                borderRadius: 6,
                            }}
                        >
                            <div>
                                <div
                                    className="uppercase"
                                    style={{
                                        fontSize: 10,
                                        color: "#4A5148",
                                        fontWeight: 600,
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    If this holds
                                </div>
                                <div style={{ fontSize: 13, marginTop: 2 }}>
                                    {h}–{a} {outcomeLabel(h, a, match.homeTeam.name ?? "Home", match.awayTeam.name ?? "Away")}
                                </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div
                                    className="font-display"
                                    style={{ fontSize: 22, fontWeight: 700, color: "#1E3A8A" }}
                                >
                                    +{RULES.exact} pts
                                </div>
                                <div style={{ fontSize: 10, color: "#4A5148" }}>max possible</div>
                            </div>
                        </div>
                    )}

                    {!locked && (
                        <form action={formAction} style={{ marginTop: 20 }}>
                            <input type="hidden" name="competitionId" value={match.competition.id} />
                            <input type="hidden" name="matchId" value={match.id} />
                            <input type="hidden" name="matchDay" value={match.matchday} />
                            <input type="hidden" name="homeScore" value={h} />
                            <input type="hidden" name="awayScore" value={a} />
                            <button
                                type="submit"
                                disabled={pending}
                                className="uppercase"
                                style={{
                                    width: "100%",
                                    padding: "14px",
                                    background: pending ? "#4A5148" : "#9D0010",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    fontFamily: "inherit",
                                    fontSize: 13,
                                    fontWeight: 700,
                                    letterSpacing: 0.4,
                                    cursor: pending ? "not-allowed" : "pointer",
                                }}
                            >
                                {pending
                                    ? "Saving…"
                                    : match.predictedScore?.isPredicted
                                      ? `Update pick · ${h}–${a}`
                                      : `Lock in ${h}–${a}`}
                            </button>
                            {state?.message && (
                                <div
                                    style={{
                                        marginTop: 10,
                                        fontSize: 12,
                                        color: state.success ? "#166534" : "#991B1B",
                                        textAlign: "center",
                                    }}
                                >
                                    {state.message}
                                </div>
                            )}
                        </form>
                    )}

                    {locked && match.predictedScore?.isPredicted && (
                        <div
                            style={{
                                marginTop: 16,
                                padding: "12px 14px",
                                background: "#F4F2EC",
                                borderRadius: 6,
                                textAlign: "center",
                                fontSize: 12,
                                color: "#4A5148",
                            }}
                        >
                            Your locked-in pick: {match.predictedScore.home}–{match.predictedScore.away}
                        </div>
                    )}
                </div>

                {/* Crowd */}
                <div
                    style={{
                        marginTop: 16,
                        background: "#fff",
                        border: "1px solid #E4E1D6",
                        padding: 20,
                        borderRadius: 10,
                    }}
                >
                    <div
                        className="uppercase"
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            color: "#4A5148",
                            marginBottom: 12,
                        }}
                    >
                        What the crowd picked
                    </div>
                    <CrowdBars buckets={crowd} />
                </div>

                {/* The Tape: Form + H2H */}
                <div style={{ marginTop: 24 }}>
                    <SectionHead title="The Tape" chip="Form · H2H" />
                    <div
                        className="grid"
                        style={{
                            gridTemplateColumns: "1fr 1fr",
                            gap: 12,
                        }}
                    >
                        <FormTile team={match.homeTeam} form={homeForm} />
                        <FormTile team={match.awayTeam} form={awayForm} />
                    </div>
                    <div style={{ marginTop: 12 }}>
                        <H2HTile homeTeam={match.homeTeam} awayTeam={match.awayTeam} h2h={h2h} />
                    </div>
                </div>

                <div style={{ marginTop: 24, fontSize: 11, color: "#4A5148", textAlign: "center" }}>
                    Season {season} · Competition {match.competition.id}
                </div>
            </div>
        </div>
    );
}

function TeamHero({
    team,
    wdl,
    form,
    reverse = false,
}: {
    team: Match["homeTeam"];
    wdl: { w: number; d: number; l: number };
    form: FormResult[];
    reverse?: boolean;
}) {
    return (
        <div
            className="flex flex-col items-center"
            style={{ gap: 12, order: reverse ? 1 : 0 }}
        >
            <div
                style={{
                    width: 68,
                    height: 68,
                    background: "#F4F2EC",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #E4E1D6",
                }}
            >
                {team.crest ? (
                    <Image src={team.crest} alt={team.name ?? "Team"} width={48} height={48} style={{ objectFit: "contain" }} />
                ) : (
                    <span className="font-display" style={{ fontSize: 24, fontWeight: 800 }}>
                        {(team.tla || team.name || "?").slice(0, 2)}
                    </span>
                )}
            </div>
            <div
                className="font-display"
                style={{ fontSize: 20, fontWeight: 700, textAlign: "center" }}
            >
                {team.name}
            </div>
            <div style={{ fontSize: 11, color: "#4A5148" }}>
                W {wdl.w} · D {wdl.d} · L {wdl.l}
            </div>
            <FormRibbon results={form} />
        </div>
    );
}

function FormTile({ team, form }: { team: Match["homeTeam"]; form: TeamFormResult[] }) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 8,
                padding: 16,
            }}
        >
            <div
                className="uppercase"
                style={{ fontSize: 10, color: "#4A5148", fontWeight: 700, letterSpacing: 0.5 }}
            >
                Last 5 · {team.name}
            </div>
            {form.length === 0 ? (
                <div style={{ fontSize: 12, color: "#4A5148", marginTop: 10 }}>
                    No recent results yet this season.
                </div>
            ) : (
                <div style={{ marginTop: 10 }}>
                    {form.map((f) => (
                        <div
                            key={f.matchId}
                            className="flex items-center justify-between"
                            style={{
                                padding: "6px 0",
                                borderTop: "1px solid #F4F2EC",
                                fontSize: 12,
                            }}
                        >
                            <span style={{ color: "#4A5148" }}>{f.isHome ? "vs" : "@"} {f.opponent}</span>
                            <span className="flex items-center" style={{ gap: 8 }}>
                                <span className="font-display" style={{ fontWeight: 700 }}>
                                    {f.scored}–{f.conceded}
                                </span>
                                <span
                                    className="font-display uppercase"
                                    style={{
                                        width: 18,
                                        height: 18,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: 3,
                                        fontSize: 9,
                                        fontWeight: 700,
                                        color:
                                            f.result === "W" ? "#166534" : f.result === "L" ? "#991B1B" : "#4A5148",
                                        background:
                                            f.result === "W" ? "#DCFCE7" : f.result === "L" ? "#FEE2E2" : "#E4E1D6",
                                    }}
                                >
                                    {f.result}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function H2HTile({
    homeTeam,
    awayTeam,
    h2h,
}: {
    homeTeam: Match["homeTeam"];
    awayTeam: Match["awayTeam"];
    h2h: Match[];
}) {
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 8,
                padding: 16,
            }}
        >
            <div
                className="uppercase"
                style={{ fontSize: 10, color: "#4A5148", fontWeight: 700, letterSpacing: 0.5 }}
            >
                Head-to-head (this season)
            </div>
            {h2h.length === 0 ? (
                <div style={{ fontSize: 12, color: "#4A5148", marginTop: 10 }}>
                    No previous meetings in the current season.
                </div>
            ) : (
                <div style={{ marginTop: 10 }}>
                    {h2h.map((m) => (
                        <div
                            key={m.id}
                            className="flex items-center justify-between"
                            style={{
                                padding: "6px 0",
                                borderTop: "1px solid #F4F2EC",
                                fontSize: 12,
                            }}
                        >
                            <span style={{ color: "#4A5148" }}>
                                {m.homeTeam.id === homeTeam.id ? homeTeam.name : awayTeam.name}
                                {" vs "}
                                {m.awayTeam.id === homeTeam.id ? homeTeam.name : awayTeam.name}
                            </span>
                            <span className="font-display" style={{ fontWeight: 700 }}>
                                {m.score.fullTime.home}–{m.score.fullTime.away}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
