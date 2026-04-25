"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { SocialButton } from "./SocialButton";

const SCRIPT_SRC = "https://telegram.org/js/telegram-widget.js?22";

/**
 * Telegram Login Widget. Telegram requires their script to be injected on the page —
 * it renders an iframe-button that posts auth data to `data-auth-url` after the user
 * confirms in Telegram (mobile or desktop).
 *
 * Falls back to a disabled SocialButton placeholder if the bot username env is missing.
 */
export function TelegramLoginButton() {
    const containerRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("auth.social");
    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

    useEffect(() => {
        if (!botUsername || !containerRef.current) return;
        const container = containerRef.current;
        container.innerHTML = "";

        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.setAttribute("data-telegram-login", botUsername);
        script.setAttribute("data-size", "large");
        script.setAttribute("data-radius", "6");
        script.setAttribute("data-auth-url", "/api/auth/telegram/callback");
        script.setAttribute("data-request-access", "write");
        container.appendChild(script);

        return () => {
            container.innerHTML = "";
        };
    }, [botUsername]);

    if (!botUsername) {
        return (
            <SocialButton
                provider="telegram"
                href="#"
                label={t("continueTelegram")}
                disabled
                title={t("notConfigured")}
            />
        );
    }

    return <div ref={containerRef} style={{ display: "flex", justifyContent: "center" }} />;
}
