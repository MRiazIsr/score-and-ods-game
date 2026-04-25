"use client";

import { useTranslations } from "next-intl";

export type FormResult = "W" | "D" | "L";

interface FormRibbonProps {
    results: FormResult[];
    align?: "start" | "center" | "end";
}

const toneMap: Record<FormResult, { bg: string; fg: string }> = {
    W: { bg: "#DCFCE7", fg: "#166534" },
    D: { bg: "#E4E1D6", fg: "#4A5148" },
    L: { bg: "#FEE2E2", fg: "#991B1B" },
};

export function FormRibbon({ results, align = "center" }: FormRibbonProps) {
    const t = useTranslations("match");
    if (!results.length) {
        return (
            <div style={{ fontSize: 11, color: "#4A5148", textAlign: align }}>{t("noRecentForm")}</div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                gap: 4,
                justifyContent:
                    align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center",
            }}
        >
            {results.map((r, i) => {
                const { bg, fg } = toneMap[r];
                return (
                    <span
                        key={i}
                        className="font-display uppercase"
                        style={{
                            width: 20,
                            height: 20,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 3,
                            background: bg,
                            color: fg,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 0.4,
                        }}
                    >
                        {r}
                    </span>
                );
            })}
        </div>
    );
}
