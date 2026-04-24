// The right-hand preview panel on Sign in / Create account / Reset password.
// Soft brand-blue tint, "Predict." up top, mini match card, "Win." above the mini leaderboard.

export function AuthPreviewPanel() {
    return (
        <aside
            className="relative overflow-hidden h-full min-h-screen"
            style={{
                background: "#E0E7FF",
                color: "#0B0F0A",
                padding: "48px 40px",
            }}
        >
            <div className="relative z-10 flex flex-col justify-center h-full min-h-[calc(100vh-96px)]">
                {/* Predict. — top lockup */}
                <div
                    className="font-hand"
                    style={{
                        fontSize: 56,
                        lineHeight: 1,
                        letterSpacing: -1.6,
                        color: "#1E3A8A",
                    }}
                >
                    Predict.
                </div>

                {/* mini match card */}
                <div
                    style={{
                        background: "#FFFFFF",
                        border: "1px solid #E4E1D6",
                        borderRadius: 10,
                        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(15,25,15,0.06)",
                        padding: 16,
                        marginTop: 28,
                    }}
                >
                    <div
                        className="flex justify-between items-center uppercase text-ink2"
                        style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4 }}
                    >
                        <span>Premier League · Matchday 34</span>
                        <span>Sat 16:00</span>
                    </div>
                    <div
                        className="grid items-center"
                        style={{ gridTemplateColumns: "1fr auto 1fr", gap: 10, marginTop: 12 }}
                    >
                        <div className="flex items-center gap-2">
                            <span style={{ width: 26, height: 26, borderRadius: 13, background: "#EF0107" }} />
                            <span className="font-display" style={{ fontSize: 13, fontWeight: 700 }}>
                                Arsenal
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-display">
                            <span
                                className="flex items-center justify-center"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 5,
                                    border: "1.5px solid #9D0010",
                                    color: "#9D0010",
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}
                            >
                                2
                            </span>
                            <span className="text-ink2" style={{ fontSize: 14, fontWeight: 500 }}>
                                –
                            </span>
                            <span
                                className="flex items-center justify-center"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 5,
                                    border: "1.5px solid #9D0010",
                                    color: "#9D0010",
                                    fontSize: 16,
                                    fontWeight: 700,
                                }}
                            >
                                1
                            </span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                            <span className="font-display text-right" style={{ fontSize: 13, fontWeight: 700 }}>
                                Man City
                            </span>
                            <span style={{ width: 26, height: 26, borderRadius: 13, background: "#6CABDD" }} />
                        </div>
                    </div>

                    {/* form ribbons — ARS left-aligned, MCI right-aligned */}
                    <div className="grid grid-cols-2 gap-3" style={{ marginTop: 14 }}>
                        {[
                            { label: "ARS · Last 5", ribbon: ["W", "W", "D", "W", "L"], align: "left" as const },
                            { label: "MCI · Last 5", ribbon: ["W", "L", "W", "W", "W"], align: "right" as const },
                        ].map((row) => (
                            <div
                                key={row.label}
                                style={{
                                    textAlign: row.align,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: row.align === "right" ? "flex-end" : "flex-start",
                                }}
                            >
                                <div
                                    className="uppercase text-ink2"
                                    style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4 }}
                                >
                                    {row.label}
                                </div>
                                <div
                                    className="flex gap-1"
                                    style={{ marginTop: 4, justifyContent: row.align === "right" ? "flex-end" : "flex-start" }}
                                >
                                    {row.ribbon.map((r, idx) => (
                                        <span
                                            key={idx}
                                            className="flex items-center justify-center"
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderRadius: 3,
                                                fontSize: 9,
                                                fontWeight: 700,
                                                color: "#fff",
                                                background:
                                                    r === "W"
                                                        ? "#16A34A"
                                                        : r === "D"
                                                        ? "#9CA3AF"
                                                        : "#DC2626",
                                            }}
                                        >
                                            {r}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div
                        className="flex justify-between items-center"
                        style={{
                            marginTop: 14,
                            padding: "8px 12px",
                            background: "#E0E7FF",
                            borderRadius: 6,
                        }}
                    >
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#1E3A8A" }}>
                            +3 pts if this holds
                        </span>
                        <span className="font-display" style={{ fontSize: 12, fontWeight: 700, color: "#1E3A8A" }}>
                            Lock in →
                        </span>
                    </div>
                </div>

                {/* Win. — sits above the leaderboard */}
                <div
                    className="font-hand"
                    style={{
                        fontSize: 56,
                        lineHeight: 1,
                        letterSpacing: -1.6,
                        color: "#9D0010",
                        fontStyle: "italic",
                        marginTop: 32,
                    }}
                >
                    Win.
                </div>

                {/* mini leaderboard — YOU at rank 1 */}
                <div
                    style={{
                        background: "#FFFFFF",
                        border: "1px solid #E4E1D6",
                        borderRadius: 10,
                        marginTop: 18,
                        overflow: "hidden",
                    }}
                >
                    <div
                        className="flex justify-between items-center uppercase"
                        style={{
                            padding: "10px 14px",
                            borderBottom: "1px solid #E4E1D6",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#4A5148",
                            letterSpacing: 0.5,
                        }}
                    >
                        <span>Office League · Week 34</span>
                        <span>+14 you</span>
                    </div>
                    {[
                        { rank: 1, name: "You", pts: 41, me: true },
                        { rank: 2, name: "Jamie", pts: 38 },
                        { rank: 3, name: "Priya", pts: 36 },
                        { rank: 4, name: "Marcus", pts: 34 },
                    ].map((row, i) => (
                        <div
                            key={row.rank}
                            className="flex justify-between items-center"
                            style={{
                                padding: "9px 14px",
                                borderTop: i ? "1px solid #F3F1EA" : "none",
                                background: row.me ? "#E0E7FF" : "transparent",
                            }}
                        >
                            <div className="flex items-center gap-2.5">
                                <span
                                    className="font-display"
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: row.me ? "#1E3A8A" : "#0B0F0A",
                                        width: 18,
                                    }}
                                >
                                    {row.rank}
                                </span>
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: row.me ? 700 : 500,
                                        color: row.me ? "#1E3A8A" : "#0B0F0A",
                                    }}
                                >
                                    {row.name}
                                </span>
                            </div>
                            <span className="inline-flex items-center gap-1.5">
                                <span
                                    aria-hidden
                                    style={{
                                        display: "inline-block",
                                        width: 0,
                                        height: 0,
                                        borderLeft: "4px solid transparent",
                                        borderRight: "4px solid transparent",
                                        ...(row.me
                                            ? { borderBottom: "6px solid #16A34A" }
                                            : { borderTop: "6px solid #DC2626" }),
                                    }}
                                />
                                <span
                                    className="font-display"
                                    style={{ fontSize: 13, fontWeight: 700, color: row.me ? "#1E3A8A" : "#0B0F0A" }}
                                >
                                    {row.pts}
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
