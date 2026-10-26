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
  /** Hinweise für Fahrer- und Logistikstellen aus dem Anzeigentext (fehlt bei älteren bzw. selbst eingetragenen Stellen) */
  hinweise?: FahrerHinweise;
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
  // Fahrer- und Logistikberufe: zuerst die deutschen Suchbegriffe der Jobbörse, danach die eigene Angabe
  const expanded = all.flatMap((t) => { const f = fahrerSuchbegriffe(t); return f ? [...f, ...(/[()/]/.test(t) ? [] : [t])] : [t]; });
  for (const t of expanded) { const k = norm(t); if (k && !seen.has(k)) { seen.add(k); out.push(t.slice(0, 80)); } }
  return out.slice(0, 6);
}

/**
 * Bessere deutsche Suchbegriffe für Fahrer- und Logistikberufe (Pilot Westbalkan): aus „truck driver“, „vozač kamiona“,
 * „Fahrer:in (LKW / PKW)“ usw. werden Begriffe, unter denen die Jobbörse wirklich Stellen führt. Andere Berufe: null.
 * Schon genaue deutsche Berufe (Fachkraft, Meister, Fachlagerist) bleiben unverändert.
 */
export function fahrerSuchbegriffe(term: string): string[] | null {
  const t = term.toLowerCase();
  if (/fachkraft|meister|fachlagerist|bestand/.test(t)) return null;
  if (/disponent|dispatch|dispečer|dispecer|disponib|planificateur|transport ?planner|fuhrpark|fleet/.test(t)) return ["Disponent"];
  if (/stapler|forklift|viljuškar|viljuskar|cariste|chariot|फ़ोर्कलिफ्ट|फोर्कलिफ्ट|ఫోర్క్‌లిఫ్ట్|رافعة شوكية/.test(t)) return ["Staplerfahrer", "Lagerhelfer"];
  if (/\bbus|omnibus|autobus|coach driver|अबस|बस ड्राइवर|బస్|حافلة|باص/.test(t)) return ["Busfahrer", "Berufskraftfahrer Personenverkehr"];
  if (/taxi|kurier|courier|zusteller|ausliefer|pkw-?fahrer$|uber/.test(t)) return null;
  if (/lkw|lastkraftwagen|kraftfahrer|truck|lorry|hgv|camion|poids lourd|kamion|\b(c|ce|c\/ce)-?fahrer|fahrer|driver|chauffeur|vozač|vozac|ट्रक|ड्राइवर|ట్రక్|డ్రైవర్|سائق|شاحنة/.test(t)) return ["Berufskraftfahrer", "Lkw-Fahrer CE", "Kraftfahrer"];
  if (/lager|warehouse|magasin|magacin|skladi|kommissionier|picker|entrep[oô]t|logisti|गोदाम|గోదాం|مستودع/.test(t)) return ["Lagerhelfer", "Lagermitarbeiter", "Kommissionierer"];
  return null;
}

/** Ort aus „Wunschregion“ (erste Angabe, ohne „Deutschland“, „egal“ usw.) */
export function profileRegion(...candidates: (string | null | undefined)[]): string {
  for (const c of candidates) {
    const first = (c || "").split(/[,;/\n]/).map((x) => x.trim()).find((x) => x && !/deutschland|germany|egal|bundesweit|überall|ueberall/i.test(x));
    if (first) return first.slice(0, 80);
  }
  return "";
}

// ---------- Hinweise für Fahrer- und Logistikstellen ----------
// Regeln, keine KI. Die Hinweise beschreiben nur, was in der Anzeige steht, und bewerten nichts.

export type FahrerHinweise = {
  /** Anzeige sagt: Grundqualifikation (Code 95, BKrFQG, Modul 95) wird gestellt, bezahlt oder bei der Firma erworben */
  gqGestellt: boolean;
  /** Anzeige verlangt Code 95, Grundqualifikation, Schlüsselzahl 95 oder Fahrerkarte (nur wenn nicht gestellt) */
  code95: boolean;
  /** genannte Führerscheinklassen (C1, C1E, C, CE, D1, D1E, D, DE) */
  klassen: string[];
  adr: boolean;
  stapler: boolean;
  /** Westbalkanregelung genannt oder Bewerbungen aus den Westbalkan-Ländern ausdrücklich willkommen */
  westbalkan: boolean;
};

export const KEINE_HINWEISE: FahrerHinweise = { gqGestellt: false, code95: false, klassen: [], adr: false, stapler: false, westbalkan: false };
export const hatHinweise = (h?: FahrerHinweise | null) => !!h && (h.gqGestellt || h.code95 || h.klassen.length > 0 || h.adr || h.stapler || h.westbalkan);

