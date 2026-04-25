import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { sessionOptions } from "@/app/lib/auth/definitions";
import type { SessionData } from "@/app/lib/auth/types";

export const SUPPORTED_LOCALES = ["ru", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";

export function isLocale(value: string | undefined | null): value is Locale {
    return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export default getRequestConfig(async () => {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const locale: Locale = isLocale(session.locale) ? session.locale : DEFAULT_LOCALE;

    const messages = (await import(`../../messages/${locale}.json`)).default;

    return { locale, messages };
});
