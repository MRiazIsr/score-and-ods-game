"use client";

interface StepperProps {
    value: number;
    onChange: (n: number) => void;
    max?: number;
    min?: number;
    color?: string;
    label: string;
    disabled?: boolean;
}

export function Stepper({
    value,
    onChange,
    max = 9,
    min = 0,
    color = "#0B0F0A",
    label,
    disabled = false,
}: StepperProps) {
    const bump = (delta: number) => {
        if (disabled) return;
        const next = Math.max(min, Math.min(max, value + delta));
        onChange(next);
    };

    const btn: React.CSSProperties = {
        width: 36,
        height: 36,
        borderRadius: 18,
        border: "1.5px solid #E4E1D6",
        background: "#fff",
        fontSize: 18,
        cursor: disabled ? "not-allowed" : "pointer",
        color: "#4A5148",
        fontFamily: "inherit",
    };

    return (
        <div style={{ textAlign: "center" }}>
            <div
                className="uppercase"
                style={{ fontSize: 11, fontWeight: 700, color: "#4A5148", letterSpacing: 0.5, marginBottom: 10 }}
            >
                {label}
            </div>
            <div className="flex items-center justify-center" style={{ gap: 10 }}>
                <button type="button" onClick={() => bump(-1)} style={btn} aria-label={`Decrease ${label}`}>
                    −
                </button>
                <div
                    className="font-display"
                    style={{
                        fontSize: 64,
                        fontWeight: 700,
                        minWidth: 60,
                        color,
                        lineHeight: 1,
                    }}
                >
                    {value}
                </div>
                <button type="button" onClick={() => bump(1)} style={btn} aria-label={`Increase ${label}`}>
                    +
                </button>
            </div>
        </div>
    );
}
