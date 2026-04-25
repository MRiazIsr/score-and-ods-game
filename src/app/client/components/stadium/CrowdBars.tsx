"use client";

import { useTranslations } from "next-intl";

export interface CrowdBucket {
    score: string;
    count: number;
    pct: number;
}

interface CrowdBarsProps {
    buckets: CrowdBucket[];
}

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
}

export function CrowdBars({ buckets }: CrowdBarsProps) {
    const t = useTranslations("crowd");
    if (!buckets.length) {
        return (
            <div style={{ fontSize: 12, color: "#4A5148", textAlign: "center", padding: "12px 0" }}>
                {t("noPicks")}
            </div>
        );
    }

    const max = Math.max(...buckets.map((b) => b.pct));

    return (
        <div className="grid" style={{ gap: 8 }}>
            {buckets.map((b, i) => (
                <div
                    key={b.score}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "40px 1fr 50px",
                        gap: 10,
                        alignItems: "center",
                    }}
                >
                    <div className="font-display" style={{ fontSize: 14, fontWeight: 700 }}>
                        {b.score}
                    </div>
                    <div
                        style={{
                            height: 8,
                            background: "#E4E1D6",
                            borderRadius: 4,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                width: `${max === 0 ? 0 : (b.pct / max) * 100}%`,
                                height: "100%",
                                background: i === 0 ? "#1E3A8A" : "#4A5148",
                            }}
                        />
                    </div>
                    <div style={{ fontSize: 11, color: "#4A5148", textAlign: "right" }}>
                        {formatCount(b.count)}
                    </div>
                </div>
            ))}
        </div>
    );
}
