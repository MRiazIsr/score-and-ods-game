"use client";

import { useTranslations } from "next-intl";
import { SocialButton } from "./SocialButton";
import { TelegramLoginButton } from "./TelegramLoginButton";

/**
 * Social auth section: Google + Telegram buttons followed by an "or" divider.
 * Rendered above the email/password form on /login and /signup.
 */
export function SocialAuthBlock() {
    const t = useTranslations("auth.social");

    return (
        <div style={{ marginBottom: 22 }}>
            <div className="grid" style={{ gap: 8, marginBottom: 14 }}>
                <SocialButton
                    provider="google"
                    href="/api/auth/google"
                    label={t("continueGoogle")}
                />
                <TelegramLoginButton />
            </div>
            <div
                className="flex items-center"
                style={{ gap: 10, color: "#4A5148", fontSize: 11, fontWeight: 600 }}
            >
                <span style={{ height: 1, flex: 1, background: "#E4E1D6" }} />
                <span className="uppercase" style={{ letterSpacing: 0.6 }}>
                    {t("or")}
                </span>
                <span style={{ height: 1, flex: 1, background: "#E4E1D6" }} />
            </div>
        </div>
    );
}