// Begriffe der Grundqualifikation (nicht „Berufskraftfahrer“ allein, das ist ein Berufsname)
const GQ = String.raw`(?:beschleunigte\s+)?grundqualifikation\w*|berufskraftfahrer-?qualifikation\w*|qualifikation\s+(?:zum|als)\s+berufskraftfahrer\w*|bkrfqg|code\s*95|modul(?:e|en)?\s*95|schlüsselzahl\s*95|eu-?fahrerqualifizierungsnachweis|fahrerqualifizierungsnachweis|driver\s*cpc|\bcpc\b|certificate\s+of\s+professional\s+competence|initial\s+qualification`;
// „wird gestellt“ und Ähnliches direkt nach dem Begriff („Grundqualifikation wird gestellt“, „Code 95 wird bezahlt“)
const GIVEN_AFTER = String.raw`gestellt|übernommen|übernehmen\s+wir|übernimmt\s+(?:der|die|das|unser\w*)\s+\w+|finanziert|finanzieren\s+wir|bezahlt|bezahlen\s+wir|zahlen\s+wir|erstattet|erstatten\s+wir|ermöglicht|ermöglichen\s+wir|kostenlos|kostenfrei|gratis|auf\s+unsere\s+kosten|bei\s+uns\s+(?:machen|erwerben|absolvieren)|im\s+unternehmen\s+(?:machen|erwerben)|provided|paid|covered|funded|sponsored|free\s+of\s+charge|at\s+our\s+(?:cost|expense)`;
// „… Kosten übernehmen wir“ nach dem Begriff („Code 95 erforderlich, die Kosten dafür übernehmen wir“)
const GIVEN_COST = String.raw`\b(?:kosten|costs?)(?:\s+(?:dafür|hierfür|hierzu|davon|werden|wird|are|is|will\s+be))*\s+(?:wir\s+)?(?:übernehmen|übernommen|übernimmt|tragen|trägt|getragen|erstatten|erstattet|zahlen|bezahlt|covered|paid)`;
// „Wir übernehmen die Kosten für …“ vor dem Begriff
const GIVEN_BEFORE = String.raw`kostenübernahme|übernahme\s+der\s+kosten|wir\s+übernehmen|übernehmen\s+wir|übernimmt\s+(?:\S+\s+){0,3}?kosten|wir\s+finanzieren|finanzieren\s+wir|finanzierung|wir\s+bezahlen|bezahlen\s+wir|wir\s+zahlen|zahlen\s+wir|wir\s+erstatten|wir\s+ermöglichen|ermöglichen\s+wir|wir\s+bieten|bieten\s+wir|erhalten\s+(?:sie|du)\s+bei\s+uns|(?:we|company)\s+(?:will\s+)?(?:pay|cover|provide|fund|sponsor|offer)`;
// direkt nach dem Begriff: dann ist er eine Anforderung, kein Angebot
const REQUIRED_NEXT = /^\W{0,3}(?:\(\S*\)\s*)?(?:ist\s+|wird\s+|is\s+)?(?:erforderlich|vorausgesetzt|pflicht|zwingend|notwendig|nötig|required|mandatory|necessary|mitbringen|vorhanden)/i;
const BETWEEN_BAD = /\b(?:und|sowie|and|erforderlich|vorausgesetzt|required|notwendig|nötig|vorhanden|pflicht)\b|[,:]/i;
const NEGATED = /\b(?:nicht|not|keine?|no)\b\s*(?:\S+\s+){0,2}?(?:gestellt|übernommen|übernehmen|finanziert|bezahlt|erstattet|kostenübernahme|übernahme|finanzierung|provided|paid|covered|funded)|(?:übernehmen|zahlen|bezahlen|finanzieren|erstatten)\s+wir\s+nicht|auf\s+eigene\s+kosten|selbst\s*zahler|selbst\s+(?:zu\s+)?(?:zahlen|tragen)|must\s+be\s+provided|mitbringen|vorausgesetzt/i;
const OPTIONAL = /wünschenswert|von\s+vorteil|vorteilhaft|optional|nice\s+to\s+have|gerne\s+gesehen|\bplus\b/i;

