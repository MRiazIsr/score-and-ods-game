"use client";

import React from "react";

interface MatchScoreInputProps {
    homeScore: number;
    awayScore: number;
    onHomeScoreChange: (value: number) => void;
    onAwayScoreChange: (value: number) => void;
    disabled?: boolean;
}

export const MatchScoreInput: React.FC<MatchScoreInputProps> = ({
    homeScore,
    awayScore,
    onHomeScoreChange,
    onAwayScoreChange,
    disabled = false,
}) => {
    const inc = (v: number, set: (n: number) => void) => {
        if (!disabled) set(Math.min(99, v + 1));
    };
    const dec = (v: number, set: (n: number) => void) => {
        if (!disabled) set(Math.max(0, v - 1));
    };
    const onInput = (value: string, set: (n: number) => void) => {
        if (!disabled) {
            const n = Number(value);
            if (!Number.isNaN(n)) set(Math.max(0, Math.min(99, n)));
        }
    };

    const boxStyle: React.CSSProperties = {
        width: 72,
        height: 72,
        border: `1.5px solid ${disabled ? "#E4E1D6" : "#9D0010"}`,
        borderRadius: 8,
        background: "#fff",
        color: disabled ? "#4A5148" : "#9D0010",
        fontSize: 36,
        fontWeight: 700,
        textAlign: "center",
        fontFamily: "var(--font-display), Inter, sans-serif",
        outline: "none",
        WebkitAppearance: "none",
        MozAppearance: "textfield",
        padding: 0,
    };

    const stepStyle: React.CSSProperties = {
        width: 24,
        height: 24,
        borderRadius: 12,
        border: "1.5px solid #E4E1D6",
        background: "#fff",
        color: "#4A5148",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    return (
        <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
                {!disabled && (
                    <button type="button" aria-label="Increase home score" onClick={() => inc(homeScore, onHomeScoreChange)} style={stepStyle}>
                        +
                    </button>
                )}
                <input
                    type="text"
                    inputMode="numeric"
                    value={homeScore}
                    onChange={(e) => onInput(e.target.value, onHomeScoreChange)}
                    disabled={disabled}
                    style={boxStyle}
                    aria-label="Home score"
                />
                {!disabled && (
                    <button type="button" aria-label="Decrease home score" onClick={() => dec(homeScore, onHomeScoreChange)} style={stepStyle}>
                        −
                    </button>
                )}
            </div>
            <span className="font-display text-ink2" style={{ fontSize: 28, fontWeight: 500 }}>
                –
            </span>
            <div className="flex flex-col items-center gap-1">
                {!disabled && (
                    <button type="button" aria-label="Increase away score" onClick={() => inc(awayScore, onAwayScoreChange)} style={stepStyle}>
                        +
                    </button>
                )}
                <input
                    type="text"
                    inputMode="numeric"
                    value={awayScore}
                    onChange={(e) => onInput(e.target.value, onAwayScoreChange)}
                    disabled={disabled}
                    style={boxStyle}
                    aria-label="Away score"
                />
                {!disabled && (
                    <button type="button" aria-label="Decrease away score" onClick={() => dec(awayScore, onAwayScoreChange)} style={stepStyle}>
                        −
                    </button>
                )}
            </div>
        </div>
    );
};
