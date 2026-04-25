"use client";

import { Competition, Match, MatchdayTab, tabKey } from "@/app/server/modules/competitions/types";
import Image from "next/image";
import { useState, useEffect, useCallback, useTransition, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { getCompetitionMatches } from "@/app/actions/matches";
import { Chip } from "@/app/client/components/stadium/Chip";
import { MatchCardCompact } from "@/app/client/components/stadium/MatchCardCompact";
import { stageLabel } from "@/app/client/lib/stageLabel";
import type { TeamFormResult } from "@/app/server/services/auth/CompetitionsService";

interface Props {
    competition: Competition;
    matchTabs: MatchdayTab[];
}

function defaultTab(tabs: MatchdayTab[], activeMatchDay: number): MatchdayTab | null {
    const md = tabs.find(
        (t) => t.kind === "matchday" && t.matchday === activeMatchDay,
    );
    if (md) return md;
    return tabs[0] ?? null;
}

export default function MatchesClient({ competition, matchTabs }: Props) {
    const t = useTranslations();
    const [selectedTab, setSelectedTab] = useState<MatchdayTab | null>(() =>
        defaultTab(matchTabs, competition.activeMatchDay),
    );
    const [matches, setMatches] = useState<Match[]>([]);
    const [formByTeam, setFormByTeam] = useState<Record<number, TeamFormResult[]>>({});
    const [pending, startTransition] = useTransition();

    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef<HTMLButtonElement>(null);
    const initialCenterDone = useRef(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const selectTab = useCallback(
        (tab: MatchdayTab) => {
            startTransition(async () => {
                const data = await getCompetitionMatches(competition.id, tab);
                setSelectedTab(tab);
                setMatches(data?.matches ?? []);
                setFormByTeam(data?.formByTeam ?? {});
            });
        },
        [competition.id],
    );

    useEffect(() => {
        if (selectedTab) selectTab(selectedTab);
        // We only run this on mount and when the tabs list semantically changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const el = tabsContainerRef.current;
        if (!el) return;
        const update = () => {
            setCanScrollLeft(el.scrollLeft > 2);
            setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
        };
        update();
        el.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            el.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [matchTabs.length]);

    useEffect(() => {
        if (!selectedTab) return;
        const isActive =
            selectedTab.kind === "matchday" &&
            selectedTab.matchday === competition.activeMatchDay;
        if (!isActive) return;
        const container = tabsContainerRef.current;
        const target = activeTabRef.current;
        if (!container || !target) return;
        const left =
            target.offsetLeft - (container.clientWidth / 2 - target.clientWidth / 2);
        container.scrollTo({
            left: Math.max(0, left),
            behavior: initialCenterDone.current ? "smooth" : "instant",
        });
        initialCenterDone.current = true;
    }, [selectedTab, competition.activeMatchDay]);

    const scrollTabs = (direction: -1 | 1) => {
        const el = tabsContainerRef.current;
        if (!el) return;
        el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
    };

    const onActiveBack = () => {
        const md = matchTabs.find(
            (x) => x.kind === "matchday" && x.matchday === competition.activeMatchDay,
        );
        if (md) selectTab(md);
    };

    const tabsToRender = matchTabs;
    const selectedKey = selectedTab ? tabKey(selectedTab) : null;
    const activeKey = `md:${competition.activeMatchDay}`;

    const headerChip = useMemo(() => {
        if (!selectedTab) return null;
        if (selectedTab.kind === "matchday") {
            return t("competition.matchday", { matchday: selectedTab.matchday });
        }
        return stageLabel(t, selectedTab.stage);
    }, [selectedTab, t]);

    return (
        <div
            className="w-full"
            style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 48px" }}
        >
            <div
                className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
                style={{ marginBottom: 24 }}
            >
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
                            style={{
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: 0.6,
                                color: "#4A5148",
                            }}
                        >
                            {t("competition.matchPredictionLabel", {
                                code: competition.code || competition.type,
                            })}
                        </div>
                        <h1
                            className="font-display"
                            style={{
                                fontSize: 32,
                                fontWeight: 700,
                                letterSpacing: -0.8,
                                marginTop: 2,
                            }}
                        >
                            {competition.name}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {headerChip && <Chip tone="brand">{headerChip}</Chip>}
                    <Chip>{t("competition.lockInReminder")}</Chip>
                    {selectedKey !== activeKey && (
                        <button
                            type="button"
                            onClick={onActiveBack}
                            className="inline-flex items-center gap-1 font-sans uppercase"
                            style={{
                                padding: "2px 7px",
                                borderRadius: 3,
                                background: "transparent",
                                border: "1px solid #9D0010",
                                color: "#9D0010",
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: 0.6,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                lineHeight: 1.4,
                            }}
                        >
                            <span aria-hidden="true" style={{ fontSize: 11, lineHeight: 1 }}>
                                ←
                            </span>
                            {t("competition.backToMD", { md: competition.activeMatchDay })}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: 20 }}>
                <div style={{ position: "relative" }}>
                    <div
                        ref={tabsContainerRef}
                        className="md-tabs-scroll"
                        style={{
                            display: "flex",
                            gap: 6,
                            overflowX: "auto",
                            padding: "4px 2px",
                        }}
                    >
                        {tabsToRender.map((tab) => {
                            const key = tabKey(tab);
                            const isSelected = key === selectedKey;
                            const isCurrent = key === activeKey;
                            const isPlayed =
                                tab.kind === "matchday" &&
                                tab.matchday < competition.activeMatchDay;

                            let bg: string;
                            let color: string;
                            let borderColor: string;
                            if (isSelected) {
                                bg = "#1E3A8A";
                                color = "#fff";
                                borderColor = "#1E3A8A";
                            } else if (isPlayed) {
                                bg = "#E4E1D6";
                                color = "#4A5148";
                                borderColor = "transparent";
                            } else if (isCurrent) {
                                bg = "#fff";
                                color = "#1E3A8A";
                                borderColor = "#1E3A8A";
                            } else {
                                bg = "#fff";
                                color = "#4A5148";
                                borderColor = "#E4E1D6";
                            }

                            const label =
                                tab.kind === "matchday"
                                    ? t("competition.mdLabel", { md: tab.matchday })
                                    : stageLabel(t, tab.stage);

                            return (
                                <button
                                    key={key}
                                    ref={isCurrent ? activeTabRef : undefined}
                                    type="button"
                                    onClick={() => selectTab(tab)}
                                    className="uppercase"
                                    style={{
                                        padding: "8px 14px",
                                        background: bg,
                                        color,
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        letterSpacing: 0.4,
                                        cursor: "pointer",
                                        fontFamily: "inherit",
                                        whiteSpace: "nowrap",
                                        transition: "all 0.15s",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        flexShrink: 0,
                                    }}
                                >
                                    {label}
                                    {isCurrent && (
                                        <span
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: 999,
                                                background: "#9D0010",
                                                display: "inline-block",
                                            }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {canScrollLeft && (
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                left: 0,
                                width: 36,
                                pointerEvents: "none",
                                background:
                                    "linear-gradient(to right, #F4F2EC, rgba(244,242,236,0))",
                            }}
                        />
                    )}
                    {canScrollRight && (
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                right: 0,
                                width: 36,
                                pointerEvents: "none",
                                background:
                                    "linear-gradient(to left, #F4F2EC, rgba(244,242,236,0))",
                            }}
                        />
                    )}

                    {canScrollLeft && (
                        <button
                            type="button"
                            onClick={() => scrollTabs(-1)}
                            aria-label={t("aria.scrollLeft")}
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: 2,
                                transform: "translateY(-50%)",
                                width: 26,
                                height: 26,
                                borderRadius: 999,
                                background: "#fff",
                                border: "1px solid #E4E1D6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#0B0F0A",
                                fontSize: 14,
                                lineHeight: 1,
                                padding: 0,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                fontFamily: "inherit",
                            }}
                        >
                            ‹
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            type="button"
                            onClick={() => scrollTabs(1)}
                            aria-label={t("aria.scrollRight")}
                            style={{
                                position: "absolute",
                                top: "50%",
                                right: 2,
                                transform: "translateY(-50%)",
                                width: 26,
                                height: 26,
                                borderRadius: 999,
                                background: "#fff",
                                border: "1px solid #E4E1D6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#0B0F0A",
                                fontSize: 14,
                                lineHeight: 1,
                                padding: 0,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                fontFamily: "inherit",
                            }}
                        >
                            ›
                        </button>
                    )}
                </div>
            </div>

            {pending && matches.length === 0 ? (
                <div className="flex justify-center" style={{ padding: "60px 0" }}>
                    <svg
                        className="animate-spin"
                        style={{ color: "#1E3A8A" }}
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                    >
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
            ) : matches.length === 0 ? (
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
                    {t("competition.noFixtures")}
                </div>
            ) : (
                <div className="grid gap-3">
                    {matches.map((match) => (
                        <MatchCardCompact
                            key={match.id}
                            match={match}
                            homeForm={formByTeam[match.homeTeam.id] ?? []}
                            awayForm={formByTeam[match.awayTeam.id] ?? []}
                            mode="predict"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
