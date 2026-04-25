"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeroGallery() {
    const t = useTranslations();
    const [i, setI] = useState(0);

    const frames = [
        {
            eyebrow: t("hero.frame1.eyebrow"),
            h1a: t("hero.frame1.h1a"),
            h1b: t("hero.frame1.h1b"),
            copy: t("hero.frame1.copy"),
            label: t("hero.frame1.label"),
            ctaPrimary: { label: t("cta.startLeague"), href: "/signup" },
            ctaSecondary: { label: t("cta.seeALiveLeague"), href: "#scoring" },
        },
        {
            eyebrow: t("hero.frame2.eyebrow"),
            h1a: t("hero.frame2.h1a"),
            h1b: t("hero.frame2.h1b"),
            copy: t("hero.frame2.copy"),
            label: t("hero.frame2.label"),
            ctaPrimary: { label: t("cta.predictNow"), href: "/signup" },
            ctaSecondary: { label: t("cta.scoringWorks"), href: "#scoring" },
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => setI((v) => (v + 1) % frames.length), 5600);
        return () => clearInterval(timer);
    }, [frames.length]);

    const f = frames[i];

    return (
        <section className="relative mx-auto" style={{ padding: "56px 32px 24px", maxWidth: 1080 }}>
            <div className="text-center">
                <div
                    className="inline-flex items-center gap-2 uppercase"
                    style={{
                        marginBottom: 20,
                        background: "#E0E7FF",
                        color: "#1E3A8A",
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                    }}
                >
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: "#1E3A8A" }} /> {f.eyebrow}
                </div>

                <h1
                    className="font-hand"
                    style={{
                        fontSize: "clamp(44px, 8vw, 76px)",
                        lineHeight: 0.95,
                        margin: 0,
                        letterSpacing: -2.4,
                        fontWeight: 400,
                        color: "#1E3A8A",
                    }}
                >
                    {f.h1a}
                    <br />
                    <span style={{ color: "rgb(140, 1, 1)", fontStyle: "italic" }}>{f.h1b}</span>
                </h1>

                <p
                    className="mx-auto text-ink2"
                    style={{ fontSize: 17, lineHeight: 1.5, maxWidth: 640, marginTop: 22 }}
                >
                    {f.copy}
                </p>

                <div className="flex flex-wrap gap-2.5 justify-center" style={{ marginTop: 28 }}>
                    <Link
                        href={f.ctaPrimary.href}
                        style={{
                            padding: "13px 22px",
                            background: "#9D0010",
                            color: "#fff",
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: 0.2,
                        }}
                    >
                        {f.ctaPrimary.label} →
                    </Link>
                    <a
                        href={f.ctaSecondary.href}
                        style={{
                            padding: "13px 22px",
                            background: "transparent",
                            color: "#0B0F0A",
                            border: "1.5px solid #0B0F0A",
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 700,
                        }}
                    >
                        {f.ctaSecondary.label}
                    </a>
                </div>
            </div>

            <div className="flex gap-1.5 justify-center" style={{ marginTop: 28 }}>
                {frames.map((_, n) => (
                    <button
                        key={n}
                        type="button"
                        onClick={() => setI(n)}
                        aria-label={`${n + 1}`}
                        style={{
                            width: n === i ? 28 : 8,
                            height: 8,
                            borderRadius: 4,
                            background: n === i ? "#9D0010" : "#E4E1D6",
                            border: "none",
                            cursor: "pointer",
                            transition: "width 0.3s, background 0.2s",
                        }}
                    />
                ))}
            </div>
            <div className="text-center text-ink2" style={{ marginTop: 10, fontSize: 11, letterSpacing: 0.3 }}>
                <span style={{ fontWeight: 700, color: "#0B0F0A" }}>{String(i + 1).padStart(2, "0")}</span> / 02 ·{" "}
                {f.label}
            </div>
        </section>
    );
}
