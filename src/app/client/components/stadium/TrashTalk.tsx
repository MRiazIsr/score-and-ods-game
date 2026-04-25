"use client";

import { useTranslations } from "next-intl";

const PLACEHOLDER_MESSAGES = [
    { who: "Diego R.", avatar: "DR", msg: "Calling 3-1 Liverpool, book it 📖", ts: "2m" },
    { who: "Mira Chen", avatar: "MC", msg: "ARS vs City is a coin flip tbh", ts: "18m" },
    { who: "Sam Oyelaran", avatar: "SO", msg: "Hockey pool members — deadline 6pm!", ts: "1h" },
];

export function TrashTalk() {
    const t = useTranslations("sidebar");
    return (
        <div
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 8,
                overflow: "hidden",
                opacity: 0.85,
            }}
        >
            <div style={{ padding: "12px 14px", borderBottom: "1px solid #E4E1D6" }}>
                <div
                    className="uppercase"
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        color: "#4A5148",
                    }}
                >
                    {t("trashTalk")}
                </div>
                <div style={{ fontSize: 10, color: "#4A5148", marginTop: 2 }}>{t("trashTalkPreview")}</div>
            </div>
            {PLACEHOLDER_MESSAGES.map((c, i) => (
                <div
                    key={i}
                    style={{
                        padding: "10px 14px",
                        display: "flex",
                        gap: 10,
                        borderTop: i ? "1px solid #E4E1D6" : "none",
                    }}
                >
                    <div
                        className="font-display"
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: 11,
                            background: "#9D0010",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 700,
                            flexShrink: 0,
                        }}
                    >
                        {c.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <span>{c.who}</span>
                            <span style={{ color: "#4A5148", fontWeight: 400 }}>{c.ts}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#4A5148", marginTop: 1 }}>{c.msg}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
