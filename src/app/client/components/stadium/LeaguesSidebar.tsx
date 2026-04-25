"use client";

import { useTranslations } from "next-intl";

const PLACEHOLDER_LEAGUES = [
    { id: "office", name: "Office League", members: 14, rank: 3, icon: "💼", points: 412 },
    { id: "uni", name: "Uni Mates", members: 8, rank: 1, icon: "🎓", points: 388 },
    { id: "global", name: "Global Public", members: 284193, rank: 12402, icon: "🌍", points: 447 },
];

export function LeaguesSidebar() {
    const t = useTranslations();
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 8,
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #E4E1D6",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <span
                    className="uppercase"
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        color: "#4A5148",
                    }}
                >
                    {t("sidebar.yourLeagues")}
                </span>
                <span
                    className="uppercase"
                    style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        color: "#4A5148",
                        background: "#F4F2EC",
                        padding: "2px 6px",
                        borderRadius: 3,
                    }}
                    title={t("leagues.friendPoolsTooltip")}
                >
                    {t("common.preview")}
                </span>
            </div>
            {PLACEHOLDER_LEAGUES.map((l, i) => (
                <div
                    key={l.id}
                    style={{
                        padding: "12px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        borderTop: i ? "1px solid #E4E1D6" : "none",
                        opacity: 0.72,
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            background: "#F4F2EC",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                        }}
                    >
                        {l.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{l.name}</div>
                        <div style={{ fontSize: 11, color: "#4A5148" }}>
                            {t("sidebar.members", { count: l.members })}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div className="font-display" style={{ fontSize: 14, fontWeight: 700 }}>
                            #{l.rank}
                        </div>
                        <div style={{ fontSize: 10, color: "#4A5148" }}>{l.points} {t("common.pointsShort")}</div>
                    </div>
                </div>
            ))}
            <div
                style={{
                    padding: "10px 14px",
                    borderTop: "1px solid #E4E1D6",
                    fontSize: 10,
                    color: "#4A5148",
                    textAlign: "center",
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                    fontWeight: 600,
                }}
            >
                {t("sidebar.friendPoolsLaunching")}
            </div>
        </div>
    );
}

export { PLACEHOLDER_LEAGUES };
