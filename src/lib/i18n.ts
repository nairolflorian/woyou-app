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

export { LOCALES, DEFAULT_LOCALE, RTL_LOCALES };
export type { Locale };

const DICTS: Record<Locale, Record<string, string>> = {
  de: dict_de,
  en: dict_en,
  fr: dict_fr,
  ar: dict_ar,
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
  const t = (key: string, fallback?: string) =>
    dict[key] ?? fallback ?? DICTS.de[key] ?? key;
  return { t, locale, isRTL: RTL_LOCALES.includes(locale) };
}

export function tFor(locale: Locale) {
  const dict = DICTS[locale];
  return (key: string, fallback?: string) =>
    dict[key] ?? fallback ?? DICTS.de[key] ?? key;
}
