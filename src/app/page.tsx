import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLogo } from "@/app/client/components/stadium/Logo";
import { HeroGallery } from "@/app/client/components/stadium/HeroGallery";
import { Chip } from "@/app/client/components/stadium/Chip";
import { LanguageSwitcher } from "@/app/client/components/ui/LanguageSwitcher";

export default function Landing() {
    const t = useTranslations();

    const scoringRows = [
        { pts: 3, label: t("landing.scoring.exact"), ex: t("landing.scoring.exactExample") },
        { pts: 2, label: t("landing.scoring.goalDiff"), ex: t("landing.scoring.goalDiffExample") },
        { pts: 1, label: t("landing.scoring.outcome"), ex: t("landing.scoring.outcomeExample") },
    ];

    return (
        <div className="min-h-screen bg-paper text-ink font-sans">
            {/* nav */}
            <nav
                className="flex items-center justify-between border-b border-line"
                style={{ padding: "18px 32px" }}
            >
                <AppLogo />
                <div className="hidden md:flex gap-7 text-ink2" style={{ fontSize: 13, fontWeight: 500 }}>
                    <span>{t("nav.landing.privateLeagues")}</span>
                    <span>{t("nav.landing.widgets")}</span>
                    <span>{t("nav.landing.telegramApp")}</span>
                    <span>{t("nav.landing.scoring")}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <LanguageSwitcher />
                    <Link
                        href="/login"
                        className="inline-flex items-center"
                        style={{
                            padding: "8px 14px",
                            background: "transparent",
                            border: "none",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#0B0F0A",
                        }}
                    >
                        {t("auth.login.linkLogIn")}
                    </Link>
                    <Link
                        href="/signup"
                        className="inline-flex items-center rounded"
                        style={{
                            padding: "8px 16px",
                            background: "#9D0010",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 600,
                        }}
                    >
                        {t("cta.startLeague")}
                    </Link>
                </div>
            </nav>

            {/* hero */}
            <HeroGallery />

            {/* feature tiles */}
            <section className="mx-auto grid gap-4" style={{ maxWidth: 1080, padding: "40px 32px 0", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}>
                {/* 01 · Private leagues */}
                <div
                    className="relative overflow-hidden"
                    style={{
                        background: "#FFFFFF",
                        border: "1px solid #E4E1D6",
                        borderRadius: 12,
                        padding: "26px 26px 0",
                    }}
                >
                    <div
                        className="inline-flex items-center gap-2 uppercase"
                        style={{ fontSize: 10, fontWeight: 700, color: "#9D0010", letterSpacing: 0.6 }}
                    >
                        <span style={{ width: 18, height: 2, background: "#9D0010" }} /> {t("landing.feature1.label")}
                    </div>
                    <h3
                        className="font-display"
                        style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginTop: 10, lineHeight: 1.1 }}
                    >
                        {t("landing.feature1.heading")}
                    </h3>
                    <p className="text-ink2" style={{ fontSize: 13, lineHeight: 1.5, marginTop: 8 }}>
                        {t("landing.feature1.description")}
                    </p>

                    {/* preview card */}
                    <div
                        style={{
                            marginTop: 22,
                            background: "#F4F2EC",
                            border: "1px solid #E4E1D6",
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            padding: 16,
                            borderBottom: "none",
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex items-center justify-center font-display"
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 6,
                                        background: "#9D0010",
                                        color: "#fff",
                                        fontWeight: 800,
                                        fontSize: 14,
                                    }}
                                >
                                    ⚑
                                </div>
                                <div>
                                    <div className="font-display" style={{ fontSize: 14, fontWeight: 700 }}>
                                        {t("landing.preview.leagueName")}
                                    </div>
                                    <div className="text-ink2" style={{ fontSize: 11 }}>
                                        {t("landing.preview.leagueStats")}
                                    </div>
                                </div>
                            </div>
                            <span
                                className="uppercase"
                                style={{
                                    fontSize: 10,
                                    color: "#1E3A8A",
                                    background: "#E0E7FF",
                                    padding: "4px 8px",
                                    borderRadius: 4,
                                    fontWeight: 700,
                                    letterSpacing: 0.3,
                                }}
                            >
                                {t("landing.preview.badge")}
                            </span>
                        </div>
                        <div
                            className="font-mono"
                            style={{
                                marginTop: 12,
                                fontSize: 11,
                                color: "#4A5148",
                                background: "#fff",
                                padding: "8px 10px",
                                borderRadius: 4,
                                border: "1px dashed #E4E1D6",
                            }}
                        >
                            pickthescore.app/j/4Fk9-Tm2
                        </div>
                    </div>
                </div>

                {/* 02 · Export anywhere */}
                <div
                    className="relative overflow-hidden"
                    style={{ background: "#0B0F0A", color: "#fff", borderRadius: 12, padding: "26px 26px 0" }}
                >
                    <div
                        className="inline-flex items-center gap-2 uppercase"
                        style={{ fontSize: 10, fontWeight: 700, color: "#FCA5A5", letterSpacing: 0.6 }}
                    >
                        <span style={{ width: 18, height: 2, background: "#FCA5A5" }} /> {t("landing.feature2.label")}
                    </div>
                    <h3
                        className="font-display"
                        style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginTop: 10, lineHeight: 1.1 }}
                    >
                        {t("landing.feature2.heading")
                            .split("\n")
                            .map((line, i, arr) => (
                                <span key={i}>
                                    {i === arr.length - 1 ? (
                                        <span style={{ color: "#FCA5A5" }}>{line}</span>
                                    ) : (
                                        <>
                                            {line}
                                            <br />
                                        </>
                                    )}
                                </span>
                            ))}
                    </h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, marginTop: 8 }}>
                        {t("landing.feature2.description")}
                    </p>

                    <div className="grid grid-cols-2 gap-2.5" style={{ marginTop: 22 }}>
                        {/* widget preview */}
                        <div style={{ background: "#fff", color: "#0B0F0A", borderRadius: 8, padding: 12 }}>
                            <div className="uppercase text-ink2" style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4 }}>
                                {t("landing.preview.widgetLabel")}
                            </div>
                            <div className="flex items-center gap-1.5" style={{ marginTop: 8 }}>
                                <span style={{ width: 18, height: 18, borderRadius: 9, background: "#3D195B" }} />
                                <span style={{ fontSize: 11, fontWeight: 600 }}>ARS</span>
                                <span className="text-ink2" style={{ fontSize: 9 }}>
                                    {t("common.vs")}
                                </span>
                                <span style={{ width: 18, height: 18, borderRadius: 9, background: "#DA020E" }} />
                                <span style={{ fontSize: 11, fontWeight: 600 }}>LIV</span>
                            </div>
                            <div className="flex gap-1" style={{ marginTop: 10 }}>
                                <span
                                    className="flex items-center justify-center font-display"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 4,
                                        border: "1.5px solid #9D0010",
                                        color: "#9D0010",
                                        fontSize: 13,
                                        fontWeight: 700,
                                    }}
                                >
                                    2
                                </span>
                                <span
                                    className="flex items-center justify-center font-display text-ink2"
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 4,
                                        border: "1.5px solid #E4E1D6",
                                        fontSize: 13,
                                        fontWeight: 700,
                                    }}
                                >
                                    –
                                </span>
                            </div>
                            <div className="text-ink2" style={{ fontSize: 9, marginTop: 6 }}>
                                {t("landing.preview.predictions")}
                            </div>
                        </div>

                        {/* Telegram preview */}
                        <div style={{ background: "#17212B", borderRadius: 8, padding: 12 }}>
                            <div
                                className="uppercase"
                                style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 0.4 }}
                            >
                                {t("landing.preview.telegramLabel")}
                            </div>
                            <div
                                style={{
                                    marginTop: 8,
                                    background: "rgba(255,255,255,0.06)",
                                    padding: "8px 10px",
                                    borderRadius: 6,
                                    fontSize: 11,
                                }}
                            >
                                <div style={{ color: "#6AB3F3", fontWeight: 600, fontSize: 10 }}>
                                    {t("landing.preview.botName")}
                                </div>
                                <div style={{ marginTop: 2 }}>{t("landing.preview.botMessage")}</div>
                            </div>
                            <button
                                type="button"
                                style={{
                                    marginTop: 8,
                                    width: "100%",
                                    padding: "6px 8px",
                                    background: "#2481CC",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 6,
                                    fontSize: 10,
                                    fontWeight: 600,
                                }}
                            >
                                {t("cta.openPickTheScore")}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* continuation footer row under tiles */}
            <section
                className="mx-auto grid gap-4"
                style={{ maxWidth: 1080, padding: "12px 32px 0", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))" }}
            >
                <div
                    style={{
                        background: "#FFFFFF",
                        border: "1px solid #E4E1D6",
                        borderTop: "none",
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        padding: "14px 18px",
                    }}
                    className="flex items-center justify-between"
                >
                    <span className="text-ink2" style={{ fontSize: 11 }}>
                        {t("landing.pricing")}
                    </span>
                    <Link href="/signup" style={{ fontSize: 11, fontWeight: 700, color: "#9D0010" }}>
                        {t("cta.startLeagueArrow")}
                    </Link>
                </div>
                <div
                    style={{
                        background: "#0B0F0A",
                        color: "#fff",
                        borderTop: "1px solid rgba(255,255,255,0.08)",
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        padding: "14px 18px",
                    }}
                    className="flex items-center justify-between"
                >
                    <span className="font-mono" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                        {t("landing.embedCode")}
                    </span>
                    <button type="button" style={{ fontSize: 11, fontWeight: 700, color: "#FCA5A5", background: "transparent", border: "none" }}>
                        {t("action.copy")}
                    </button>
                </div>
            </section>

            {/* soft CTA */}
            <section className="mx-auto text-center" style={{ maxWidth: 720, margin: "72px auto 0", padding: "0 32px" }}>
                <div className="uppercase text-ink2" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6 }}>
                    {t("landing.softCta")}
                </div>
                <h2 className="font-display" style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1, marginTop: 8 }}>
                    {t("landing.softCtaHeading")}
                </h2>
                <p className="text-ink2" style={{ fontSize: 15, lineHeight: 1.5, marginTop: 10 }}>
                    {t("landing.softCtaDescription")}
                </p>
                <div className="flex gap-2.5 justify-center" style={{ marginTop: 24 }}>
                    <Link
                        href="/signup"
                        style={{
                            padding: "14px 24px",
                            background: "#9D0010",
                            color: "#fff",
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: 0.2,
                        }}
                    >
                        {t("cta.predictNowArrow")}
                    </Link>
                    <a
                        href="#scoring"
                        style={{
                            padding: "14px 24px",
                            background: "transparent",
                            color: "#0B0F0A",
                            border: "1.5px solid #0B0F0A",
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 700,
                        }}
                    >
                        {t("cta.scoringWorks")}
                    </a>
                </div>
            </section>

            {/* scoring card */}
            <section id="scoring" className="mx-auto" style={{ maxWidth: 780, margin: "32px auto 48px", padding: "0 32px" }}>
                <div
                    className="shadow-s1"
                    style={{
                        background: "#FFFFFF",
                        border: "1px solid #E4E1D6",
                        borderRadius: 10,
                        padding: 24,
                    }}
                >
                    <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
                        <div>
                            <div className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>
                                {t("landing.scoring.heading")}
                            </div>
                            <div className="text-ink2" style={{ fontSize: 12, marginTop: 2 }}>
                                {t("landing.scoring.subheading")}
                            </div>
                        </div>
                        <Chip tone="brand">{t("landing.scoring.maxPoints")}</Chip>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {scoringRows.map((r) => (
                            <div
                                key={r.pts}
                                style={{
                                    padding: 14,
                                    background: "#F4F2EC",
                                    borderRadius: 6,
                                    border: "1px solid #E4E1D6",
                                }}
                            >
                                <div
                                    className="font-display"
                                    style={{ fontSize: 32, fontWeight: 700, color: "#1E3A8A", lineHeight: 1 }}
                                >
                                    +{r.pts}
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>{r.label}</div>
                                <div className="font-mono text-ink2" style={{ fontSize: 10, marginTop: 3 }}>
                                    {r.ex}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* footer */}
            <footer className="border-t border-line text-ink2" style={{ padding: "24px 32px" }}>
                <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1080, fontSize: 11 }}>
                    <span>{t("footer.copyright")}</span>
                    <span className="font-mono">{t("footer.domain")}</span>
                </div>
            </footer>
        </div>
    );
}
