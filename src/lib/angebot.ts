// Angebot nach Weg 1: Bewerbungsunterlagen plus Bewerbungswerkzeug.
// Kein Guthaben je Bewerbung, kein Versand durch WoYou, kein Jobversprechen.
//
// PLATZHALTER: Preise und Laufzeiten legt Rachid fest. Alles (Startseite, Buchung, Kundenbereich, Mails,
// AGB, Stripe) liest nur von hier, eine Änderung reicht also.
// Diese Datei hat keine Server-Importe und wird auch von Testskripten genutzt.

export const ANGEBOT = {
  /** Startpaket: Unterlagen nach deutschem Standard (Lebenslauf, Anschreiben-Vorlage, Prüfung) plus Werkzeug */
  startpaket: { key: "startpaket", priceCents: 19900, toolMonths: 3 },
  /** Verlängerung des Werkzeugs, einmalig je Monat (läuft ohne Kündigung aus) */
  verlaengerung: { kind: "TOOL_MONTH", priceCents: 2900, months: 1 },
  /** Monatsabo für das Werkzeug, monatlich kündbar; beginnt erst, wenn der bezahlte Zeitraum endet */
  abo: { kind: "TOOL_SUBSCRIPTION", priceCents: 1900, months: 1 },
} as const;

export type ToolKind = typeof ANGEBOT.verlaengerung.kind | typeof ANGEBOT.abo.kind;
export const TOOL_KINDS: ToolKind[] = [ANGEBOT.verlaengerung.kind, ANGEBOT.abo.kind];
export const toolProduct = (kind: ToolKind) => (kind === ANGEBOT.abo.kind ? ANGEBOT.abo : ANGEBOT.verlaengerung);

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
  const daysLeft = active ? Math.ceil((until!.getTime() - now.getTime()) / 864e5) : 0;
  return { active, until: until ?? null, daysLeft };
}

export function formatPrice(cents: number, locale = "de") {
  return new Intl.NumberFormat(locale === "ar" ? "ar-MA" : locale, { style: "currency", currency: "EUR", maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}
