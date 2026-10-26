// Pilot Westbalkan (Konzept v4, 25.10.2026): Kennzahlen für die Go/No-Go-Entscheidung Ende Januar 2027.
// Reine Funktionen ohne Datenbank, damit sie in scripts/weg1-test.ts testbar sind. Datenbankzugriff in src/lib/report.ts.
import { BALKAN_GROUPS, UNTERLAGEN_BIS, WESTBALKAN, balkanLand, type BalkanGroup, type BalkanLand, type Level } from "./selfcheck";
import { LOCALES } from "./i18n-meta";

// Pilotzeitraum: Soft Launch ab 17.11.2026, bezahlt ab 01.12.2026, Auswertung bis 16.01.2027 (Entscheidung Ende Januar).
// Bei Verschiebung nur hier anpassen. Zeiten in deutscher Winterzeit.
export const PILOT = {
  start: new Date("2026-11-17T00:00:00+01:00"),
  bezahltAb: new Date("2026-12-01T00:00:00+01:00"),
  ende: new Date("2027-01-16T23:59:59.999+01:00"),
};

// Ziele aus dem Konzept v4. Werte in Stück bzw. Prozent.
export type Ziel = { min?: number; max?: number; weniger?: boolean };
export const PILOT_ZIELE = {
  selbstchecks: { min: 1500 } as Ziel,
  anteilSinnvoll: { min: 40, max: 50 } as Ziel,
  buchungen: { min: 80, max: 120 } as Ziel,
  stornoQuote: { max: 5, weniger: true } as Ziel,
  mappenBis: { min: 80 } as Ziel,
};

// Stichtag „Unterlagen fertig“ (UNTERLAGEN_BIS aus selfcheck.ts) im Pilotjahr, Ende des Tages
export function unterlagenStichtag(start: Date = PILOT.start): Date {
  const y = start.getFullYear() + (UNTERLAGEN_BIS.month < start.getMonth() + 1 ? 1 : 0);
  const mm = String(UNTERLAGEN_BIS.month).padStart(2, "0"), dd = String(UNTERLAGEN_BIS.day).padStart(2, "0");
  return new Date(`${y}-${mm}-${dd}T23:59:59.999+01:00`);
}

// ---------- Eingabe für POST /api/selbstcheck/ergebnis ----------
// Gespeichert wird nur, was hier durchkommt: Ländercode, Berufsgruppe, Deutschniveau, Ampel, Sprache, Werbequelle.
// Kein Freitext (Beruf und Land als Text bleiben im Browser), keine Nutzer-ID, keine IP.
export const LAND_CODES = [...WESTBALKAN.map((c) => c.id), "other"] as const;
export type LandCode = BalkanLand | "other";
const GERMAN: Level[] = ["none", "A1", "A2", "B1", "B2", "C1"];
const LEVELS = ["green", "yellow", "red"] as const;
export type Ampel = (typeof LEVELS)[number];
export type SelbstcheckEingabe = { country: LandCode; balkan: boolean; gruppe: BalkanGroup | null; german: Level | null; level: Ampel; locale: string | null; source: string | null };

const isIn = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === "string" && (list as readonly string[]).includes(v);

/** null = ungültig. Unbekannte Felder werden ignoriert und nicht gespeichert. */
export function parseSelbstcheckErgebnis(body: unknown): SelbstcheckEingabe | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  if (!isIn(LAND_CODES, b.country) || !isIn(LEVELS, b.level)) return null;
  const balkan = b.country !== "other";
  if (b.balkan !== undefined && b.balkan !== balkan) return null;
  // Berufsgruppe gibt es nur im Westbalkan-Weg und dort ist sie Pflicht
  let gruppe: BalkanGroup | null = null;
  if (balkan) { if (!isIn(BALKAN_GROUPS, b.gruppe)) return null; gruppe = b.gruppe; }
  else if (b.gruppe !== undefined && b.gruppe !== null && b.gruppe !== "") return null;
  let german: Level | null = null;
  if (b.german !== undefined && b.german !== null) { if (!isIn(GERMAN, b.german)) return null; german = b.german; }
  const locale = isIn(LOCALES, b.locale) ? b.locale : null;
  // utm_source: nur kurze Kennungen wie „facebook“ oder „partner-rs“, alles andere fällt weg
  const src = typeof b.source === "string" ? b.source.trim().toLowerCase() : "";
  const source = /^[a-z0-9][a-z0-9._-]{0,39}$/.test(src) ? src : null;
  return { country: b.country, balkan, gruppe, german, level: b.level, locale, source };
}

// Staatsangehörigkeit steht oft als Adjektiv im Profil („serbisch“, „Albanian“, „bosanski“) oder als Code („RS“)
const NATIONALITAET: [BalkanLand, RegExp][] = [
  ["XK", /kosov/], ["MK", /mazedon|makedon|macedon/], ["ME", /montenegr|crnogor/],
  ["BA", /\bbosn|\bbosan|herzegov|herzegow|\bbih\b/], ["AL", /\balban|\bshqip/], ["RS", /\bserb|\bsrb|\bsrp/],
];
const CODE = /^(RS|BA|ME|XK|MK|AL)$/;
function landAusText(t: string): BalkanLand | null {
  const raw = t.trim();
  if (CODE.test(raw)) return raw as BalkanLand;
  const l = balkanLand(raw);
  if (l) return l;
  const v = raw.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  return NATIONALITAET.find(([, re]) => re.test(v))?.[0] ?? null;
}

