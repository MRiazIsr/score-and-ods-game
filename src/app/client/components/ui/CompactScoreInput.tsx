"use client";

import React from "react";

interface CompactScoreInputProps {
    homeScore: number;
    awayScore: number;
    onHomeScoreChange: (value: number) => void;
    onAwayScoreChange: (value: number) => void;
    disabled?: boolean;
}

export const CompactScoreInput: React.FC<CompactScoreInputProps> = ({
    homeScore,
    awayScore,
    onHomeScoreChange,
    onAwayScoreChange,
    disabled = false,
}) => {
    const clamp = (n: number) => Math.max(0, Math.min(99, n));
    const onInput = (value: string, set: (n: number) => void) => {
        if (disabled) return;
        const n = Number(value);
        if (!Number.isNaN(n)) set(clamp(n));
    };

    const boxStyle: React.CSSProperties = {
        width: 44,
        height: 44,
        border: `1.5px solid ${disabled ? "#E4E1D6" : "#9D0010"}`,
        borderRadius: 6,
        background: disabled ? "#F4F2EC" : "#fff",
        color: disabled ? "#4A5148" : "#0B0F0A",
        fontSize: 22,
        fontWeight: 700,
        textAlign: "center",
        fontFamily: "var(--font-display), Inter, sans-serif",
        outline: "none",
        WebkitAppearance: "none",
        MozAppearance: "textfield",
        padding: 0,
    };

    return (
        <div className="flex items-center" style={{ gap: 8 }}>
            <input
                type="text"
                inputMode="numeric"
                value={homeScore}
                onChange={(e) => onInput(e.target.value, onHomeScoreChange)}
                onFocus={(e) => !disabled && e.currentTarget.select()}
                disabled={disabled}
                style={boxStyle}
                aria-label="Home score"
            />
            <span
                className="font-display"
                style={{ color: "#4A5148", fontSize: 18, fontWeight: 500 }}
            >
                –
            </span>
            <input
                type="text"
                inputMode="numeric"
                value={awayScore}
                onChange={(e) => onInput(e.target.value, onAwayScoreChange)}
                onFocus={(e) => !disabled && e.currentTarget.select()}
                disabled={disabled}
                style={boxStyle}
                aria-label="Away score"
            />
        </div>
    );
};
