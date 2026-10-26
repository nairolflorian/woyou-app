// Angebot nach Weg 1: Bewerbungsunterlagen plus Bewerbungswerkzeug.
// Kein Guthaben je Bewerbung, kein Versand durch WoYou, kein Jobversprechen.
//
// Entscheidung Geschäftsführung (23.10.2026): Es gibt NUR das Startpaket. Keine Verlängerung, kein Abo.
// Nach Ablauf der Werkzeug-Monate sind Stellensuche und Tracker gesperrt; die eigenen Unterlagen
// (Mappe, Lebenslauf, Anschreiben als PDF) bleiben herunterladbar.
// Alles (Startseite, Buchung, Kundenbereich, Mails, AGB, Stripe) liest nur von hier.
// Diese Datei hat keine Server-Importe und wird auch von Testskripten genutzt.

export const ANGEBOT = {
  /** Startpaket: Unterlagen nach deutschem Standard (Lebenslauf, Anschreiben-Vorlage, Prüfung) plus Werkzeug */
  startpaket: { key: "startpaket", priceCents: 19900, toolMonths: 3 },
} as const;

/** Lieferzeit der Unterlagen: fertig innerhalb so vieler Werktage, nachdem die vollständige Mappe eingereicht ist (Bestellseite, Buchungsbestätigung) */
export const MAPPE_FERTIG_WERKTAGE = 5;

/**
 * ALT: frühere Werkzeug-Verlängerung (TOOL_MONTH) und Monatsabo (TOOL_SUBSCRIPTION). Wurden nie verkauft und
 * können nicht mehr angelegt werden. Nur noch, damit Admin, Auswertung und Stripe-Webhook alte Datensätze bzw.
 * Ereignisse erkennen (Sicherheit), falls doch einmal welche auftauchen.
 */
export const LEGACY_TOOL_KINDS = ["TOOL_MONTH", "TOOL_SUBSCRIPTION"] as const;
export type LegacyToolKind = (typeof LEGACY_TOOL_KINDS)[number];
export const isLegacyToolKind = (kind: string): kind is LegacyToolKind => (LEGACY_TOOL_KINDS as readonly string[]).includes(kind);

/** Monate zu einem Datum addieren; am Monatsende auf den letzten Tag des Zielmonats kappen (31.01. + 1 = 28./29.02.) */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

/** Neues Ende des Werkzeug-Zugangs: läuft er noch, wird hinten angehängt, sonst ab heute */
export function extendUntil(current: Date | null | undefined, months: number, now = new Date()): Date {
  const base = current && current > now ? current : now;
  return addMonths(base, months);
}

/** Stand des Werkzeugs zu einem Zeitpunkt */
export function toolState(until: Date | null | undefined, now = new Date()) {
  const active = !!until && until > now;
  // Kalendertage (unabhängig von Sommer-/Winterzeit)
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const daysLeft = active ? Math.max(0, Math.round((day(until!) - day(now)) / 864e5)) : 0;
  return { active, until: until ?? null, daysLeft };
}

export function formatPrice(cents: number, locale = "de") {
  // ar-MA: lateinische Ziffern; sr-Latn-RS: lateinische Schrift (nur "sr" wäre Kyrillisch); te-IN: lateinische Ziffern
  return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale === "sr" ? "sr-Latn-RS" : locale === "te" ? "te-IN" : locale, { style: "currency", currency: "EUR", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}
