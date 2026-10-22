import "server-only";

// ABGESCHALTET (Weg 1, siehe src/lib/weg1.ts). Die Stellensuche für Kund:innen steht in src/lib/stellensuche.ts.
// Automatische Stellenvorschläge je Buchung: sucht mit mehreren Berufsbezeichnungen und Regionen in der
// Jobbörse der Bundesagentur, lädt die Ausschreibungen und bewertet die Passung zur Bewerbungsmappe.
// Regeln funktionieren immer; ist die KI aktiv, gibt sie zusätzlich eine Einschätzung ab (Mittelwert).
import { prisma } from "@/lib/prisma";
import { searchJobs, jobDetails, jobUrl, type BaJob } from "@/lib/jobs-ba";
import { parseProfile, type ProfileData } from "@/lib/application";
import { withProfile } from "@/lib/mappe";
import { aiEnabled, callAI } from "@/lib/letters";
import { searchAdzuna, searchArbeitnow, type ExtraJob } from "@/lib/jobs-extra";
import { searchFeeds, type FeedJob } from "@/lib/jobs-feeds";
import { WEG1, Weg1Gesperrt } from "@/lib/weg1";

type AnyJob = BaJob & { source?: "BA" | "ADZUNA" | "ARBEITNOW" | "KARRIERESEITE"; description?: string; email?: string | null };

export type SuggestMeta = {
  distanceKm?: number; fulltime: boolean; parttime: boolean; salary?: number | null; publishedAt?: string; startAt?: string;
  externalUrl?: string | null; tasks?: string; requirements?: string; germanRequired?: string | null;
};

