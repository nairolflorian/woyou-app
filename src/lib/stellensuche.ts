import "server-only";

// Weg 1: Stellensuche als Werkzeug für Kund:innen. Die Person sucht selbst, filtert selbst und merkt sich
// Stellen selbst. WoYou wählt nichts aus, schlägt keine Stellen je Person vor und hat keinen Kontakt zu Firmen.
// Quellen mit offizieller, offener Schnittstelle: Jobbörse der Bundesagentur, Arbeitnow, Karriereseiten-Feeds
// (Personio, Greenhouse, Lever) und Adzuna (aktiv, sobald ADZUNA_APP_ID/ADZUNA_APP_KEY gesetzt sind).
// An die Quellen gehen nur Suchbegriff und Ort, keine Daten über die Person.
import { prisma } from "@/lib/prisma";
import { searchJobs, jobDetails, jobUrl, extractEmails } from "@/lib/jobs-ba";
import { searchAdzuna, searchArbeitnow, adzunaEnabled } from "@/lib/jobs-extra";
import { searchFeeds } from "@/lib/jobs-feeds";
import { parseProfile, type ProfileData } from "@/lib/application";
import {
  germanRequired, germanFit, parseLevel, matchesHours, matchesGerman, dedupe, rank, trefferKey, isEmail, isHttpUrl,
  type Treffer, type Hours, type Level, type Source,
} from "@/lib/stellensuche-core";

export type SuchFilter = { was: string; wo?: string; umkreis?: number; arbeitszeit: Hours; deutsch: Level | null; nurPassend: boolean; seite: number };

const PAGE = 25;
const DETAILS = 25; // so viele BA-Anzeigen je Seite werden für den Deutsch-Hinweis vollständig geladen

// Kurzzeit-Speicher der Treffer mit Ausschreibungstext, damit „Merken“ ohne erneute Suche alles übernehmen kann
type Full = Treffer & { description: string | null };
const memo = new Map<string, { at: number; t: Full }>();
const remember = (t: Full) => { memo.set(t.key, { at: Date.now(), t }); if (memo.size > 5000) for (const [k, v] of memo) if (Date.now() - v.at > 3600e3) memo.delete(k); };
export function rememberedTreffer(key: string): Full | null {
  const m = memo.get(key);
  return m && Date.now() - m.at < 6 * 3600e3 ? m.t : null;
}

async function pool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

export async function sucheStellen(f: SuchFilter): Promise<{ treffer: Treffer[]; total: number; mehr: boolean; quellen: { name: string; ok: boolean }[] }> {
  const quellen: { name: string; ok: boolean }[] = [];
  const list: Full[] = [];
  let total = 0;

  // 1) Jobbörse der Bundesagentur (mit Seiten)
  try {
    const r = await searchJobs({ was: f.was, wo: f.wo || undefined, umkreis: f.umkreis ?? 25, page: f.seite, size: PAGE, arbeitszeit: f.arbeitszeit === "vollzeit" ? "vz" : f.arbeitszeit === "teilzeit" ? "tz" : undefined });
    total += r.total;
    const det = await pool(r.jobs.slice(0, DETAILS), 6, (j) => jobDetails(j.ref).catch(() => null));
    r.jobs.forEach((j, i) => {
      const d = det[i];
      const req = d?.description ? germanRequired(d.description) : null;
      list.push({
        key: trefferKey("BA", j.ref), source: "BA", ref: j.ref, title: j.title, company: j.company, city: j.city, url: j.url || jobUrl(j.ref),
        applyUrl: isHttpUrl(j.externalUrl) ? j.externalUrl : null, email: d?.emails[0] ?? null, distanceKm: j.distanceKm, publishedAt: j.publishedAt,
        fulltime: j.fulltime, parttime: j.parttime, germanRequired: req, fit: germanFit(req, f.deutsch), description: d?.description?.slice(0, 20000) ?? null,
      });
    });
    quellen.push({ name: "BA", ok: true });
  } catch {
    quellen.push({ name: "BA", ok: false });
  }

  // 2) Weitere Quellen nur auf der ersten Seite (liefern keine Seiten, nur die neuesten Anzeigen)
  if (f.seite === 1) {
    const regions = f.wo ? [f.wo] : [];
    const extra = await Promise.all([
      searchArbeitnow([f.was], regions).then((x) => { quellen.push({ name: "ARBEITNOW", ok: true }); return x; }).catch(() => { quellen.push({ name: "ARBEITNOW", ok: false }); return []; }),
      searchFeeds([f.was], regions).then((x) => { if (x.length) quellen.push({ name: "KARRIERESEITE", ok: true }); return x; }).catch(() => []),
      adzunaEnabled() ? searchAdzuna(f.was, f.wo || undefined).then((x) => { quellen.push({ name: "ADZUNA", ok: true }); return x; }).catch(() => { quellen.push({ name: "ADZUNA", ok: false }); return []; }) : Promise.resolve([]),
    ]);
    for (const j of extra.flat()) {
      const req = germanRequired(j.description);
      const email = j.email ?? extractEmails(j.description)[0] ?? null;
      list.push({
        key: trefferKey(j.source, j.ref), source: j.source as Source, ref: j.ref, title: j.title, company: j.company, city: j.city, url: j.url,
        applyUrl: isHttpUrl(j.externalUrl) ? j.externalUrl : null, email, publishedAt: j.publishedAt, fulltime: j.fulltime, parttime: j.parttime,
        germanRequired: req, fit: germanFit(req, f.deutsch), description: j.description.slice(0, 20000),
      });
      total++;
    }
  }

  const filtered = rank(dedupe(list).filter((t) => matchesHours(t, f.arbeitszeit) && matchesGerman(t, f.nurPassend)), f.was);
  filtered.forEach(remember);
  return {
    treffer: filtered.map(({ description: _d, ...t }) => t),
    total,
    mehr: f.seite * PAGE < total && quellen.some((q) => q.name === "BA" && q.ok),
    quellen,
  };
}

// ---------- Profil der Person: Mappe (falls vorhanden) und Kundenprofil ----------
export async function profileForCandidate(candidateId: string) {
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, include: { user: true } });
  const b = await prisma.serviceBooking.findFirst({ where: { candidateId, status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" }, include: { profile: true } });
  const data: ProfileData | null = b?.profile ? parseProfile(b.profile.data) : null;
  const dataEn: ProfileData | null = b?.profile?.dataEn ? { ...parseProfile(b.profile.dataEn), design: data?.design ?? parseProfile(null).design } : null;
  const german = parseLevel(data?.languages.find((l) => /deutsch|german|allemand/i.test(l.name))?.level) ?? parseLevel(c.germanLevel);
  return { candidate: c, booking: b, data, dataEn, german };
}

/** Eingaben aus dem Browser für eine selbst eingetragene Stelle prüfen */
export function cleanManual(x: { title?: unknown; company?: unknown; city?: unknown; url?: unknown; email?: unknown }) {
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const title = s(x.title, 200), company = s(x.company, 200);
  if (title.length < 2 || company.length < 2) return null;
  const url = s(x.url, 1000), email = s(x.email, 200);
  return { title, company, city: s(x.city, 120) || null, url: isHttpUrl(url) ? url : null, email: isEmail(email) ? email : null };
}
