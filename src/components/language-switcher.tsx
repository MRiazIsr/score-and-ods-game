'use client';

import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { locales, LOCALE_COOKIE, type Locale } from '@/i18n/config';

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        document.cookie = `${LOCALE_COOKIE}=${e.target.value};path=/;max-age=31536000;SameSite=Lax`;
        router.refresh();
    };

    return (
        <div className="relative inline-flex items-center">
            <Globe className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <select
                value={currentLocale}
                onChange={handleChange}
                className="cursor-pointer appearance-none rounded-full border bg-background py-1.5 pl-9 pr-4 text-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {locales.map(locale => (
                    <option key={locale.code} value={locale.code}>
                        {locale.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
