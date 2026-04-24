import Link from "next/link";
import Image from "next/image";
import type { Match } from "@/app/server/modules/competitions/types";
import { Chip } from "./Chip";
import { calculatePoints as computePoints } from "@/app/server/services/ScoringService";

type CardVariant = "scheduled" | "live" | "final";

interface MatchCardProps {
    match: Match;
}

function matchVariant(match: Match): CardVariant {
    if (match.status === "FINISHED") return "final";
    if (match.status === "IN_PLAY" || match.status === "LIVE" || match.status === "PAUSED") return "live";
    return "scheduled";
}

function formatKickoff(utcDate: string): string {
    const d = new Date(utcDate);
    const weekday = d.toLocaleDateString("en-GB", { weekday: "short" });
    const time = d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
    return `${weekday} · ${time}`;
}

function TeamBlock({
    name,
    tla,
    crest,
    align,
}: {
    name: string | null;
    tla: string | null;
    crest?: string | null;
    align: "left" | "right";
}) {
    const displayName = name ?? "TBD";
    const initials = (tla || name || "?").slice(0, 2).toUpperCase();

    const crestNode = crest ? (
        <div
            style={{
                width: 34,
                height: 34,
                background: "#F4F2EC",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <Image src={crest} alt={displayName} width={26} height={26} style={{ objectFit: "contain" }} />
        </div>
    ) : (
        <div
            className="font-display"
            style={{
                width: 34,
                height: 34,
                background: "#0B0F0A",
                color: "#fff",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    );

    const nameNode = (
        <span
            className="font-display"
            style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#0B0F0A",
                textAlign: align === "right" ? "right" : "left",
            }}
        >
            {displayName}
        </span>
    );

    return (
        <div
            className="flex items-center"
            style={{
                gap: 10,
                justifyContent: align === "right" ? "flex-end" : "flex-start",
            }}
        >
            {align === "right" ? (
                <>
                    {nameNode}
                    {crestNode}
                </>
            ) : (
                <>
                    {crestNode}
                    {nameNode}
                </>
            )}
        </div>
    );
}

export function MatchCard({ match }: MatchCardProps) {
    const variant = matchVariant(match);
    const hasPick = !!match.predictedScore?.isPredicted;

    const headerRight = (() => {
        if (variant === "live") return <Chip tone="live">Live</Chip>;
        if (variant === "final") return <Chip tone="final">Final</Chip>;
        return (
            <span style={{ fontWeight: 500, fontSize: 10, color: "#4A5148" }}>{formatKickoff(match.utcDate)}</span>
        );
    })();

    const centerDisplay = (() => {
        if (variant === "scheduled") {
            return (
                <div
                    className="font-display"
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#4A5148",
                        letterSpacing: 2,
                    }}
                >
                    VS
                </div>
            );
        }
        const home = match.score.fullTime.home ?? 0;
        const away = match.score.fullTime.away ?? 0;
        return (
            <div
                className="font-display flex items-center"
                style={{ gap: 8, fontSize: 22, fontWeight: 700, color: "#0B0F0A" }}
            >
                <span>{home}</span>
                <span style={{ color: "#4A5148" }}>–</span>
                <span>{away}</span>
            </div>
        );
    })();

    const pickFooter = (() => {
        if (variant === "final" && hasPick) {
            const points = computePoints(
                { home: match.predictedScore!.home, away: match.predictedScore!.away },
                { home: match.score.fullTime.home ?? 0, away: match.score.fullTime.away ?? 0 }
            );
            const bg = points > 0 ? "#E0E7FF" : "#FEE2E2";
            const fg = points > 0 ? "#1E3A8A" : "#991B1B";
            return (
                <div
                    className="flex items-center justify-between"
                    style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        background: bg,
                        borderRadius: 6,
                    }}
                >
                    <span style={{ fontSize: 11, fontWeight: 600, color: fg }}>
                        Your pick: {match.predictedScore!.home}–{match.predictedScore!.away}
                    </span>
                    <span
                        className="font-display"
                        style={{ fontSize: 16, fontWeight: 700, color: fg }}
                    >
                        {points > 0 ? `+${points} pts` : "No pts"}
                    </span>
                </div>
            );
        }
        if (variant === "live" && hasPick) {
            return (
                <div
                    className="flex items-center justify-between"
                    style={{
                        marginTop: 12,
                        padding: "10px 12px",
                        background: "#FFFBEB",
                        borderRadius: 6,
                    }}
                >
                    <span style={{ fontSize: 11, color: "#92400E", fontWeight: 600 }}>
                        Your pick: {match.predictedScore!.home}–{match.predictedScore!.away}
                    </span>
                    <span style={{ fontSize: 11, color: "#92400E" }}>Live · result pending</span>
                </div>
            );
        }
        if (variant === "scheduled") {
            return (
                <div className="flex justify-end" style={{ marginTop: 12 }}>
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
                            display: "inline-block",
                        }}
                    >
                        {hasPick
                            ? `Update · ${match.predictedScore!.home}–${match.predictedScore!.away}`
                            : "Lock in pick"}
                    </Link>
                </div>
            );
        }
        return null;
    })();

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 8,
                boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(15,25,15,0.06)",
                overflow: "hidden",
            }}
        >
            <div
                className="uppercase flex items-center justify-between"
                style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid #E4E1D6",
                    fontSize: 10,
                    color: "#4A5148",
                    fontWeight: 600,
                    letterSpacing: 0.4,
                }}
            >
                <span>
                    {match.competition.name} · MD {match.matchday}
                </span>
                {headerRight}
            </div>

            <div style={{ padding: "18px 14px 14px" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <TeamBlock
                        name={match.homeTeam.name}
                        tla={match.homeTeam.tla}
                        crest={match.homeTeam.crest}
                        align="left"
                    />
                    {centerDisplay}
                    <TeamBlock
                        name={match.awayTeam.name}
                        tla={match.awayTeam.tla}
                        crest={match.awayTeam.crest}
                        align="right"
                    />
                </div>
                {pickFooter}
            </div>
        </div>
    );
}