const KLASSE = String.raw`C1E|C1|CE|C|D1E|D1|DE|D`;
// Klasse nur als ganzes Wort, „C-Teile“ zählt nicht, „C-Führerschein“ schon
const KL_TOKEN = String.raw`(?<![A-Za-z0-9ÄÖÜäöüß])(?:${KLASSE})(?![A-Za-z0-9ÄÖÜäöüß])(?!-(?![Ff]ührer|[Ff]ahr|[Kk]lass|[Ll]izenz|[Ss]chein))`;
const KL_LIST = String.raw`${KL_TOKEN}(?:\s*(?:\/|,|\+|&|und|and|oder|or|bzw\.?)\s*${KL_TOKEN})*`;
// Zusammenhang, ohne den ein einzelnes „C“ oder „D“ nicht als Führerscheinklasse zählt
const KL_CONTEXT = String.raw`(?:[Ff]ührerschein\w*|FÜHRERSCHEIN\w*|[Ff]ahrerlaubnis\w*|\bFS\b|[Dd]riving\s+[Ll]icen[cs]e|\b[Ll]icen[cs]e|(?:[Bb]erufs)?[Kk]raftfahrer\w*|(?:LKW|Lkw|Bus)-?[Ff]ahrer\w*|[Ff]ahrer)(?:\s*\((?:m\/w\/d|w\/m\/d|m\/f\/d|d\/m\/w)\))?\s*(?:der\s+|the\s+)?(?:[Kk]lassen?|[Kk]l\.|[Cc]lass(?:es)?|[Cc]ategor(?:y|ies)|[Kk]ategorie|[Kk]at\.)?\s*:?\s*`;
const KL_AFTER = new RegExp(`${KL_CONTEXT}(${KL_LIST})`, "g");
const KL_ONLY = new RegExp(String.raw`(?:\b[Kk]lassen?|\b[Kk]l\.|\b[Cc]lass(?:es)?|\b[Cc]ategor(?:y|ies)|\b[Kk]ategorie)\s*:?\s*(${KL_LIST})`, "g");
const KL_BEFORE = new RegExp(String.raw`(${KL_LIST})\s*-?\s*(?:[Ff]ührerschein|[Ff]ahrerlaubnis|[Ll]icen[cs]e|[Ff]ahrer\b|-[Ff]ahrer)`, "g");
const KL_OLD = /(?:führerschein|fahrerlaubnis)\w*\s*(?:der\s+)?(?:alten\s+|alte\s+)?klasse\s*2\b/i;
const KL_ORDER = ["C1", "C1E", "C", "CE", "D1", "D1E", "D", "DE"];

// Satzteile: Punkt (außer bei Abkürzungen wie „Kl.“ oder „z. B.“), Ausrufe- und Fragezeichen, Zeilen, Aufzählungszeichen, Semikolon
const segments = (text: string) => text.replace(/[ \t ]+/g, " ").split(/(?<!\b(?:[Kk]l|[Zz]|[Bb]|ca|bzw|ggf|inkl|evtl|Nr|u|d|h|Kat|Std))\.(?=\s|$)|[!?\n\r•·;▪]+/);

/** Hinweise für Fahrer- und Logistikstellen aus Titel und Anzeigentext */
export function fahrerHinweise(text: string): FahrerHinweise {
  const segs = segments(text || "");
  const gqTerm = new RegExp(GQ, "i");
  const after = new RegExp(String.raw`(?:${GQ})([^]{0,50}?)\b(?:${GIVEN_AFTER})`, "i");
  const cost = new RegExp(String.raw`(?:${GQ})[^]{0,60}?${GIVEN_COST}`, "i");
  const before = new RegExp(String.raw`\b(?:${GIVEN_BEFORE})\b[^]{0,70}?(?:${GQ})`, "i");
  const given = (s: string) => {
    const a = s.match(after);
    if (a && !BETWEEN_BAD.test(a[1]) && !NEGATED.test(a[0])) return true;
    const c = s.match(cost);
    if (c && !NEGATED.test(c[0])) return true;
    const b = s.match(before);
    return !!b && !NEGATED.test(b[0]) && !REQUIRED_NEXT.test(s.slice((b.index ?? 0) + b[0].length));
  };
  let gqGestellt = false, code95 = false;
  for (const s of segs) {
    if (given(s)) gqGestellt = true;
    else if ((gqTerm.test(s) || /fahrerkarte|driver\s*card|tachograph\s*card/i.test(s)) && !OPTIONAL.test(s) && !/\b(?:nicht|not)\s+(?:erforderlich|notwendig|nötig|required|necessary)/i.test(s)) code95 = true;
  }
  const found = new Set<string>();
  const t = (text || "").replace(/\s+/g, " ").replace(/\b(C1|C|D1|D)\s*\+\s*E\b/g, "$1E");
  for (const re of [KL_AFTER, KL_ONLY, KL_BEFORE]) for (const m of t.matchAll(re)) for (const k of m[1].match(new RegExp(KL_TOKEN, "g")) ?? []) found.add(k);
  if (KL_OLD.test(t)) found.add("CE");
  const westbalkan = /west-?balkan|westlichen\s+balkan|western\s+balkans?|zapadn\w*\s+balkan/i.test(t)
    || segs.some((s) => /serbien|bosnien|kosovo|albanien|mazedonien|montenegro|serbia|bosnia|albania|macedonia/i.test(s) && /willkommen|welcome|erwünscht|gerne|ausdrücklich|encouraged/i.test(s));
  return {
    gqGestellt,
    code95: code95 && !gqGestellt,
    klassen: KL_ORDER.filter((k) => found.has(k)),
    adr: /(?<![A-Za-z])ADR(?![A-Za-z])|gefahrgut\w*|dangerous\s+goods|hazardous\s+(?:goods|materials)|hazmat/i.test(t) && !/\bADR\b\s*(?:nicht|not)/i.test(t),
    stapler: /stapler(?:schein|führerschein|fahrausweis|nachweis|lizenz|fahrer\w*|erfahrung)|gabelstapler\w*|flurförderzeug\w*|forklift|fork-lift|fork\s+lift/i.test(t),
    westbalkan,
  };
}

