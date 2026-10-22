// Weg 1: Kernlogik des Bewerbungswerkzeugs ohne Server- oder Datenbank-Abhängigkeiten
// (Deutschniveau, Filter, Sortierung, Dubletten, Suchvorschläge, Tracker-Stand, E-Mail-Link).
// Wird von src/lib/stellensuche.ts, den API-Routen, den Client-Komponenten und scripts/weg1-test.ts genutzt.

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];
export type Hours = "alle" | "vollzeit" | "teilzeit";
export type GermanFit = "ok" | "close" | "high" | "req" | "none";
export type Source = "BA" | "ARBEITNOW" | "ADZUNA" | "KARRIERESEITE" | "MANUAL";

export const SOURCE_NAME: Record<Source, string> = {
  BA: "Bundesagentur für Arbeit", ARBEITNOW: "Arbeitnow", ADZUNA: "Adzuna", KARRIERESEITE: "Karriereseite", MANUAL: "selbst eingetragen",
};

/** Ein Suchtreffer, wie ihn die Kundin bzw. der Kunde sieht */
export type Treffer = {
  key: string; source: Source; ref: string; title: string; company: string; city: string;
  url: string; applyUrl: string | null; email: string | null;
  distanceKm?: number; publishedAt?: string; fulltime: boolean; parttime: boolean;
  germanRequired: Level | null; fit: GermanFit;
};

export const trefferKey = (source: string, ref: string) => `${source}:${ref}`;

/** Gefordertes Deutschniveau aus dem Ausschreibungstext (Regeln, keine KI) */
export function germanRequired(text: string): Level | null {
  const t = text.replace(/\s+/g, " ");
  const m = t.match(/deutsch\w*[^.]{0,60}?\b(A1|A2|B1|B2|C1|C2)\b/i) || t.match(/\b(A1|A2|B1|B2|C1|C2)\b[^.]{0,40}?deutsch/i);
  if (m) return m[1].toUpperCase() as Level;
  if (/(sehr gute|fließende|fliessende|verhandlungssichere|exzellente)[^.]{0,30}deutsch/i.test(t)) return "B2";
  if (/gute[^.]{0,20}deutsch/i.test(t)) return "B1";
  if (/(grundkenntnisse|grundlegende)[^.]{0,30}deutsch/i.test(t)) return "A2";
  return null;
}

/** Niveau aus Freitext („B1“, „Muttersprache“, „native“) */
export function parseLevel(s: string | null | undefined): Level | null {
  if (!s) return null;
  const m = s.toUpperCase().match(/A1|A2|B1|B2|C1|C2/);
  if (m) return m[0] as Level;
  if (/muttersprache|native|langue maternelle/i.test(s)) return "C2";
  return null;
}

/** Deutsch-Hinweis: passt das eigene Niveau zur Anforderung der Stelle? */
export function germanFit(required: Level | null, have: Level | null): GermanFit {
  if (!required) return "none";
  if (!have) return "req";
  const d = LEVELS.indexOf(have) - LEVELS.indexOf(required);
  return d >= 0 ? "ok" : d === -1 ? "close" : "high";
}

/** Arbeitszeit-Filter. Stellen ohne Angabe (beides false) bleiben drin. */
export function matchesHours(t: { fulltime: boolean; parttime: boolean }, h: Hours) {
  if (h === "alle" || (!t.fulltime && !t.parttime)) return true;
  return h === "vollzeit" ? t.fulltime : t.parttime;
}

/** „Nur passendes Deutsch“: zu hohe Anforderung raus, knapp und ohne Angabe bleiben drin */
export const matchesGerman = (t: { fit: GermanFit }, onlyFitting: boolean) => !onlyFitting || t.fit !== "high";

export const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/\(.*?\)/g, " ").replace(/[^a-z0-9äöüß ]+/g, " ").replace(/\s+/g, " ").trim();
const words = (s: string) => norm(s).split(" ").filter((w) => w.length > 3);

/** Dieselbe Stelle aus mehreren Quellen (gleiche Firma + Titel) nur einmal; die erste Quelle gewinnt */
export function dedupe<T extends { key: string; company: string; title: string }>(list: T[]): T[] {
  const seenKey = new Set<string>(), seenJob = new Set<string>();
  return list.filter((x) => {
    const j = `${norm(x.company)}|${norm(x.title)}`;
    if (seenKey.has(x.key) || seenJob.has(j)) return false;
    seenKey.add(x.key); seenJob.add(j);
    return true;
  });
}

/** Reihenfolge: Beruf passt zum Suchbegriff, Deutsch passt, nah, neu */
export function rank<T extends Pick<Treffer, "title" | "fit" | "distanceKm" | "publishedAt">>(list: T[], was: string, now = Date.now()): T[] {
  const q = norm(was), qw = words(was);
  const score = (t: T) => {
    const title = norm(t.title);
    let s = title.includes(q) ? 40 : qw.some((w) => title.includes(w.slice(0, Math.max(5, w.length - 2)))) ? 25 : 10;
    s += { ok: 15, none: 10, req: 8, close: 5, high: 0 }[t.fit];
    if (t.distanceKm !== undefined) s += t.distanceKm <= 10 ? 10 : t.distanceKm <= 25 ? 7 : t.distanceKm <= 50 ? 4 : 0;
    const days = t.publishedAt ? (now - new Date(t.publishedAt).getTime()) / 864e5 : 60;
    s += days <= 7 ? 6 : days <= 30 ? 3 : 0;
    return s;
  };
  return list.map((t, i) => ({ t, i, s: score(t) })).sort((a, b) => b.s - a.s || a.i - b.i).map((x) => x.t);
}

