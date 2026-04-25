"use client";

import type { TeamFormResult } from "@/app/server/services/auth/CompetitionsService";

interface FormDotsProps {
    form: TeamFormResult[];
    teamName?: string;
    align?: "start" | "end";
    size?: "sm" | "md";
}

const SLOTS = 5;
const COLORS: Record<"W" | "D" | "L", string> = {
    W: "#16A34A",
    D: "#A8A29E",
    L: "#DC2626",
};
const EMPTY = "#E4E1D6";

export function FormDots({ form, teamName, align = "start", size = "sm" }: FormDotsProps) {
    const dotSize = size === "md" ? 10 : 8;
    const gap = size === "md" ? 5 : 4;

    // Show oldest → newest left-to-right; the service returns newest first.
    const ordered = [...form].slice(0, SLOTS).reverse();
    const padCount = Math.max(0, SLOTS - ordered.length);

    return (
        <div
            className="flex items-center"
            style={{
                gap,
                justifyContent: align === "end" ? "flex-end" : "flex-start",
            }}
            aria-label={teamName ? `${teamName} last ${ordered.length} results` : undefined}
        >
            {Array.from({ length: padCount }).map((_, i) => (
                <span
                    key={`empty-${i}`}
                    style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: 999,
                        background: EMPTY,
                        display: "inline-block",
                    }}
                />
            ))}
            {ordered.map((r, i) => {
                const tip = `${r.isHome ? "vs" : "@"} ${r.opponent} · ${r.scored}–${r.conceded} · ${r.result}`;
                return (
                    <span
                        key={`${r.matchId}-${i}`}
                        title={tip}
                        style={{
                            width: dotSize,
                            height: dotSize,
                            borderRadius: 999,
                            background: COLORS[r.result],
                            display: "inline-block",
                            cursor: "default",
                        }}
                    />
                );
            })}
        </div>
    );
}
