"use client";

import Link from "next/link";
import Image from "next/image";
import Form from "next/form";
import { useActionState, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Match } from "@/app/server/modules/competitions/types";
import type { TeamFormResult } from "@/app/server/services/auth/CompetitionsService";
import { Chip } from "./Chip";
import { FormDots } from "./FormDots";
import { CompactScoreInput } from "@/app/client/components/ui/CompactScoreInput";
import { calculatePoints } from "@/app/server/services/ScoringService";
import { saveMatchScore } from "@/app/actions/matches";
import { stageLabel } from "@/app/client/lib/stageLabel";

type Mode = "view" | "predict";

interface Props {
    match: Match;
    homeForm: TeamFormResult[];
    awayForm: TeamFormResult[];
    mode?: Mode;
}

function isLive(match: Match): boolean {
    return (
        match.status === "IN_PLAY" ||
        match.status === "LIVE" ||
        match.status === "PAUSED"
    );
}

function isFinished(match: Match): boolean {
    return match.status === "FINISHED";
}

function useFormatKickoff() {
    const locale = useLocale();
    return (utcDate: string) => {
        const d = new Date(utcDate);
        const weekday = d.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-GB", {
            weekday: "short",
        });
        const time = d.toLocaleTimeString(locale === "ru" ? "ru-RU" : "en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        return `${weekday} · ${time}`;
    };
}

function useRoundLabel(): (match: Match) => string {
    const t = useTranslations();
    return (match: Match) => {
        if (match.matchday && match.matchday > 0) {
            return t("competition.mdLabel", { md: match.matchday });
        }
        const stage = match.stage;
        if (!stage || stage === "REGULAR_SEASON" || stage === "GROUP_STAGE") {
            return "";
        }
        return stageLabel(t, stage);
    };
}

function TeamRow({
    name,
    tla,
    crest,
    form,
    align,
}: {
    name: string;
    tla: string;
    crest: string;
    form: TeamFormResult[];
    align: "left" | "right";
}) {
    const isRight = align === "right";
    const crestNode = (
        <div
            className="flex items-center justify-center"
            style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#F4F2EC",
                border: "1px solid #E4E1D6",
                flexShrink: 0,
            }}
        >
            {crest ? (
                <Image
                    src={crest}
                    alt={name}
                    width={28}
                    height={28}
                    style={{ width: "auto", height: 28, objectFit: "contain" }}
                />
            ) : (
                <span
                    className="font-display"
                    style={{ fontSize: 11, fontWeight: 800, color: "#0B0F0A" }}
                >
                    {(tla || name || "?").slice(0, 3).toUpperCase()}
                </span>
            )}
        </div>
    );

    const textNode = (
        <div className="min-w-0" style={{ textAlign: isRight ? "right" : "left" }}>
            <div
                className="font-display truncate"
                style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0B0F0A",
                    lineHeight: 1.2,
                }}
                title={name}
            >
                {name}
            </div>
            <div style={{ marginTop: 4 }}>
                <FormDots form={form} teamName={name} align={isRight ? "end" : "start"} />
            </div>
        </div>
    );

    return (
        <div
            className="flex items-center min-w-0"
            style={{
                gap: 10,
                justifyContent: isRight ? "flex-end" : "flex-start",
            }}
        >
            {isRight ? (
                <>
                    {textNode}
                    {crestNode}
                </>
            ) : (
                <>
                    {crestNode}
                    {textNode}
                </>
            )}
        </div>
    );
}

