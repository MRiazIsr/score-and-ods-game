import type { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: ReactNode;
    sub?: string;
    hero?: boolean;
}

export function StatCard({ label, value, sub, hero = false }: StatCardProps) {
    if (hero) {
        return (
            <div
                style={{
                    background: "#1E3A8A",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "20px",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    className="uppercase"
                    style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,.55)",
                        fontWeight: 600,
                        letterSpacing: 0.5,
                    }}
                >
                    {label}
                </div>
                <div
                    className="font-display"
                    style={{ fontSize: 44, fontWeight: 700, marginTop: 4, letterSpacing: -1 }}
                >
                    {value}
                </div>
                {sub && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.65)", marginTop: 2 }}>
                        {sub}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 8,
                padding: "18px",
            }}
        >
            <div
                className="uppercase"
                style={{ fontSize: 10, color: "#4A5148", fontWeight: 600, letterSpacing: 0.5 }}
            >
                {label}
            </div>
            <div
                className="font-display"
                style={{ fontSize: 30, fontWeight: 700, marginTop: 4, letterSpacing: -0.8 }}
            >
                {value}
            </div>
            {sub && <div style={{ fontSize: 11, color: "#4A5148", marginTop: 2 }}>{sub}</div>}
        </div>
    );
}
