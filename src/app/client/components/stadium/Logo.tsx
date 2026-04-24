import type { CSSProperties } from "react";

interface LogoProps {
    size?: number;
    label?: string;
    tone?: "brand" | "ink";
}

export function AppLogo({ size = 28, label = "Pick The Score", tone = "brand" }: LogoProps) {
    const fill = tone === "brand" ? "#9D0010" : "#0B0F0A";
    const markStyle: CSSProperties = {
        width: size,
        height: size,
        borderRadius: size / 2,
        background: fill,
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
    };
    return (
        <span className="inline-flex items-center gap-2 font-display font-bold tracking-tight" style={{ fontSize: size * 0.65 }}>
            <span style={markStyle}>
                <span
                    style={{
                        position: "absolute",
                        inset: size * 0.21,
                        borderRadius: size * 0.28,
                        border: "1.5px solid #fff",
                    }}
                />
                <span
                    style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        bottom: 0,
                        width: 1.5,
                        background: "#fff",
                        transform: "translateX(-50%)",
                    }}
                />
            </span>
            <span>{label}</span>
        </span>
    );
}
