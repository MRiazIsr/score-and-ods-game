import type { ReactNode } from "react";

type Tone = "default" | "live" | "final" | "brand" | "warn";

interface ChipProps {
    children: ReactNode;
    tone?: Tone;
}

const toneMap: Record<Tone, { bg: string; fg: string }> = {
    default: { bg: "#F3F1EA", fg: "#3F3F46" },
    live: { bg: "#FEF3C7", fg: "#92400E" },
    final: { bg: "#E4E1D6", fg: "#4A5148" },
    brand: { bg: "#E0E7FF", fg: "#1E3A8A" },
    warn: { bg: "#FEE2E2", fg: "#991B1B" },
};

export function Chip({ children, tone = "default" }: ChipProps) {
    const { bg, fg } = toneMap[tone];
    return (
        <span
            className="inline-flex items-center gap-1 font-sans"
            style={{
                background: bg,
                color: fg,
                padding: "3px 6px",
                borderRadius: 3,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
            }}
        >
            {tone === "live" && (
                <span
                    className="s1-pulse"
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        background: "#DC2626",
                    }}
                />
            )}
            {children}
        </span>
    );
}
