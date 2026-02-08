import type { Locale } from './config';
import enDict from './dictionaries/en.json';

export type Dictionary = typeof enDict;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('./dictionaries/en.json').then(m => m.default),
    ru: () => import('./dictionaries/ru.json').then(m => m.default),
    uk: () => import('./dictionaries/uk.json').then(m => m.default),
    es: () => import('./dictionaries/es.json').then(m => m.default),
    fr: () => import('./dictionaries/fr.json').then(m => m.default),
    de: () => import('./dictionaries/de.json').then(m => m.default),
    pt: () => import('./dictionaries/pt.json').then(m => m.default),
    it: () => import('./dictionaries/it.json').then(m => m.default),
    tr: () => import('./dictionaries/tr.json').then(m => m.default),
    ar: () => import('./dictionaries/ar.json').then(m => m.default),
    zh: () => import('./dictionaries/zh.json').then(m => m.default),
    ja: () => import('./dictionaries/ja.json').then(m => m.default),
    ko: () => import('./dictionaries/ko.json').then(m => m.default),
    hi: () => import('./dictionaries/hi.json').then(m => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
    return dictionaries[locale]();
}
