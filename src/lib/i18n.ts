// Server-side i18n helpers. Import only from server files.

import "server-only";
import { cookies } from "next/headers";
import {
  LOCALES,
  DEFAULT_LOCALE,
  RTL_LOCALES,
  type Locale,
} from "@/lib/i18n-meta";

import dict_de from "@/i18n/de";
import dict_en from "@/i18n/en";
import dict_fr from "@/i18n/fr";
import dict_ar from "@/i18n/ar";
import dict_es from "@/i18n/es";
import dict_ru from "@/i18n/ru";
import dict_uk from "@/i18n/uk";

export { LOCALES, DEFAULT_LOCALE, RTL_LOCALES };
export type { Locale };

const DICTS: Record<Locale, Record<string, string>> = {
  de: dict_de,
  en: dict_en,
  fr: dict_fr,
  ar: dict_ar,
  es: dict_es,
  ru: dict_ru,
  uk: dict_uk,
};

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const v = c.get("woyou_locale")?.value;
  if (v && (LOCALES as readonly string[]).includes(v)) return v as Locale;
  return DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  const dict = DICTS[locale];
  function t(key: string, fallback?: string): string;
  function t(key: string, vars: Record<string, string | number>): string;
  function t(
    key: string,
    arg?: string | Record<string, string | number>
  ): string {
    const fallback = typeof arg === "string" ? arg : undefined;
    const vars = arg && typeof arg === "object" ? arg : undefined;
    const raw = dict[key] ?? fallback ?? DICTS.de[key] ?? key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, name) =>
      vars[name] != null ? String(vars[name]) : `{${name}}`
    );
  }
  return { t, locale, isRTL: RTL_LOCALES.includes(locale) };
}

export function tFor(locale: Locale) {
  const dict = DICTS[locale];
  return (key: string, fallback?: string) =>
    dict[key] ?? fallback ?? DICTS.de[key] ?? key;
}

// Builds the dict that's shipped to the client via TranslationProvider.
// Merges the active locale on top of German fallbacks so client components
// don't see English keys when a translation is missing.
export async function getDictForClient() {
  const locale = await getLocale();
  return {
    dict: { ...DICTS.de, ...DICTS[locale] },
    locale,
    isRTL: RTL_LOCALES.includes(locale),
  };
}
