import { cookies, headers } from 'next/headers';
import { defaultLocale, isValidLocale, LOCALE_COOKIE, type Locale } from './config';

export async function getLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get(LOCALE_COOKIE);

    if (localeCookie && isValidLocale(localeCookie.value)) {
        return localeCookie.value;
    }

    const headerStore = await headers();
    const acceptLanguage = headerStore.get('accept-language');

    if (acceptLanguage) {
        const preferred = acceptLanguage
            .split(',')
            .map(lang => lang.split(';')[0].trim().substring(0, 2).toLowerCase());

        for (const lang of preferred) {
            if (isValidLocale(lang)) return lang;
        }
    }

    return defaultLocale;
}