/** Suchvorschläge aus dem eigenen Profil (Wunschberuf, gebuchte Berufe, Berufserfahrung), ohne Dubletten */
export function profileTerms(input: { targetJob?: string | null; bookingJobs?: string | null; desiredJob?: string | null; experience?: (string | null | undefined)[]; alternatives?: string[] }): string[] {
  // „/“ nur mit Leerzeichen trennen, damit „Altenpfleger/in“ ganz bleibt
  const split = (s?: string | null) => (s || "").split(/[,;\n]| \/ | oder | und /).map((x) => x.trim()).filter((x) => x.length > 2);
  const all = [input.targetJob ?? "", ...split(input.bookingJobs), input.desiredJob ?? "", ...(input.alternatives ?? []), ...(input.experience ?? [])].map((x) => (x || "").trim()).filter((x) => x.length > 2);
  const out: string[] = [], seen = new Set<string>();
  for (const t of all) { const k = norm(t); if (k && !seen.has(k)) { seen.add(k); out.push(t.slice(0, 80)); } }
  return out.slice(0, 6);
}

/** Ort aus „Wunschregion“ (erste Angabe, ohne „Deutschland“, „egal“ usw.) */
export function profileRegion(...candidates: (string | null | undefined)[]): string {
  for (const c of candidates) {
    const first = (c || "").split(/[,;/\n]/).map((x) => x.trim()).find((x) => x && !/deutschland|germany|egal|bundesweit|überall|ueberall/i.test(x));
    if (first) return first.slice(0, 80);
  }
  return "";
}

// ---------- Tracker ----------
export const TRACKER_STATUS = ["SAVED", "APPLIED", "REPLY", "INTERVIEW", "REJECTED", "OFFER"] as const;
export type TrackerStatus = (typeof TRACKER_STATUS)[number];
export const isTrackerStatus = (s: unknown): s is TrackerStatus => typeof s === "string" && (TRACKER_STATUS as readonly string[]).includes(s);

type Dates = { appliedAt: Date | null; repliedAt: Date | null; interviewAt: Date | null; closedAt: Date | null };

/**
 * Neuer Stand im Tracker: setzt die passenden Daten, ohne schon eingetragene zu überschreiben.
 * Alles nach „beworben“ setzt auch „beworben am“, falls noch leer. Zurück auf „gemerkt“ leert die Daten.
 */
export function nextTrackerState(current: Dates, status: TrackerStatus, now = new Date()): Dates & { status: TrackerStatus } {
  if (status === "SAVED") return { status, appliedAt: null, repliedAt: null, interviewAt: null, closedAt: null };
  const d: Dates = { ...current };
  d.appliedAt ??= now;
  if (status === "REPLY") d.repliedAt ??= now;
  if (status === "INTERVIEW") { d.repliedAt ??= now; d.interviewAt ??= now; }
  if (status === "REJECTED" || status === "OFFER") { d.repliedAt ??= now; d.closedAt = current.closedAt ?? now; }
  else d.closedAt = null;
  return { status, ...d };
}

// ---------- E-Mail-Programm öffnen ----------
const EMAIL = /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/;
export const isEmail = (s: string | null | undefined): s is string => !!s && EMAIL.test(s.trim());
export const isHttpUrl = (s: string | null | undefined): s is string => { try { const u = new URL(String(s)); return u.protocol === "https:" || u.protocol === "http:"; } catch { return false; } };

/** mailto-Link mit Betreff und Text. Lange Texte werden gekürzt, weil manche Programme sonst nichts öffnen. */
export function mailtoHref(to: string, subject: string, body: string, maxLength = 1800): string | null {
  if (!isEmail(to)) return null;
  let b = body;
  const href = (x: string) => `mailto:${encodeURIComponent(to.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(x)}`;
  while (href(b).length > maxLength && b.length > 50) b = b.slice(0, Math.floor(b.length * 0.9));
  return href(b);
}

/** Kurzer Begleittext für die E-Mail (das Anschreiben selbst hängt die Person als PDF an) */
export function coverMail(o: { lang: "de" | "en"; title: string; salutation: string; name: string; phone?: string }) {
  const lines = o.lang === "en"
    ? [o.salutation, "", `Please find attached my application for the position of ${o.title}, including my cover letter and CV.`, "", "I look forward to hearing from you.", "", "Kind regards", o.name, o.phone ?? ""]
    : [o.salutation, "", `anbei sende ich Ihnen meine Bewerbung als ${o.title}. Mein Anschreiben und meinen Lebenslauf finden Sie im Anhang.`, "", "Ich freue mich auf Ihre Rückmeldung.", "", "Mit freundlichen Grüßen", o.name, o.phone ?? ""];
  return lines.join("\n").trim();
}
