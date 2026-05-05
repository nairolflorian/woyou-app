// Client-safe locale metadata. No server-only imports here.

export const LOCALES = ["de", "en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "de";
export const RTL_LOCALES: Locale[] = ["ar"];

export const LOCALE_META: Record<
  Locale,
  { label: string; flag: string; short: string }
> = {
  de: { label: "Deutsch", flag: "🇩🇪", short: "DE" },
  en: { label: "English", flag: "🇬🇧", short: "EN" },
  fr: { label: "Français", flag: "🇫🇷", short: "FR" },
  ar: { label: "العربية", flag: "🇸🇦", short: "AR" },
};