const MAX_DETAILS = 60; // so viele Ausschreibungen werden vollständig geladen
const MAX_SAVE = 30; // so viele Vorschläge werden je Lauf gespeichert
const MAX_AI = 30;

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)|[^a-zäöüß0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const words = (s: string) => norm(s).split(" ").filter((w) => w.length > 3);
const split = (s: string | null | undefined) => (s || "").split(/[,;/\n]| oder | und /).map((x) => x.trim()).filter((x) => x.length > 1);

// Gefordertes Deutschniveau aus dem Ausschreibungstext
export function germanRequired(text: string): string | null {
  const t = text.replace(/\s+/g, " ");
  const m = t.match(/deutsch\w*[^.]{0,60}?\b(A1|A2|B1|B2|C1|C2)\b/i) || t.match(/\b(A1|A2|B1|B2|C1|C2)\b[^.]{0,40}?deutsch/i);
  if (m) return m[1].toUpperCase();
  if (/(sehr gute|fließende|verhandlungssichere|exzellente)[^.]{0,30}deutsch/i.test(t)) return "B2";
  if (/gute[^.]{0,20}deutsch/i.test(t)) return "B1";
  if (/(grundkenntnisse|grundlegende)[^.]{0,30}deutsch/i.test(t)) return "A2";
  return null;
}

function candidateGerman(d: ProfileData): string | null {
  const l = d.languages.find((x) => /deutsch|german|allemand/i.test(x.name));
  const m = l?.level.toUpperCase().match(/A1|A2|B1|B2|C1|C2/);
  if (m) return m[0];
  if (l && /muttersprache|native/i.test(l.level)) return "C2";
  return null;
}

// Abschnitte aus dem Freitext („Ihre Aufgaben“, „Ihr Profil“): Überschrift ist eine kurze eigene Zeile,
// der Abschnitt endet an der nächsten Überschrift
const TASKS = /(aufgaben|aufgabengebiet|tätigkeit|stellenbeschreibung|verantwortlich für|das erwartet (sie|dich)|was (sie|dich|du) erwartet)/i;
const REQS = /(bringst du mit|bringen sie\b.*\bmit|anforderung|(ihr|dein|ideales) profil|qualifikation|voraussetzung|sie für uns|kompetenzen|wichtig sind uns|wir erwarten|was wir uns wünschen)/i;
const OTHER = /(wir bieten|bieten wir|wir für sie|unser angebot|vorteile|benefits|kontakt|ansprechpartner|über uns|wer wir sind|bewerb|arbeitsort|einsatzort|standort|arbeitszeit|gehalt|einarbeitung)/i;
const clean = (l: string) => l.replace(/\*\*|__|#+/g, "").trim();
const isHeading = (l: string) => { const c = clean(l); return c.length > 2 && c.length < 70 && !/^[-•*·–]/.test(l.trim()) && (/:$/.test(c) || TASKS.test(c) || REQS.test(c) || OTHER.test(c)) && !/^(unser|über)/i.test(c); };

function sections(text: string) {
  const lines = text.split("\n");
  const grab = (re: RegExp) => {
    const i = lines.findIndex((l) => isHeading(l) && re.test(clean(l)) && !(re === TASKS && OTHER.test(clean(l))));
    if (i < 0) return undefined;
    const out: string[] = [];
    for (const l of lines.slice(i + 1)) { if (isHeading(l) && out.length) break; const c = clean(l); if (c) out.push(c); }
    const t = out.join("\n");
    return t ? (t.length > 450 ? t.slice(0, 450).replace(/\s\S*$/, "") + " …" : t) : undefined;
  };
  return { tasks: grab(TASKS), requirements: grab(REQS) };
}

type Scored = { job: BaJob; score: number; notes: string[]; description?: string; email?: string | null; meta: SuggestMeta };

function titleScore(job: BaJob, terms: string[]) {
  const t = norm(`${job.title} ${job.profession ?? ""}`);
  if (terms.some((x) => t.includes(norm(x)))) return { pts: 40, note: "Beruf passt genau" };
  const tw = new Set(words(t));
  if (terms.some((x) => words(x).some((w) => tw.has(w) || [...tw].some((y) => y.startsWith(w.slice(0, 6)))))) return { pts: 28, note: "Beruf passt teilweise" };
  return { pts: 12, note: "Beruf nur verwandt" };
}

function baseScore(job: BaJob, terms: string[], hasRegion: boolean) {
  const notes: string[] = [];
  const t = titleScore(job, terms); notes.push(t.note);
  let pts = t.pts;
  if (hasRegion && job.distanceKm !== undefined) {
    const d = job.distanceKm;
    pts += d <= 25 ? 15 : d <= 50 ? 10 : d <= 100 ? 5 : 0;
    notes.push(`${d} km entfernt`);
  } else pts += 10;
  const days = job.publishedAt ? (Date.now() - new Date(job.publishedAt).getTime()) / 864e5 : 60;
  pts += days <= 14 ? 5 : days <= 30 ? 3 : 1;
  if (days <= 14) notes.push("neu ausgeschrieben");
  return { pts, notes };
}

async function aiRating(d: ProfileData, s: Scored): Promise<{ score: number; note: string } | null> {
  const profile = {
    beruf: d.targetJob, erfahrung: d.experience.filter((x) => x.title).slice(0, 4).map((x) => `${x.title} (${x.from}–${x.to})`),
    ausbildung: d.education.filter((x) => x.title).slice(0, 3).map((x) => x.title), sprachen: d.languages.filter((x) => x.name).map((x) => `${x.name} ${x.level}`),
    kenntnisse: d.skills.slice(0, 300), fuehrerschein: d.drivingLicense,
  };
  const prompt = `Bewerberprofil: ${JSON.stringify(profile)}\n\nStelle: ${s.job.title} bei ${s.job.company} in ${s.job.city}\nAusschreibung (Auszug):\n${(s.description || "").slice(0, 2000)}`;
  const system = `Du bewertest, wie gut eine Stelle zu einem Bewerberprofil passt. Antworte nur mit JSON: {"score": Zahl 0 bis 100, "note": "ein kurzer sachlicher Satz auf Deutsch, was passt oder fehlt"}. Bewerte streng nach Beruf, geforderter Qualifikation, Erfahrung und Deutschniveau. Nichts erfinden.`;
  const out = await callAI(prompt, system);
  const m = out?.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    const score = Math.max(0, Math.min(100, Math.round(Number(j.score))));
    return Number.isFinite(score) ? { score, note: String(j.note || "").slice(0, 300) } : null;
  } catch { return null; }
}

async function pool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

// Läuft für eine Buchung; neue Vorschläge werden gespeichert, vorhandene Stellen übersprungen
export async function suggestJobs(bookingId: string): Promise<{ added: number; searched: number; terms: string[]; regions: string[] }> {
  if (!WEG1.teamStellenauswahl) throw new Weg1Gesperrt("Stellenvorschläge des Teams je Kund:in");
  const { booking, profile } = await withProfile(bookingId);
  const d = parseProfile(profile.data);

  const termSet = new Map<string, string>();
  for (const t of [...split(booking.targetJobs), d.targetJob, d.experience.find((x) => x.title)?.title ?? ""]) {
    const k = norm(t); if (k && !termSet.has(k)) termSet.set(k, t.trim());
  }
  const terms = [...termSet.values()].slice(0, 4);
  if (!terms.length) throw new Error("Für die Suche fehlt ein Wunschberuf (Buchung oder Mappe).");
  const regions = split(booking.targetRegions).filter((r) => !/deutschland|egal|bundesweit|überall/i.test(r)).slice(0, 3);

  const found = new Map<string, AnyJob>();
  for (const was of terms) {
    for (const wo of regions.length ? regions : [undefined]) {
      try {
        const r = await searchJobs({ was, wo, umkreis: 50, size: 50 });
        for (const j of r.jobs) if (!found.has(j.ref)) found.set(j.ref, j);
      } catch (e) { console.error("[suggest] Suche", was, wo, e instanceof Error ? e.message : e); }
    }
  }
  // Weitere Quellen: Adzuna (wenn Schlüssel hinterlegt) und Arbeitnow (offen, ohne Anmeldung)
  const extra: (ExtraJob | FeedJob)[] = [];
  for (const was of terms) for (const wo of regions.length ? regions : [undefined]) extra.push(...(await searchAdzuna(was, wo).catch((e) => { console.error("[suggest] Adzuna", e instanceof Error ? e.message : e); return []; })));
  extra.push(...(await searchArbeitnow(terms, regions).catch(() => [])));
  extra.push(...(await searchFeeds(terms, regions).catch(() => [])));
  // Dubletten über Quellen hinweg (gleiche Firma + Titel) nur einmal
  const seen = new Set([...found.values()].map((j) => `${norm(j.company)}|${norm(j.title)}`));
  for (const j of extra) { const k = `${norm(j.company)}|${norm(j.title)}`; if (!found.has(j.ref) && !seen.has(k)) { seen.add(k); found.set(j.ref, j); } }
  const known = new Set((await prisma.jobLead.findMany({ where: { bookingId }, select: { sourceRef: true } })).map((x) => x.sourceRef));
  const fresh = [...found.values()].filter((j) => !known.has(j.ref));

  // Vorauswahl ohne Ausschreibungstext, dann Details für die besten laden
  const pre = fresh.map((job) => ({ job, ...baseScore(job, terms, regions.length > 0) })).sort((a, b) => b.pts - a.pts).slice(0, MAX_DETAILS);
  const level = candidateGerman(d);
  const hasEdu = d.education.some((x) => x.title);
  const expWords = new Set(d.experience.flatMap((x) => words(x.title)));

  const scored: Scored[] = await pool(pre, 5, async ({ job, pts, notes }) => {
    const own = (job as AnyJob).source && (job as AnyJob).source !== "BA";
    const det = own ? { description: (job as AnyJob).description ?? "", emails: (job as AnyJob).email ? [(job as AnyJob).email!] : [] } : await jobDetails(job.ref);
    const text = det?.description ?? "";
    const email = det?.emails[0] ?? null;
    const n = [...notes];
    let p = pts;
    const req = text ? germanRequired(text) : null;
    if (req && level) {
      const diff = LEVELS.indexOf(level) - LEVELS.indexOf(req);
      if (diff >= 0) { p += 20; n.push(`Deutsch ${req} verlangt, vorhanden ${level}`); }
      else if (diff === -1) { p += 10; n.push(`Deutsch ${req} verlangt, vorhanden ${level} (knapp)`); }
      else n.push(`Deutsch ${req} verlangt, vorhanden nur ${level}`);
    } else { p += 12; if (req) n.push(`Deutsch ${req} verlangt, Niveau des Kunden unbekannt`); }
    if (email) { p += 10; n.push("Bewerbung per E-Mail möglich"); }
    else if (job.externalUrl) { p += 3; n.push("nur über Firmenseite"); }
    else n.push("keine Bewerbungs-E-Mail gefunden");
    const needsQuali = /abgeschlossene[^.]{0,30}(ausbildung|studium)|examiniert|staatlich anerkannt/i.test(text);
    const expMatch = words(`${job.title} ${job.profession ?? ""}`).some((w) => expWords.has(w));
    if (expMatch) { p += 10; n.push("passende Berufserfahrung"); }
    else if (needsQuali && !hasEdu) n.push("verlangt abgeschlossene Ausbildung");
    else p += 5;
    return {
      job, score: Math.min(100, p), notes: n, description: text || undefined, email,
      meta: { distanceKm: job.distanceKm, fulltime: job.fulltime, parttime: job.parttime, salary: job.salary, publishedAt: job.publishedAt, startAt: job.startAt, externalUrl: job.externalUrl, germanRequired: req,
        ...sections(text) },
    };
  });

  scored.sort((a, b) => b.score - a.score);
  // Höchstens zwei Vorschläge je Firma (auch über frühere Läufe), damit sich die 25 Bewerbungen verteilen
  const perCompany = new Map<string, number>();
  for (const l of await prisma.jobLead.findMany({ where: { bookingId, status: { not: "HIDDEN" } }, select: { company: true } })) perCompany.set(norm(l.company), (perCompany.get(norm(l.company)) ?? 0) + 1);
  const top = scored.filter((x) => { const k = norm(x.job.company); const n = perCompany.get(k) ?? 0; if (n >= 2) return false; perCompany.set(k, n + 1); return true; }).slice(0, MAX_SAVE);

  const ai = aiEnabled() ? await pool(top.slice(0, MAX_AI), 3, (s) => aiRating(d, s).catch(() => null)) : [];
  let added = 0;
  for (const [i, s] of top.entries()) {
    const r = ai[i];
    const score = r ? Math.round((s.score + r.score) / 2) : s.score;
    try {
      await prisma.jobLead.create({
        data: {
          bookingId, source: (s.job as AnyJob).source ?? "BA", sourceRef: s.job.ref, status: "SUGGESTED", title: s.job.title.slice(0, 200), company: s.job.company.slice(0, 200), city: s.job.city || null,
          url: (s.job as AnyJob).source && (s.job as AnyJob).source !== "BA" ? s.job.url : jobUrl(s.job.ref), applyUrl: s.job.externalUrl ?? null, email: s.email, description: s.description?.slice(0, 20000) ?? null,
          score, matchNotes: JSON.stringify(s.notes), aiNote: r?.note || null, meta: JSON.stringify(s.meta),
        },
      });
      added++;
    } catch { /* schon vorhanden (paralleler Lauf) */ }
  }
  return { added, searched: found.size, terms, regions };
}