/** Ländercode für die Statistik aus Freitext (Kundendaten im Report); erster erkannter Text gewinnt */
export const landCode = (...texte: (string | null | undefined)[]): LandCode => {
  for (const t of texte) { const l = t ? landAusText(t) : null; if (l) return l; }
  return "other";
};

// ---------- Auswertung ----------
export const pct1 = (a: number, b: number): number | null => (b ? Math.round((a / b) * 1000) / 10 : null);

export type AmpelZahlen = { total: number; green: number; yellow: number; red: number; greenPct: number | null };
export function ampelZahlen(rows: { level: string }[]): AmpelZahlen {
  const c = (l: string) => rows.filter((r) => r.level === l).length;
  const green = c("green");
  return { total: rows.length, green, yellow: c("yellow"), red: c("red"), greenPct: pct1(green, rows.length) };
}

/** Gruppiert nach Schlüssel, je Gruppe Anzahl und Anteil Grün; größte Gruppe zuerst */
export function nachSchluessel<T extends { level: string }>(rows: T[], key: (r: T) => string): ({ key: string } & AmpelZahlen)[] {
  const m = new Map<string, T[]>();
  for (const r of rows) { const k = key(r); m.set(k, [...(m.get(k) ?? []), r]); }
  return [...m.entries()].map(([k, xs]) => ({ key: k, ...ampelZahlen(xs) })).sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));
}

export type ZielStatus = "keine Daten" | "unter Ziel" | "im Ziel" | "über Ziel";
export function zielStatus(ist: number | null, z: Ziel): ZielStatus {
  if (ist === null) return "keine Daten";
  if (z.min !== undefined && ist < z.min) return "unter Ziel";
  if (z.max !== undefined && ist > z.max) return "über Ziel";
  return "im Ziel";
}

/** Lineare Hochrechnung bis zum Pilotende (null vor dem Start). Nach dem Ende = Ist-Wert. */
export function hochrechnung(ist: number, now: Date, start = PILOT.start, ende = PILOT.ende): number | null {
  if (now < start) return null;
  if (now >= ende) return ist;
  const lauf = Math.max(1, now.getTime() - start.getTime());
  return Math.round(ist * ((ende.getTime() - start.getTime()) / lauf));
}

export type PilotBuchung = { status: string; createdAt: Date; paidAt: Date | null; approvedAt: Date | null };

// Storno = bezahlt und danach storniert (Widerruf, Erstattung). Automatisch verworfene, nie bezahlte Checkouts zählen nicht.
// Der Grund („Ich dachte, ihr vermittelt“) wird bisher nicht erfasst; die Quote ist daher eine Obergrenze.
export const istStorno = (b: { status: string; paidAt: Date | null }) => b.status === "CANCELLED" && !!b.paidAt;

export function stornoQuote(bs: PilotBuchung[]): { bezahlt: number; storniert: number; pct: number | null } {
  const bezahlt = bs.filter((b) => b.paidAt), storniert = bezahlt.filter(istStorno).length;
  return { bezahlt: bezahlt.length, storniert, pct: pct1(storniert, bezahlt.length) };
}

/**
 * „Mappen fertig bis Stichtag“: Kund:innen, die vom Pilotstart bis zum Stichtag gebucht haben (Soft Launch auch ohne
 * Zahlung, ab „bezahlt ab“ nur bezahlte), ohne Stornos. Fertig = Mappe bis zum Stichtag freigegeben.
 */
export function mappenBis(bs: PilotBuchung[], stichtag = unterlagenStichtag(), start = PILOT.start, bezahltAb = PILOT.bezahltAb) {
  const basis = bs.filter((b) => b.createdAt >= start && b.createdAt <= stichtag && b.status !== "CANCELLED" && (b.paidAt || b.createdAt < bezahltAb));
  const fertig = basis.filter((b) => b.approvedAt && b.approvedAt <= stichtag).length;
  return { basis: basis.length, fertig, pct: pct1(fertig, basis.length) };
}

// Bezeichnungen für die Admin-Seite (nur Deutsch)
export const LAND_LABEL: Record<LandCode, string> = {
  ...(Object.fromEntries(WESTBALKAN.map((c) => [c.id, c.names.de])) as Record<BalkanLand, string>),
  other: "andere Länder oder ohne Angabe",
};
export const GRUPPE_LABEL: Record<BalkanGroup, string> = {
  ce: "Lkw-Fahrer (CE)", c: "Lkw-Fahrer (C)", bus: "Busfahrer", lager: "Lager / Kommissionierung", stapler: "Staplerfahrer", dispo: "Disposition", andere: "etwas anderes",
};
