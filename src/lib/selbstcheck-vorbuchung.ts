// Schalter „Selbstcheck vor der Buchung“ (SELBSTCHECK_VOR_BUCHUNG=on, standardmäßig aus).
// Reine Funktionen ohne Datenbank und ohne Cookies, damit sie in scripts/weg1-test.ts testbar sind.
// Server-Teil (Umgebung, Cookie, Kandidat) in src/lib/selbstcheck-vorbuchung-server.ts.
//
// Gemerkt wird nur: Ampel, Datum und beim Westbalkan Ländercode und Berufsgruppe. Kein Freitext.
// Die anonyme Statistik (SelfCheckResult) bleibt davon getrennt und wird nie mit dem Konto verknüpft.
import { BALKAN_GROUPS, WESTBALKAN, type BalkanGroup, type BalkanLand } from "./selfcheck";

export const BUCHEN_PFAD = "/bewerbungsservice/buchen";
/** So lange gilt ein Selbstcheck für die Buchung */
export const SELBSTCHECK_GUELTIG_TAGE = 30;
/** Cookie für Besucher:innen ohne Konto, wird bei Registrierung oder Anmeldung ins Konto übernommen und gelöscht */
export const SELBSTCHECK_COOKIE = "woyou_selbstcheck";
export const SELBSTCHECK_COOKIE_TAGE = 7;

export type Ampel = "green" | "yellow" | "red";
export type GemerkterCheck = { level: Ampel; datum: string; land?: BalkanLand; gruppe?: BalkanGroup };
export type SelfcheckMode = "warn" | "block";

const AMPEL: Ampel[] = ["green", "yellow", "red"];
const LAENDER = WESTBALKAN.map((c) => c.id) as BalkanLand[];
const isIn = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === "string" && (list as readonly string[]).includes(v);
const TAG = 86_400_000;

/** Nur genau "on" schaltet ein (Groß-/Kleinschreibung egal). Leer oder alles andere = aus. */
export const schalterAn = (v: string | undefined | null) => (v ?? "").trim().toLowerCase() === "on";
/** Wie bisher in der Selbstcheck-Seite: nur "block" sperrt, alles andere ist "warn" */
export const selfcheckModeAus = (v: string | undefined | null): SelfcheckMode => ((v ?? "").trim() === "block" ? "block" : "warn");

const isoTag = (d: Date) => d.toISOString().slice(0, 10);

/** Gemerktes Ergebnis lesen (JSON-Text aus Datenbank oder Cookie). Alles Ungültige ergibt null. */
export function parseGemerkt(raw: unknown): GemerkterCheck | null {
  let o: unknown = raw;
  if (typeof raw === "string") { if (raw.length > 300) return null; try { o = JSON.parse(raw); } catch { return null; } }
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const b = o as Record<string, unknown>;
  if (!isIn(AMPEL, b.level) || typeof b.datum !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.datum) || isNaN(Date.parse(b.datum))) return null;
  const c: GemerkterCheck = { level: b.level, datum: b.datum };
  if (isIn(LAENDER, b.land)) { c.land = b.land; if (isIn(BALKAN_GROUPS, b.gruppe)) c.gruppe = b.gruppe; }
  return c;
}

export const gemerktJson = (c: GemerkterCheck) => JSON.stringify(c);

/** Eingabe von POST /api/selbstcheck/merken: { level, land?, gruppe? }. Datum setzt der Server. */
export function gemerktAusEingabe(body: unknown, now: Date = new Date()): GemerkterCheck | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  return parseGemerkt({ level: b.level, datum: isoTag(now), land: b.land, gruppe: b.gruppe });
}

/** Gilt der Check noch (höchstens SELBSTCHECK_GUELTIG_TAGE alt, nicht in der Zukunft)? */
export function istFrisch(c: GemerkterCheck | null, now: Date = new Date()): c is GemerkterCheck {
  if (!c) return false;
  const alter = Date.parse(isoTag(now)) - Date.parse(c.datum);
  return alter >= 0 && alter <= SELBSTCHECK_GUELTIG_TAGE * TAG;
}

/** Der neuere von zwei Checks (bei gleichem Tag der erste) */
export function neuester(a: GemerkterCheck | null, b: GemerkterCheck | null): GemerkterCheck | null {
  if (!a) return b;
  if (!b) return a;
  return b.datum > a.datum ? b : a;
}

export type BuchungsSicht =
  | { art: "formular"; check: GemerkterCheck | null }
  | { art: "zumSelbstcheck" }
  | { art: "formularMitBestaetigung"; check: GemerkterCheck }
  | { art: "gesperrt"; check: GemerkterCheck };

/**
 * Was zeigt die Bestellseite (und was lässt die Buchungs-Schnittstelle zu)?
 * Aus: immer das Formular wie bisher. An: ohne Check der letzten 30 Tage zum Selbstcheck,
 * Grün/Gelb Formular, Rot mit "warn" Formular mit Pflicht-Bestätigung, Rot mit "block" kein Formular.
 */
export function buchungsSicht(p: { an: boolean; mode: SelfcheckMode; check: GemerkterCheck | null; now?: Date }): BuchungsSicht {
  if (!p.an) return { art: "formular", check: null };
  const c = p.check;
  if (!istFrisch(c, p.now)) return { art: "zumSelbstcheck" };
  if (c.level !== "red") return { art: "formular", check: c };
  return p.mode === "block" ? { art: "gesperrt", check: c } : { art: "formularMitBestaetigung", check: c };
}

/** Nur die Bestellseite ist als Ziel nach dem Selbstcheck erlaubt (keine offene Weiterleitung) */
export const erlaubtesNext = (v: string | undefined | null): string | null => (v === BUCHEN_PFAD ? BUCHEN_PFAD : null);

/** Link zum Selbstcheck mit ?next=/bewerbungsservice/buchen, vorhandene Parameter (z. B. ?land=RS) bleiben */
export function selbstcheckMitNext(href: string = "/selbstcheck"): string {
  return `${href}${href.includes("?") ? "&" : "?"}next=${encodeURIComponent(BUCHEN_PFAD)}`;
}
