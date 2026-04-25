"use client";

import { useTranslations } from "next-intl";

export type Sport = "football" | "hockey";

interface SportToggleProps {
    value: Sport;
    onChange?: (value: Sport) => void;
}

export function SportToggle({ value, onChange }: SportToggleProps) {
    const t = useTranslations();
    const pill = (active: boolean, disabled: boolean): React.CSSProperties => ({
        padding: "5px 10px",
        borderRadius: 3,
        background: active ? "#fff" : "transparent",
        boxShadow: active ? "0 1px 2px rgba(0,0,0,.08)" : "none",
        fontSize: 11,
        fontWeight: active ? 600 : 500,
        color: active ? "#0B0F0A" : disabled ? "#A1A1AA" : "#4A5148",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
    });

    return (
        <div
            style={{
                display: "inline-flex",
                gap: 4,
                background: "#F4F2EC",
                padding: 3,
                borderRadius: 4,
            }}
        >
            <button
                type="button"
                style={pill(value === "football", false)}
                onClick={() => onChange?.("football")}
            >
                {t("sport.football")}
            </button>
            <button type="button" style={pill(false, true)} disabled aria-disabled="true" title={t("common.comingSoon")}>
                {t("sport.hockey")}
                <span
                    className="uppercase"
                    style={{
                        fontSize: 8,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        padding: "1px 4px",
                        borderRadius: 2,
                        background: "#E4E1D6",
                        color: "#4A5148",
                    }}
                >
                    {t("common.soon")}
                </span>
            </button>
        </div>
    );
}
