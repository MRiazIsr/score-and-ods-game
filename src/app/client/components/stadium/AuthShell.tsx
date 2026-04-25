"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppLogo } from "./Logo";
import { AuthPreviewPanel } from "./AuthPreviewPanel";
import { LanguageSwitcher } from "@/app/client/components/ui/LanguageSwitcher";

interface AuthShellProps {
    eyebrow: string;
    headline: {
        blue: string; // upper half in brand blue
        italic: string; // lower half in italic
    };
    sub?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export function AuthShell({ eyebrow, headline, sub, children, footer }: AuthShellProps) {
    const t = useTranslations();
    return (
        <div className="min-h-screen bg-paper">
            <div className="grid min-h-screen md:grid-cols-[1.05fr_1fr] grid-cols-1 items-stretch">
                    {/* form panel */}
                    <section className="flex flex-col min-h-screen" style={{ padding: "32px 40px" }}>
                        <div className="flex items-center justify-between">
                            <Link href="/" aria-label={t("aria.back")}>
                                <AppLogo />
                            </Link>
                            <div className="flex items-center" style={{ gap: 16 }}>
                                <LanguageSwitcher />
                                <Link
                                    href="/"
                                    className="uppercase text-ink2 hover:text-ink"
                                    style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}
                                >
                                    {t("action.back")}
                                </Link>
                            </div>
                        </div>

                        <div
                            className="flex-1 flex flex-col justify-center mx-auto w-full"
                            style={{ maxWidth: 440, paddingTop: 40, paddingBottom: 40 }}
                        >
                            <div
                                className="uppercase"
                                style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "#4A5148" }}
                            >
                                {eyebrow}
                            </div>
                            <h1
                                className="font-hand"
                                style={{
                                    fontSize: 56,
                                    lineHeight: 0.95,
                                    letterSpacing: -1.8,
                                    marginTop: 10,
                                    color: "#1E3A8A",
                                    fontWeight: 400,
                                }}
                            >
                                {headline.blue}
                                <br />
                                <span style={{ color: "#9D0010", fontStyle: "italic" }}>{headline.italic}</span>
                            </h1>
                            {sub && (
                                <p className="text-ink2" style={{ fontSize: 14, lineHeight: 1.5, marginTop: 16 }}>
                                    {sub}
                                </p>
                            )}

                            <div style={{ marginTop: 28 }}>{children}</div>

                            {footer && <div style={{ marginTop: 18 }}>{footer}</div>}
                        </div>

                        <div
                            className="uppercase text-ink2"
                            style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}
                        >
                            {t("footer.copyright")}
                        </div>
                    </section>

                    {/* preview panel */}
                    <div className="hidden md:block min-h-screen">
                        <AuthPreviewPanel />
                    </div>
            </div>
        </div>
    );
}