/** „Nur Stellen mit Grundqualifikation vom Arbeitgeber“ */
export const matchesGq = (t: { hinweise?: FahrerHinweise }, onlyGq: boolean) => !onlyGq || !!t.hinweise?.gqGestellt;

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
  // nur die Datumsfelder übernehmen (current kann ein ganzer Datenbank-Eintrag sein)
  const d: Dates = { appliedAt: current.appliedAt, repliedAt: current.repliedAt, interviewAt: current.interviewAt, closedAt: current.closedAt };
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

/**
 * mailto-Link nach RFC 6068 mit Empfänger, Betreff und Text. Zeilenumbrüche als %0D%0A, das @ bleibt lesbar.
 * Lange Texte werden an einer Zeilen- oder Wortgrenze gekürzt, weil manche Programme (z. B. Outlook unter
 * Windows) Links über etwa 2000 Zeichen nicht öffnen. truncated sagt, ob gekürzt wurde (dann Text kopieren).
 * Ohne gültige Adresse entsteht ein Link ohne Empfänger (die Person trägt ihn im Mailprogramm ein).
 */
export function mailtoLink(to: string | null | undefined, subject: string, body: string, maxLength = 1800): { href: string; truncated: boolean } {
  const addr = isEmail(to) ? to.trim().replace(/[%?&#]/g, (c) => encodeURIComponent(c)) : "";
  const enc = (x: string) => encodeURIComponent(x.replace(/\r?\n/g, "\r\n"));
  const href = (x: string) => `mailto:${addr}?subject=${enc(subject)}&body=${enc(x)}`;
  if (href(body).length <= maxLength) return { href: href(body), truncated: false };
  let b = body;
  while (b.length > 20 && href(b + "\n…").length > maxLength) {
    const cut = Math.max(b.lastIndexOf("\n", b.length - 1), b.lastIndexOf(" ", b.length - 1));
    b = (cut > 20 ? b.slice(0, cut) : b.slice(0, Math.floor(b.length * 0.9))).trimEnd();
  }
  return { href: href(b + "\n…"), truncated: true };
}

/** Kurzform: nur mit gültiger Adresse, sonst null */
export function mailtoHref(to: string, subject: string, body: string, maxLength = 1800): string | null {
  return isEmail(to) ? mailtoLink(to, subject, body, maxLength).href : null;
}

/** Kurzer Begleittext für die E-Mail (das Anschreiben selbst hängt die Person als PDF an) */
export function coverMail(o: { lang: "de" | "en"; title: string; salutation: string; name: string; phone?: string; email?: string }) {
  const lines = o.lang === "en"
    ? [o.salutation, "", `Please find attached my application for the position of ${o.title}, including my cover letter and CV.`, "", "I look forward to hearing from you.", "", "Kind regards", ...[o.name, o.phone, o.email].filter((x): x is string => !!x)]
    : [o.salutation, "", `anbei sende ich Ihnen meine Bewerbung als ${o.title}. Mein Anschreiben und meinen Lebenslauf finden Sie im Anhang.`, "", "Ich freue mich auf Ihre Rückmeldung.", "", "Mit freundlichen Grüßen", ...[o.name, o.phone, o.email].filter((x): x is string => !!x)];
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