export function MatchCardCompact({ match, homeForm, awayForm, mode = "view" }: Props) {
    const t = useTranslations();
    const formatKickoff = useFormatKickoff();
    const roundLabel = useRoundLabel();
    const live = isLive(match);
    const finished = isFinished(match);

    const ftHome = match.score.fullTime.home;
    const ftAway = match.score.fullTime.away;
    const hasResult = ftHome !== null && ftAway !== null;

    const [homeScore, setHomeScore] = useState<number>(match.predictedScore?.home ?? 0);
    const [awayScore, setAwayScore] = useState<number>(match.predictedScore?.away ?? 0);
    const [isPredicted, setIsPredicted] = useState<boolean>(
        match.predictedScore?.isPredicted ?? false,
    );
    const [isEditing, setIsEditing] = useState<boolean>(
        !match.predictedScore?.isPredicted,
    );
    const [state, action, pending] = useActionState(saveMatchScore, undefined);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        if (!state?.message) return;
        setShowMessage(true);
        if (state.success) {
            setIsPredicted(true);
            setIsEditing(false);
        }
        const timer = setTimeout(() => setShowMessage(false), 3000);
        return () => clearTimeout(timer);
    }, [state]);

    const headerRight = (() => {
        if (live) return <Chip tone="live">{t("match.live")}</Chip>;
        if (finished) return <Chip tone="final">{t("match.final")}</Chip>;
        return (
            <span style={{ fontWeight: 500, fontSize: 10, color: "#4A5148" }}>
                {formatKickoff(match.utcDate)}
            </span>
        );
    })();

    const center = (() => {
        if (hasResult) {
            return (
                <div
                    className="font-display flex items-center"
                    style={{ gap: 8, fontSize: 24, fontWeight: 700, color: "#0B0F0A" }}
                >
                    <span>{ftHome}</span>
                    <span style={{ color: "#4A5148" }}>–</span>
                    <span>{ftAway}</span>
                </div>
            );
        }
        if (mode === "predict" && !finished) {
            return (
                <CompactScoreInput
                    homeScore={homeScore}
                    awayScore={awayScore}
                    onHomeScoreChange={setHomeScore}
                    onAwayScoreChange={setAwayScore}
                    disabled={!isEditing || live}
                />
            );
        }
        return (
            <div
                className="font-display"
                style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#4A5148",
                    letterSpacing: 2,
                }}
            >
                {t("common.vs").toUpperCase()}
            </div>
        );
    })();

    const round = roundLabel(match);

    const footer = (() => {
        if (mode === "view") {
            if (finished && match.predictedScore?.isPredicted) {
                const pts = calculatePoints(
                    { home: match.predictedScore.home, away: match.predictedScore.away },
                    { home: ftHome ?? 0, away: ftAway ?? 0 },
                );
                const positive = pts > 0;
                return (
                    <div
                        className="flex items-center justify-between"
                        style={{
                            marginTop: 10,
                            padding: "8px 10px",
                            background: positive ? "#E0E7FF" : "#FEE2E2",
                            borderRadius: 6,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: positive ? "#1E3A8A" : "#991B1B",
                            }}
                        >
                            {t("match.yourPick", {
                                home: match.predictedScore.home,
                                away: match.predictedScore.away,
                            })}
                        </span>
                        <span
                            className="font-display"
                            style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: positive ? "#1E3A8A" : "#991B1B",
                            }}
                        >
                            {positive
                                ? t("match.predictionPoints", { pts })
                                : t("match.noPts")}
                        </span>
                    </div>
                );
            }
            if (live && match.predictedScore?.isPredicted) {
                return (
                    <div
                        className="flex items-center justify-between"
                        style={{
                            marginTop: 10,
                            padding: "8px 10px",
                            background: "#FFFBEB",
                            borderRadius: 6,
                        }}
                    >
                        <span
                            style={{ fontSize: 11, color: "#92400E", fontWeight: 600 }}
                        >
                            {t("match.yourPick", {
                                home: match.predictedScore.home,
                                away: match.predictedScore.away,
                            })}
                        </span>
                        <span style={{ fontSize: 11, color: "#92400E" }}>
                            {t("match.liveResultPending")}
                        </span>
                    </div>
                );
            }
            if (!finished) {
                const hasPick = !!match.predictedScore?.isPredicted;
                return (
                    <div
                        className="flex justify-end"
                        style={{ marginTop: 10 }}
                    >
                        <Link
                            href={`/match/${match.id}`}
                            className="uppercase"
                            style={{
                                padding: "6px 12px",
                                color: hasPick ? "#1E3A8A" : "#9D0010",
                                background: "transparent",
                                border: `1px solid ${hasPick ? "#1E3A8A" : "#9D0010"}`,
                                borderRadius: 4,
                                fontSize: 10.5,
                                fontWeight: 700,
                                letterSpacing: 0.4,
                                textDecoration: "none",
                            }}
                        >
                            {hasPick
                                ? t("match.updatePickShort", {
                                      home: match.predictedScore!.home,
                                      away: match.predictedScore!.away,
                                  })
                                : t("action.lockInPick")}
                        </Link>
                    </div>
                );
            }
            return null;
        }

        // mode === "predict"
        if (finished) return null;

        return (
            <div
                className="flex flex-wrap items-center justify-between"
                style={{ marginTop: 12, gap: 8 }}
            >
                <div className="flex items-center" style={{ gap: 8, minHeight: 26 }}>
                    {isPredicted && !isEditing && !live && (
                        <Chip tone="brand">
                            {t("match.lockedInBadge", {
                                home: homeScore,
                                away: awayScore,
                            })}
                        </Chip>
                    )}
                    {live && (
                        <Chip tone="live">
                            {t("match.pickPending", {
                                home: homeScore,
                                away: awayScore,
                            })}
                        </Chip>
                    )}
                    {showMessage && state?.message && (
                        <span
                            style={{
                                fontSize: 11,
                                color: state.success ? "#166534" : "#991B1B",
                            }}
                        >
                            {state.message}
                        </span>
                    )}
                </div>

                <div style={{ marginLeft: "auto" }}>
                    {!live &&
                        (isEditing ? (
                            <Form action={action} className="inline-flex">
                                <input
                                    type="hidden"
                                    name="competitionId"
                                    value={match.competition.id}
                                />
                                <input type="hidden" name="matchId" value={match.id} />
                                <input
                                    type="hidden"
                                    name="homeScore"
                                    value={homeScore}
                                />
                                <input
                                    type="hidden"
                                    name="awayScore"
                                    value={awayScore}
                                />
                                <input
                                    type="hidden"
                                    name="matchDay"
                                    value={match.matchday}
                                />
                                <button
                                    type="submit"
                                    disabled={pending}
                                    className="uppercase"
                                    style={{
                                        padding: "7px 14px",
                                        background: pending ? "#4A5148" : "#9D0010",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 5,
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        letterSpacing: 0.4,
                                        cursor: pending ? "not-allowed" : "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    {pending
                                        ? t("action.saving")
                                        : isPredicted
                                          ? t("action.updatePick")
                                          : t("action.lockInPick")}
                                </button>
                            </Form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="uppercase"
                                style={{
                                    padding: "7px 14px",
                                    background: "transparent",
                                    color: "#9D0010",
                                    border: "1.5px solid #9D0010",
                                    borderRadius: 5,
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    letterSpacing: 0.4,
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                }}
                            >
                                {t("action.editPick")}
                            </button>
                        ))}
                </div>
            </div>
        );
    })();

    return (
        <article
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 10,
                boxShadow:
                    "0 1px 0 rgba(0,0,0,0.04), 0 6px 18px rgba(15,25,15,0.05)",
                overflow: "hidden",
            }}
        >
            <div
                className="uppercase flex items-center justify-between"
                style={{
                    padding: "9px 14px",
                    borderBottom: "1px solid #F3F1EA",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#4A5148",
                    letterSpacing: 0.5,
                }}
            >
                <span className="truncate">
                    <Link
                        href={`/match/${match.id}`}
                        style={{
                            color: "#4A5148",
                            textDecoration: "none",
                        }}
                    >
                        {match.competition?.name ?? match.competition?.code ?? ""}
                        {round ? ` · ${round}` : ""}
                    </Link>
                </span>
                {headerRight}
            </div>

            <div style={{ padding: "14px 14px 12px" }}>
                <div
                    className="grid items-center"
                    style={{ gridTemplateColumns: "1fr auto 1fr", gap: 14 }}
                >
                    <TeamRow
                        name={match.homeTeam.shortName || match.homeTeam.name}
                        tla={match.homeTeam.tla}
                        crest={match.homeTeam.crest}
                        form={homeForm}
                        align="left"
                    />
                    <div className="flex items-center justify-center">{center}</div>
                    <TeamRow
                        name={match.awayTeam.shortName || match.awayTeam.name}
                        tla={match.awayTeam.tla}
                        crest={match.awayTeam.crest}
                        form={awayForm}
                        align="right"
                    />
                </div>
                {footer}
            </div>
        </article>
    );
}
