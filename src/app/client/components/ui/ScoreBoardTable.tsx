"use client";

import type { ScoreBoardData, ScoreBoardEntry } from "@/app/server/modules/competitions/types";

interface ScoreBoardTableProps {
    data: ScoreBoardData;
    currentUserId?: string;
}

function avatarLabel(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ScoreBoardTable({ data, currentUserId }: ScoreBoardTableProps) {
    const entries = data.entries || [];
    const hasEntries = entries.length > 0;

    if (!hasEntries) {
        return (
            <div
                className="text-ink2"
                style={{
                    background: "#fff",
                    border: "1px solid #E4E1D6",
                    borderRadius: 10,
                    padding: "44px 20px",
                    textAlign: "center",
                }}
            >
                <div
                    className="font-display"
                    style={{ fontSize: 22, fontWeight: 700, color: "#0B0F0A", letterSpacing: -0.3 }}
                >
                    The table is waiting.
                </div>
                <p style={{ fontSize: 13, lineHeight: 1.5, marginTop: 8, maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                    No matches have finished with predictions yet. As soon as one does, the crowd shows up here.
                </p>
            </div>
        );
    }

    const top3: ScoreBoardEntry[] = entries.slice(0, 3);
    const rest: ScoreBoardEntry[] = entries.slice(3);

    const heights: Record<number, number> = { 0: 92, 1: 118, 2: 76 };
    const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
    const podiumOrder = [1, 0, 2].map((idx) => top3[idx]).filter(Boolean) as ScoreBoardEntry[];

    const meInTop = top3.find((e) => e.userId === currentUserId);
    const meInRest = rest.find((e) => e.userId === currentUserId);
    const meEntry = meInRest || meInTop;
    const meRank = meEntry ? entries.findIndex((e) => e.userId === meEntry.userId) + 1 : undefined;

    return (
        <div style={{ display: "grid", gap: 24 }}>
            {/* podium */}
            {top3.length > 0 && (
                <div
                    className="grid items-end"
                    style={{ gridTemplateColumns: "1fr 1.2fr 1fr", gap: 10 }}
                >
                    {podiumOrder.map((p, i) => {
                        const actualRank = entries.findIndex((e) => e.userId === p.userId) + 1;
                        const isMe = p.userId === currentUserId;
                        return (
                            <div key={p.userId} style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>{medals[actualRank]}</div>
                                <div
                                    className="font-display mx-auto"
                                    style={{
                                        width: 48,
                                        height: 48,
                                        marginBottom: 8,
                                        borderRadius: 24,
                                        background: "#9D0010",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 700,
                                        fontSize: 14,
                                    }}
                                >
                                    {avatarLabel(p.name)}
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: "#0B0F0A" }}>
                                    {p.name}
                                    {isMe && <span style={{ color: "#1E3A8A" }}> · You</span>}
                                </div>
                                <div
                                    className="font-display"
                                    style={{ fontSize: 20, fontWeight: 700, color: "#1E3A8A", marginTop: 2 }}
                                >
                                    {p.points.toLocaleString()}
                                </div>
                                <div
                                    className="flex items-center justify-center font-display"
                                    style={{
                                        height: heights[i],
                                        marginTop: 10,
                                        background: actualRank === 1 ? "#9D0010" : "#fff",
                                        border: `1px solid ${actualRank === 1 ? "#9D0010" : "#E4E1D6"}`,
                                        borderTopLeftRadius: 6,
                                        borderTopRightRadius: 6,
                                        borderBottom: "none",
                                        color: actualRank === 1 ? "#fff" : "#0B0F0A",
                                        fontSize: 32,
                                        fontWeight: 700,
                                    }}
                                >
                                    {actualRank}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* table */}
            <div
                style={{
                    background: "#fff",
                    border: "1px solid #E4E1D6",
                    borderRadius: 10,
                    overflow: "hidden",
                }}
            >
                {/* Desktop header */}
                <div
                    className="hidden md:grid uppercase"
                    style={{
                        gridTemplateColumns: "50px 1fr 80px 80px 80px 90px",
                        padding: "12px 18px",
                        borderBottom: "1px solid #E4E1D6",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#4A5148",
                        letterSpacing: 0.5,
                    }}
                >
                    <div>#</div>
                    <div>Player</div>
                    <div style={{ textAlign: "right" }}>Exact</div>
                    <div style={{ textAlign: "right" }}>Diff</div>
                    <div style={{ textAlign: "right" }}>Result</div>
                    <div style={{ textAlign: "right" }}>Total</div>
                </div>

                {/* Desktop rows */}
                <div className="hidden md:block">
                    {entries.map((entry, index) => {
                        const rank = index + 1;
                        const isMe = entry.userId === currentUserId;
                        return (
                            <div
                                key={entry.userId}
                                className="md:grid"
                                style={{
                                    gridTemplateColumns: "50px 1fr 80px 80px 80px 90px",
                                    padding: "14px 18px",
                                    borderTop: index ? "1px solid #F3F1EA" : "none",
                                    alignItems: "center",
                                    fontSize: 13,
                                    background: isMe ? "#E0E7FF" : "transparent",
                                    borderLeft: isMe ? "2px solid #1E3A8A" : "none",
                                    paddingLeft: isMe ? 16 : 18,
                                    color: isMe ? "#1E3A8A" : "#0B0F0A",
                                }}
                            >
                                <div className="font-display" style={{ fontWeight: 700 }}>
                                    {rank}
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 14,
                                            background: isMe ? "#1E3A8A" : "#F4F2EC",
                                            color: isMe ? "#fff" : "#0B0F0A",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 10,
                                            fontWeight: 700,
                                            fontFamily: "var(--font-display), Inter, sans-serif",
                                        }}
                                    >
                                        {avatarLabel(entry.name)}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: isMe ? 700 : 600 }}>
                                            {entry.name}
                                            {isMe && " · You"}
                                        </div>
                                        <div className="text-ink2" style={{ fontSize: 10, color: isMe ? "#1E3A8A" : "#4A5148" }}>
                                            @{entry.userName}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-display" style={{ textAlign: "right", fontWeight: 600 }}>
                                    {entry.predictedCount}
                                </div>
                                <div style={{ textAlign: "right" }}>{entry.predictedDifference}</div>
                                <div style={{ textAlign: "right" }}>{entry.predictedOutcome}</div>
                                <div
                                    className="font-display"
                                    style={{ textAlign: "right", fontWeight: 700, color: isMe ? "#1E3A8A" : "#0B0F0A" }}
                                >
                                    {entry.points.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Mobile list */}
                <div className="md:hidden">
                    <div
                        className="uppercase"
                        style={{
                            padding: "10px 16px",
                            borderBottom: "1px solid #E4E1D6",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#4A5148",
                            letterSpacing: 0.5,
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <span>Player</span>
                        <span>Pts</span>
                    </div>
                    {entries.map((entry, index) => {
                        const rank = index + 1;
                        const isMe = entry.userId === currentUserId;
                        return (
                            <div
                                key={entry.userId}
                                style={{
                                    padding: "12px 16px",
                                    borderTop: index ? "1px solid #F3F1EA" : "none",
                                    background: isMe ? "#E0E7FF" : "transparent",
                                    borderLeft: isMe ? "2px solid #1E3A8A" : "none",
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className="font-display"
                                            style={{ fontSize: 13, fontWeight: 700, width: 22, color: isMe ? "#1E3A8A" : "#0B0F0A" }}
                                        >
                                            {rank}
                                        </span>
                                        <span
                                            style={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: 13,
                                                background: isMe ? "#1E3A8A" : "#F4F2EC",
                                                color: isMe ? "#fff" : "#0B0F0A",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 10,
                                                fontWeight: 700,
                                                fontFamily: "var(--font-display), Inter, sans-serif",
                                            }}
                                        >
                                            {avatarLabel(entry.name)}
                                        </span>
                                        <span style={{ fontSize: 13, fontWeight: isMe ? 700 : 600, color: isMe ? "#1E3A8A" : "#0B0F0A" }}>
                                            {entry.name}
                                            {isMe && " · You"}
                                        </span>
                                    </div>
                                    <span
                                        className="font-display"
                                        style={{ fontSize: 15, fontWeight: 700, color: isMe ? "#1E3A8A" : "#0B0F0A" }}
                                    >
                                        {entry.points.toLocaleString()}
                                    </span>
                                </div>
                                <div
                                    className="flex gap-4 text-ink2"
                                    style={{ marginTop: 6, paddingLeft: 54, fontSize: 11 }}
                                >
                                    <span>Exact {entry.predictedCount}</span>
                                    <span>Diff {entry.predictedDifference}</span>
                                    <span>Result {entry.predictedOutcome}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* footer note for user not in top list */}
            {meEntry && meRank && (
                <div
                    className="text-ink2"
                    style={{ fontSize: 11, textAlign: "center", letterSpacing: 0.2 }}
                >
                    You&apos;re ranked <span style={{ color: "#1E3A8A", fontWeight: 700 }}>#{meRank}</span> with{" "}
                    <span style={{ color: "#1E3A8A", fontWeight: 700 }}>{meEntry.points.toLocaleString()}</span> pts.
                </div>
            )}
        </div>
    );
}
