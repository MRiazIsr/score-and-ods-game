"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { setLocale as saveLocale } from "@/app/actions/locale";

const LOCALES = ["ru", "en"] as const;

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations("common");
    const [pending, startTransition] = useTransition();

    function setLocale(next: string) {
        if (next === locale) return;
        startTransition(async () => {
            await saveLocale(next);
            router.refresh();
        });
    }

    return (
        <div
            role="group"
            aria-label={t("language")}
            className="inline-flex items-center"
            style={{
                background: "#fff",
                border: "1px solid #E4E1D6",
                borderRadius: 999,
                padding: 2,
                gap: 2,
                opacity: pending ? 0.6 : 1,
                transition: "opacity 0.15s",
            }}
        >
            {LOCALES.map((code) => {
                const active = code === locale;
                return (
                    <button
                        key={code}
                        type="button"
                        onClick={() => setLocale(code)}
                        disabled={pending}
                        aria-pressed={active}
                        style={{
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            borderRadius: 999,
                            border: "none",
                            background: active ? "#1E3A8A" : "transparent",
                            color: active ? "#fff" : "#4A5148",
                            cursor: pending ? "wait" : "pointer",
                            textTransform: "uppercase",
                        }}
                    >
                        {code}
                    </button>
                );
            })}
        </div>
    );
}
